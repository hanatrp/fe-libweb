import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { db, Carbon } from "./server/db.ts";
import http from "http";
import https from "https";

dotenv.config();

const app = express();
const PORT = 3000;

// Proxy /api requests to Laravel Backend
app.use("/api", (req, res) => {
  console.log(`[Proxy Request] ${req.method} ${req.originalUrl}`);
  
  let targetUrl: URL;
  try {
    const rawUrl = process.env.VITE_API_BASE_URL || "https://libweb.my.id/public/api";
    targetUrl = new URL(rawUrl);
  } catch (e) {
    targetUrl = new URL("https://libweb.my.id/public/api");
  }

  // Replace /api prefix with target pathname (e.g. /public/api or /api)
  const targetPath = req.originalUrl.replace(/^\/api/, targetUrl.pathname.replace(/\/$/, ""));

  const isHttps = targetUrl.protocol === "https:";
  const port = targetUrl.port ? parseInt(targetUrl.port) : (isHttps ? 443 : 80);

  const options: any = {
    hostname: targetUrl.hostname,
    port: port,
    path: targetPath,
    method: req.method,
    headers: { ...req.headers }
  };

  // Set Host header correctly for the backend target
  if (options.headers) {
    const hostValue = targetUrl.port ? `${targetUrl.hostname}:${targetUrl.port}` : targetUrl.hostname;
    options.headers.host = hostValue;
    delete options.headers.connection;
    delete options.headers.host;
    options.headers.Host = hostValue;
  }

  console.log(`[Proxy Target] ${targetUrl.protocol}//${options.hostname}:${options.port}${options.path}`);
  console.log(`[Proxy Headers]`, JSON.stringify(options.headers));

  const requestLib = isHttps ? https : http;
  const proxyReq = requestLib.request(options, (proxyRes) => {
    console.log(`[Proxy Response] ${proxyRes.statusCode} for ${req.originalUrl}`);
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err);
    res.status(502).send(`Bad Gateway: Backend Laravel tidak aktif di ${targetUrl.origin}`);
  });

  req.pipe(proxyReq);
});

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to extract authenticated user from simple Authorization header or query param
// This makes simulation extremely friendly - the frontend can pass "Authorization: bearer usr_1" or "?token=usr_1" to switch roles instantly!
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) return null;
  return db.users.find(token) || null;
}

// ==========================================
// 🛡️ AUTHENTICATION & PROFILE API
// ==========================================

// Login Route
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  const user = db.users.findByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Email atau password salah." });
  }

  res.json({
    message: "Login berhasil",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: user.id,
  });
});

// Register Route
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Semua data wajib diisi." });
  }

  const existing = db.users.findByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "Email sudah terdaftar." });
  }

  try {
    const user = db.users.create({
      name,
      email,
      password,
      role: "member",
    });

    res.status(201).json({
      message: "Registrasi siswa berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: user.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Terjadi kesalahan sistem." });
  }
});

// Get current profile
app.get("/api/auth/me", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu." });
  }
  res.json({ user });
});

// Update current profile / settings
app.post("/api/auth/profile/update", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Nama dan email tidak boleh kosong." });
  }

  // Check unique email if changing
  if (email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = db.users.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Email sudah digunakan oleh akun lain." });
    }
  }

  try {
    const updates: any = { name, email };
    if (password) updates.password = password;

    const updated = db.users.update(user.id, updates);
    res.json({ message: "Profil berhasil diperbarui", user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gagal memperbarui profil." });
  }
});


// ==========================================
// 📚 CATALOGUE & BOOK API
// ==========================================

// Get all books (with optional filters/search)
app.get("/api/books", (req, res) => {
  const user = getAuthUser(req);
  const includeDeleted = user?.role === "admin" && req.query.include_deleted === "true";

  let books = db.books.all(includeDeleted);

  // Search filter
  const search = req.query.search ? String(req.query.search).toLowerCase().trim() : "";
  if (search) {
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search) ||
        b.isbn.toLowerCase().includes(search) ||
        b.category.toLowerCase().includes(search)
    );
  }

  // Category filter
  const category = req.query.category ? String(req.query.category).trim() : "";
  if (category) {
    books = books.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }

  // Type filter
  const type = req.query.type ? String(req.query.type).trim() : "";
  if (type === "ebook") {
    books = books.filter((b) => b.is_ebook);
  } else if (type === "physical") {
    books = books.filter((b) => !b.is_ebook);
  }

  res.json({ books });
});

// Get single book detail
app.get("/api/books/:id", (req, res) => {
  const book = db.books.find(req.params.id);
  if (!book) {
    return res.status(404).json({ error: "Buku tidak ditemukan." });
  }
  res.json({ book });
});

// Admin: Create Book
app.post("/api/books", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak. Hanya Petugas/Admin yang dapat menambah buku." });
  }

  const { title, author, publisher, year, isbn, total_stock, category, cover_url, is_ebook, ebook_content } = req.body;
  if (!title || !author || !isbn || total_stock === undefined) {
    return res.status(400).json({ error: "Judul, pengarang, ISBN, dan total stok wajib diisi." });
  }

  try {
    const book = db.books.create({
      title,
      author,
      publisher: publisher || "Penerbit Umum",
      year: parseInt(year) || new Date().getFullYear(),
      isbn,
      stock: parseInt(total_stock),
      total_stock: parseInt(total_stock),
      category: category || "Umum",
      cover_url: cover_url || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
      is_ebook: !!is_ebook,
      ebook_content: is_ebook ? (ebook_content || "# E-Book Content") : null,
    });

    res.status(201).json({ message: "Buku berhasil ditambahkan ke katalog", book });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gagal menambahkan buku." });
  }
});

// Admin: Update Book
app.put("/api/books/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const { title, author, publisher, year, isbn, total_stock, category, cover_url, is_ebook, ebook_content } = req.body;
  const currentBook = db.books.find(req.params.id);
  if (!currentBook) {
    return res.status(404).json({ error: "Buku tidak ditemukan." });
  }

  try {
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (author !== undefined) updates.author = author;
    if (publisher !== undefined) updates.publisher = publisher;
    if (year !== undefined) updates.year = parseInt(year);
    if (isbn !== undefined) updates.isbn = isbn;
    if (category !== undefined) updates.category = category;
    if (cover_url !== undefined) updates.cover_url = cover_url;
    if (is_ebook !== undefined) {
      updates.is_ebook = !!is_ebook;
      updates.ebook_content = is_ebook ? (ebook_content || "# Content") : null;
    }

    if (total_stock !== undefined) {
      const parsedTotal = parseInt(total_stock);
      // Adjust current stock proportionally to change in total stock
      const difference = parsedTotal - currentBook.total_stock;
      const newStock = currentBook.stock + difference;

      if (newStock < 0) {
        return res.status(400).json({ error: "Total stok tidak bisa dikurangi melebihi sisa stok yang ada saat ini." });
      }
      updates.total_stock = parsedTotal;
      updates.stock = newStock;
    }

    const updated = db.books.update(req.params.id, updates);
    res.json({ message: "Data buku berhasil diperbarui", book: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gagal memperbarui buku." });
  }
});

// Admin: Delete Book (SoftDelete)
app.delete("/api/books/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const deleted = db.books.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Buku tidak ditemukan." });
  }
  res.json({ message: "Buku berhasil dihapus secara lunak (SoftDelete)" });
});

// Admin: Restore Deleted Book
app.post("/api/books/:id/restore", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const restored = db.books.restore(req.params.id);
  if (!restored) {
    return res.status(404).json({ error: "Buku tidak ditemukan." });
  }
  res.json({ message: "Buku berhasil dipulihkan dari daftar SoftDelete" });
});


// ==========================================
// 🧑‍💼 USER MANAGEMENT API (ADMIN ONLY)
// ==========================================

// Get all users
app.get("/api/users", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const includeDeleted = req.query.include_deleted === "true";
  const users = db.users.all(includeDeleted);
  res.json({ users });
});

// Add new user
app.post("/api/users", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Nama, email, password, dan peran (role) wajib diisi." });
  }

  const existing = db.users.findByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "Email sudah digunakan." });
  }

  try {
    const newUser = db.users.create({ name, email, password, role });
    res.status(201).json({ message: "Pengguna berhasil ditambahkan", user: newUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user details or role
app.put("/api/users/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const { name, email, role, password } = req.body;
  try {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const existing = db.users.findByEmail(email);
      if (existing && existing.id !== req.params.id) {
        return res.status(400).json({ error: "Email sudah terdaftar pada pengguna lain." });
      }
      updates.email = email;
    }
    if (role !== undefined) updates.role = role;
    if (password !== undefined && password !== "") updates.password = password;

    const updated = db.users.update(req.params.id, updates);
    res.json({ message: "Profil pengguna berhasil diperbarui", user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete User (SoftDelete)
app.delete("/api/users/:id", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  if (user.id === req.params.id) {
    return res.status(400).json({ error: "Anda tidak dapat menghapus akun Anda sendiri." });
  }

  const deleted = db.users.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Pengguna tidak ditemukan." });
  }
  res.json({ message: "Pengguna berhasil dinonaktifkan (SoftDelete)" });
});

// Restore User
app.post("/api/users/:id/restore", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const restored = db.users.restore(req.params.id);
  if (!restored) {
    return res.status(404).json({ error: "Pengguna tidak ditemukan." });
  }
  res.json({ message: "Pengguna berhasil diaktifkan kembali" });
});


// ==========================================
// 🔄 LOAN & CIRCULATION API
// ==========================================

// Get loans (Admin sees all, Member sees their own)
app.get("/api/loans", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Silakan login terlebih dahulu." });
  }

  let loans = [];
  if (user.role === "admin") {
    loans = db.loans.all();
  } else {
    loans = db.loans.findByUser(user.id);
  }

  // Enrich with User and Book metadata
  const enriched = loans.map((loan) => {
    const loanUser = db.users.find(loan.user_id);
    const loanBook = db.books.find(loan.book_id);
    return {
      ...loan,
      user_name: loanUser ? loanUser.name : "Anggota Terhapus",
      user_email: loanUser ? loanUser.email : "",
      book_title: loanBook ? loanBook.title : "Buku Terhapus",
      book_author: loanBook ? loanBook.author : "",
      book_isbn: loanBook ? loanBook.isbn : "",
      book_cover: loanBook ? loanBook.cover_url : "",
    };
  });

  res.json({ loans: enriched });
});

// Borrow Book (Sirkulasi Pinjam)
app.post("/api/loans/borrow", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { book_id, student_id } = req.body;
  if (!book_id) {
    return res.status(400).json({ error: "Pilih buku yang ingin dipinjam." });
  }

  // If Admin borrows, they specify which student borrows. If member borrows, they borrow for themselves.
  const targetUserId = user.role === "admin" ? student_id : user.id;
  if (!targetUserId) {
    return res.status(400).json({ error: "Tentukan anggota yang meminjam buku." });
  }

  try {
    const loan = db.loans.borrow(targetUserId, book_id);
    const book = db.books.find(book_id);
    const targetUser = db.users.find(targetUserId);

    res.status(201).json({
      message: `Peminjaman buku "${book?.title}" berhasil dicatat untuk ${targetUser?.name}.`,
      loan,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Transaksi peminjaman gagal." });
  }
});

// Return Book (Sirkulasi Kembali)
app.post("/api/loans/:id/return", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const loan = db.loans.return(req.params.id);
    const book = db.books.find(loan.book_id);
    let msg = `Buku "${book?.title}" berhasil dikembalikan.`;
    if (loan.fine_amount > 0) {
      msg += ` Terlambat pengembalian, denda terkumpul sebesar Rp${loan.fine_amount.toLocaleString("id-ID")}.`;
    } else {
      msg += ` Tepat waktu, denda Rp0.`;
    }

    res.json({ message: msg, loan });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Proses pengembalian gagal." });
  }
});


// ==========================================
// ⚙️ SYSTEM SETTINGS API
// ==========================================

// Get system settings
app.get("/api/settings", (req, res) => {
  res.json({ settings: db.settings.get() });
});

// Update settings (Admin only)
app.post("/api/settings", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const { fine_rate, max_loan_days } = req.body;
  if (fine_rate === undefined && max_loan_days === undefined) {
    return res.status(400).json({ error: "Kirim data tarif denda atau durasi pinjam yang ingin diubah." });
  }

  try {
    const updates: any = {};
    if (fine_rate !== undefined) updates.fine_rate = parseInt(fine_rate);
    if (max_loan_days !== undefined) updates.max_loan_days = parseInt(max_loan_days);

    const settings = db.settings.update(updates);
    res.json({ message: "Pengaturan sirkulasi berhasil diperbarui", settings });
  } catch (error: any) {
    res.status(500).json({ error: "Gagal memperbarui pengaturan." });
  }
});


// ==========================================
// 📊 ANALYTICS & REPORTS API
// ==========================================

app.get("/api/reports/analytics", (req, res) => {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Akses ditolak." });
  }

  const books = db.books.all(true);
  const users = db.users.all(true);
  const loans = db.loans.all();

  // 1. Calculations
  const totalBooks = books.filter((b) => b.deleted_at === null).length;
  const totalPhysicalStock = books
    .filter((b) => b.deleted_at === null && !b.is_ebook)
    .reduce((sum, b) => sum + b.total_stock, 0);
  const totalEbooks = books.filter((b) => b.deleted_at === null && b.is_ebook).length;

  const totalMembers = users.filter((u) => u.role === "member" && u.deleted_at === null).length;

  const activeLoans = loans.filter((l) => l.status !== "returned");
  const totalBorrowedCount = activeLoans.length;

  const overdueCount = loans.filter((l) => l.status === "overdue").length;

  const totalFinesCollected = loans
    .filter((l) => l.status === "returned")
    .reduce((sum, l) => sum + l.fine_amount, 0);
  const totalPendingFines = loans
    .filter((l) => l.status === "overdue")
    .reduce((sum, l) => sum + l.fine_amount, 0);

  // 2. Category distribution
  const categories: Record<string, number> = {};
  books.filter((b) => b.deleted_at === null).forEach((b) => {
    categories[b.category] = (categories[b.category] || 0) + 1;
  });
  const categoryDistribution = Object.keys(categories).map((name) => ({
    name,
    value: categories[name],
  }));

  // 3. Popular books (by borrow count)
  const bookBorrowCounts: Record<string, { title: string; count: number; author: string }> = {};
  books.forEach((b) => {
    bookBorrowCounts[b.id] = { title: b.title, count: 0, author: b.author };
  });
  loans.forEach((l) => {
    if (bookBorrowCounts[l.book_id]) {
      bookBorrowCounts[l.book_id].count += 1;
    }
  });
  const popularBooks = Object.values(bookBorrowCounts)
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Last 7 days circulation trend
  const trend: Record<string, { pinjam: number; kembali: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split("T")[0];
    trend[dateString] = { pinjam: 0, kembali: 0 };
  }

  loans.forEach((l) => {
    const borrowDateStr = l.borrow_date.split("T")[0];
    if (trend[borrowDateStr] !== undefined) {
      trend[borrowDateStr].pinjam += 1;
    }
    if (l.return_date) {
      const returnDateStr = l.return_date.split("T")[0];
      if (trend[returnDateStr] !== undefined) {
        trend[returnDateStr].kembali += 1;
      }
    }
  });

  const circulationTrend = Object.keys(trend).map((date) => ({
    date,
    borrowed: trend[date].pinjam,
    returned: trend[date].kembali,
  }));

  res.json({
    summary: {
      totalBooks,
      totalPhysicalStock,
      totalEbooks,
      totalMembers,
      totalBorrowedCount,
      overdueCount,
      totalFinesCollected,
      totalPendingFines,
    },
    categoryDistribution,
    popularBooks,
    circulationTrend,
  });
});


// ==========================================
// 🤖 GEMINI CHATBOT HELPER & API
// ==========================================

// Simple offline rule-based responder when GEMINI_API_KEY is not configured
function fallbackBotAnswer(message: string, userId: string): string {
  const msg = message.toLowerCase();
  const user = db.users.find(userId);
  const activeLoans = db.loans.findByUser(userId).filter((l) => l.status !== "returned");
  const overdueCount = activeLoans.filter((l) => l.status === "overdue").length;
  const pendingFine = activeLoans.reduce((sum, l) => sum + l.fine_amount, 0);

  if (msg.includes("denda") || msg.includes("tarif") || msg.includes("bayar")) {
    const rate = db.settings.get().fine_rate;
    if (pendingFine > 0) {
      return `Halo ${user?.name || "Siswa"}, Anda memiliki denda aktif sebesar Rp${pendingFine.toLocaleString("id-ID")} karena ada ${overdueCount} buku yang terlambat dikembalikan. Tarif denda saat ini adalah Rp${rate.toLocaleString("id-ID")} per hari keterlambatan.`;
    }
    return `Halo ${user?.name || "Siswa"}, Anda bebas denda! Tidak ada tagihan denda keterlambatan saat ini. Tarif denda perpustakaan adalah Rp${rate.toLocaleString("id-ID")} per hari jika buku dikembalikan melewati tanggal jatuh tempo.`;
  }

  if (msg.includes("pinjam") || msg.includes("sirkulasi") || msg.includes("cara")) {
    const maxDays = db.settings.get().max_loan_days;
    return `Untuk meminjam buku di LibWeb, cari buku pilihan Anda di katalog, lalu klik tombol "Pinjam" pada buku fisik. Anda memiliki durasi maksimal ${maxDays} hari untuk membawanya pulang. E-Book dapat dibaca langsung kapan saja tanpa mengurangi kuota fisik!`;
  }

  if (msg.includes("rekomendasi") || msg.includes("buku") || msg.includes("bagus")) {
    const books = db.books.all().slice(0, 3);
    const titles = books.map((b) => `"${b.title}" oleh ${b.author} (${b.category})`).join(", ");
    return `Tentu! Berikut beberapa buku populer yang bisa Anda baca saat ini: ${titles}. E-Book "Belajar TypeScript & React" sangat kami rekomendasikan bagi yang berminat di bidang pemrograman!`;
  }

  return `Halo ${user?.name || "Siswa"}! Saya dapat mendengar Anda. Untuk membantu Anda secara optimal dengan kecerdasan AI tingkat lanjut, pastikan kunci API Gemini ditambahkan di pengaturan rahasia (Secrets). Di mode offline ini, saya bisa menjawab seputar: denda keterlambatan, sirkulasi pinjam, dan rekomendasi buku perpustakaan!`;
}

// Get Chat history
app.get("/api/chat", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  res.json({ history: db.chatMessages.findByUser(user.id) });
});

// Clear Chat History
app.delete("/api/chat", (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  db.chatMessages.clearHistory(user.id);
  res.json({ message: "Riwayat percakapan berhasil dibersihkan", history: db.chatMessages.findByUser(user.id) });
});

// Send Chat Message
app.post("/api/chat", async (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  }

  try {
    // 1. Store User Message
    db.chatMessages.create(user.id, "user", message);

    let assistantResponse = "";

    // 2. Call Gemini if API Key available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        // Pull active loans, library settings and books catalog to ground the AI model with real-time data!
        const userLoans = db.loans.findByUser(user.id).filter((l) => l.status !== "returned");
        const catalog = db.books.all().map(b => `- ${b.title} (${b.category}) - karya ${b.author}, sisa stok ${b.stock}`).join("\n");
        const settings = db.settings.get();

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction: `Anda adalah LibBot, virtual assistant pintar untuk LibWeb (Sistem Informasi Perpustakaan).
Membantu siswa bernama ${user.name} (Email: ${user.email}).
Berikut adalah data real-time perpustakaan kami saat ini:
- Katalog Buku Tersedia:\n${catalog}
- Pengaturan: Maksimal pinjam ${settings.max_loan_days} hari, tarif denda Rp${settings.fine_rate} per hari keterlambatan.
- Buku yang sedang dipinjam siswa saat ini: ${userLoans.length > 0 ? userLoans.map(l => {
              const b = db.books.find(l.book_id);
              return `Buku "${b?.title}" (jatuh tempo ${l.due_date.split("T")[0]}, denda akumulasi Rp${l.fine_amount})`;
            }).join(", ") : "Tidak ada buku aktif yang dipinjam."}

Berikan respons yang hangat, membantu, padat, dan sepenuhnya dalam Bahasa Indonesia. Jawab pertanyaan siswa berdasarkan info perpustakaan di atas.`,
          },
        });

        assistantResponse = response.text || "Mohon maaf, saya kesulitan memproses tanggapan saat ini.";
      } catch (geminiError) {
        console.error("Gemini API call failed, falling back to rule engine", geminiError);
        assistantResponse = fallbackBotAnswer(message, user.id);
      }
    } else {
      assistantResponse = fallbackBotAnswer(message, user.id);
    }

    // 3. Store Assistant Message
    const savedMsg = db.chatMessages.create(user.id, "assistant", assistantResponse);
    res.json({ message: savedMsg, history: db.chatMessages.findByUser(user.id) });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Gagal mengirim pesan." });
  }
});


// ==========================================
// 🚀 VITE DEV SERVER / STATIC ASSET SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LibWeb] Server running on http://localhost:${PORT}`);
  });
}

startServer();
