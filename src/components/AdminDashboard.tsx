import React, { useState } from "react";
import { Book as BookType, User, Loan, SystemSettings } from "../types";
import { Plus, Trash2, RotateCcw, AlertCircle, CheckCircle, FileText, Bookmark, ClipboardList, BookOpen, UserCheck, ShieldAlert, Library, Sparkles, RefreshCw, Layers } from "lucide-react";

interface AdminDashboardProps {
  books: BookType[];
  users: User[];
  loans: Loan[];
  settings: SystemSettings;
  onAddBook: (bookData: Omit<BookType, "id" | "stock" | "created_at" | "updated_at" | "deleted_at">) => void;
  onUpdateBook: (id: string, bookData: Partial<BookType>) => void;
  onDeleteBook: (id: string) => void;
  onRestoreBook: (id: string) => void;
  onBorrowBook: (studentId: string, bookId: string) => void;
  onReturnBook: (loanId: string) => void;
  isLoading: boolean;
}

export default function AdminDashboard({
  books,
  users,
  loans,
  settings,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onRestoreBook,
  onBorrowBook,
  onReturnBook,
  isLoading,
}: AdminDashboardProps) {
  // Tabs within Admin Dashboard
  const [adminTab, setAdminTab] = useState<"circulation" | "catalog" | "settings">("circulation");

  // Add Book Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    publisher: "",
    year: new Date().getFullYear(),
    isbn: "",
    total_stock: 5,
    category: "Fiksi",
    cover_url: "",
    is_ebook: false,
    ebook_content: "",
  });

  // Edit Book Form state
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Manual Borrow Simulation state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  const activeBooks = books.filter((b) => b.deleted_at === null);
  const deletedBooks = books.filter((b) => b.deleted_at !== null);
  const members = users.filter((u) => u.role === "member" && u.deleted_at === null);

  // Submit new book
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.isbn) return;
    
    onAddBook({
      ...newBook,
      year: Number(newBook.year),
      total_stock: Number(newBook.total_stock),
      ebook_content: newBook.is_ebook ? newBook.ebook_content : null,
    });

    // Reset Form
    setNewBook({
      title: "",
      author: "",
      publisher: "",
      year: new Date().getFullYear(),
      isbn: "",
      total_stock: 5,
      category: "Fiksi",
      cover_url: "",
      is_ebook: false,
      ebook_content: "",
    });
    setShowAddForm(false);
  };

  // Submit borrow logger
  const handleBorrowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedBook) return;
    onBorrowBook(selectedStudent, selectedBook);
    setSelectedBook("");
  };

  return (
    <div id="admin-dashboard" className="space-y-8 pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-150 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Panel Petugas Perpustakaan</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola data sirkulasi, buku fisik/e-book, dan konfigurasi denda perpustakaan.</p>
        </div>

        {/* Admin subtabs switcher */}
        <div className="flex space-x-1.5 rounded-2xl bg-slate-100 p-1.5 self-start md:self-center">
          <button
            onClick={() => setAdminTab("circulation")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === "circulation" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Sirkulasi & Transaksi</span>
          </button>
          <button
            onClick={() => setAdminTab("catalog")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === "catalog" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Katalog Buku ({activeBooks.length})</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          TAB 1: SIRKULASI & TRANSAKSI
          ========================================== */}
      {adminTab === "circulation" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Quick Sirkulasi Logger Form (Peminjaman & Pengembalian Cepat) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-6 shadow-sm">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-base font-bold font-display uppercase tracking-wider">Pencatatan Peminjaman</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
                Gunakan form petugas ini untuk mendaftarkan peminjaman buku fisik bagi siswa secara langsung. Sistem akan mendebit stok buku secara otomatis.
              </p>

              <form onSubmit={handleBorrowSubmit} className="mt-5 space-y-4">
                {/* Select Student */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Anggota / Siswa</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Physical Book */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Buku Fisik</label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Buku --</option>
                    {activeBooks
                      .filter((b) => !b.is_ebook)
                      .map((b) => (
                        <option key={b.id} value={b.id} disabled={b.stock <= 0}>
                          {b.title} {b.stock <= 0 ? "(Stok Habis)" : `(Sisa ${b.stock})`}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedStudent || !selectedBook}
                  className="w-full inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                  Catat Peminjaman Baru
                </button>
              </form>
            </div>

            {/* QUICK ALERTS: STOCK WARN */}
            <div className="rounded-3xl border border-red-100 bg-red-50/20 p-5 space-y-3.5">
              <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center font-display">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Peringatan Stok Buku Menipis
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeBooks.filter((b) => !b.is_ebook && b.stock <= 1).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-red-100/50 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[150px] font-display">{b.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">karya {b.author}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                      b.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {b.stock === 0 ? "Habis" : "Sisa 1"}
                    </span>
                  </div>
                ))}
                {activeBooks.filter((b) => !b.is_ebook && b.stock <= 1).length === 0 && (
                  <p className="text-xs text-slate-550 font-semibold">Semua stok buku fisik dalam keadaan aman.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Transaction history log & active borrow returns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold font-display text-slate-900">Log Sirkulasi Aktif & Riwayat</h2>
                <p className="text-xs text-slate-500 mt-1">Daftar transaksi peminjaman aktif yang belum dikembalikan atau telah selesai.</p>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-250 border-t-indigo-650"></div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Memperbarui log sirkulasi...</p>
                </div>
              ) : loans.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <ClipboardList className="mx-auto h-12 w-12 text-slate-200" />
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Belum ada transaksi sirkulasi</p>
                  <p className="text-xs">Catat peminjaman di formulir sebelah kiri untuk memulai.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 font-mono">
                      <tr>
                        <th className="p-4">Anggota</th>
                        <th className="p-4">Buku Pinjam</th>
                        <th className="p-4">Tgl Pinjam</th>
                        <th className="p-4">Jatuh Tempo</th>
                        <th className="p-4">Status & Denda</th>
                        <th className="p-4 text-right">Aksi Petugas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loans.map((loan) => {
                        const fineColor = loan.fine_amount > 0 ? "text-red-600 font-extrabold" : "text-slate-400 font-bold";
                        return (
                          <tr key={loan.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-slate-800 font-display">{loan.user?.name || loan.student_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{loan.user?.email}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2.5">
                                <img
                                  src={loan.book_cover}
                                  alt={loan.book_title}
                                  referrerPolicy="no-referrer"
                                  className="h-8.5 w-6 object-cover rounded shadow-sm bg-slate-150 border border-slate-100"
                                />
                                <div className="max-w-[140px] truncate">
                                  <p className="font-bold text-slate-800 truncate font-display">{loan.book_title}</p>
                                  <p className="text-[9px] text-slate-400 truncate font-mono">ISBN: {loan.book?.isbn}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-medium text-slate-500">{loan.borrow_date.split("T")[0]}</td>
                            <td className="p-4 font-mono font-medium text-slate-550">{loan.due_date.split("T")[0]}</td>
                            <td className="p-4">
                              <div className="space-y-1">
                                {loan.status === "returned" ? (
                                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-150 uppercase tracking-widest font-mono">
                                    DIKEMBALIKAN
                                  </span>
                                ) : loan.status === "overdue" ? (
                                  <span className="inline-flex items-center rounded-lg bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-800 border border-red-150 animate-pulse uppercase tracking-widest font-mono">
                                    TERLAMBAT
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-800 border border-indigo-150 uppercase tracking-widest font-mono">
                                    DIPINJAM
                                  </span>
                                )}
                                <p className={`text-[10px] font-mono ${fineColor}`}>
                                  Denda: Rp{loan.fine_amount.toLocaleString("id-ID")}
                                </p>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {loan.status !== "returned" ? (
                                <button
                                  onClick={() => onReturnBook(loan.id)}
                                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-750 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 shadow-sm hover:shadow transition-all cursor-pointer"
                                >
                                  Terima Kembali
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium font-mono">
                                  Selesai ({loan.return_date?.split("T")[0]})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: MANAGEMENT KATALOG BUKU
          ========================================== */}
      {adminTab === "catalog" && (
        <div className="space-y-6">
          
          {/* Header catalog control actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div>
              <p className="text-sm font-bold text-slate-800 font-display">Kelola Katalog Buku Perpustakaan</p>
              <p className="text-xs text-slate-500 font-medium">Tambah buku baru (cetak/e-book), edit metadata stok, atau pulihkan buku terhapus.</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {showAddForm ? "Tutup Form Tambah" : "Tambah Koleksi Buku"}
            </button>
          </div>

          {/* ADD BOOK COLLAPSIBLE FORM */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md space-y-6 animate-fade-in">
              <h3 className="text-base font-bold font-display text-indigo-700 flex items-center uppercase tracking-wider">
                <Plus className="mr-2 h-5 w-5" /> Tambah Koleksi Buku Baru
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judul Buku</label>
                  <input
                    type="text"
                    required
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    placeholder="e.g. Laskar Pelangi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Pengarang</label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    placeholder="e.g. Andrea Hirata"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer font-semibold"
                  >
                    <option value="Fiksi">Fiksi</option>
                    <option value="Sastra">Sastra</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Sains">Sains</option>
                    <option value="Sejarah">Sejarah</option>
                    <option value="Kamus">Kamus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">ISBN</label>
                  <input
                    type="text"
                    required
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                    placeholder="e.g. 978-979-3062-79-1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penerbit</label>
                  <input
                    type="text"
                    value={newBook.publisher}
                    onChange={(e) => setNewBook({ ...newBook, publisher: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    placeholder="e.g. Bentang Pustaka"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tahun Terbit</label>
                  <input
                    type="number"
                    value={newBook.year}
                    onChange={(e) => setNewBook({ ...newBook, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Sampul Gambar (Hotlink)</label>
                  <input
                    type="url"
                    value={newBook.cover_url}
                    onChange={(e) => setNewBook({ ...newBook, cover_url: e.target.value })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Unit Stok</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newBook.total_stock}
                    onChange={(e) => setNewBook({ ...newBook, total_stock: parseInt(e.target.value) || 1 })}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Is E-book Toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBook.is_ebook}
                    onChange={(e) => setNewBook({ ...newBook, is_ebook: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Aktifkan format E-Book (Digital)</p>
                    <p className="text-[11px] text-slate-500 font-medium">Membaca dapat langsung diakses instan melalui previewer khusus siswa.</p>
                  </div>
                </label>

                {newBook.is_ebook && (
                  <div className="mt-4 animate-fade-in">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Isi Konten E-Book (Format Markdown / Tulisan)</label>
                    <textarea
                      value={newBook.ebook_content}
                      onChange={(e) => setNewBook({ ...newBook, ebook_content: e.target.value })}
                      rows={6}
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      placeholder="# Judul Bab 1..."
                    ></textarea>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          )}

          {/* ACTIVE CATALOG LIST */}
          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold font-display text-slate-900">Daftar Aktif Katalog ({activeBooks.length} buku)</h3>
              <p className="text-xs text-slate-500 mt-1">Gunakan ikon tempat sampah untuk melakukan SoftDelete. Data terhapus bisa dipulihkan kembali dari daftar terbawah.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 font-mono">
                  <tr>
                    <th className="p-4">Buku</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Sisa Stok / Total</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            referrerPolicy="no-referrer"
                            className="h-10 w-7 object-cover rounded-lg shadow-sm bg-slate-100 border border-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1 font-display">{book.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">karya {book.author} • {book.publisher}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[9px] font-bold text-indigo-855 uppercase tracking-widest font-mono">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-500 font-medium">{book.isbn}</td>
                      <td className="p-4">
                        {book.is_ebook ? (
                          <span className="inline-flex items-center space-x-1 font-bold text-indigo-600 uppercase tracking-wider text-[10px]">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>E-Book</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Buku Fisik</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-850 font-mono">
                        {book.is_ebook ? (
                          <span className="text-indigo-600 uppercase tracking-wider text-[10px] font-bold font-sans">Unlimited</span>
                        ) : (
                          <span>{book.stock} / {book.total_stock} exp</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteBook(book.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="SoftDelete Buku"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOFT DELETED BOOKS (RESTORE LIST) */}
          {deletedBooks.length > 0 && (
            <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/5 p-6 space-y-4">
              <div className="flex items-center space-x-2 text-red-800">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-display">Arsip SoftDeletes (Buku Terhapus)</h3>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                Berikut adalah buku-buku yang terhapus secara lunak (soft deleted). Anda dapat memulihkan (restore) buku ini kembali ke katalog sirkulasi utama kapan saja tanpa kehilangan relasi histori data peminjaman.
              </p>

              <div className="divide-y divide-slate-150 rounded-2xl border border-red-100 bg-white p-2">
                {deletedBooks.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3.5 text-xs">
                    <div>
                      <p className="font-bold text-slate-800 font-display">{b.title}</p>
                      <p className="text-[10px] text-slate-400">karya {b.author} • ISBN {b.isbn}</p>
                    </div>
                    <button
                      onClick={() => onRestoreBook(b.id)}
                      className="inline-flex items-center space-x-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-3.5 py-2 font-bold uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Pulihkan</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
