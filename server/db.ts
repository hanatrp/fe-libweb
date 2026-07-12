import fs from "fs";
import path from "path";

// Configuration
const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Interfaces
export interface UserSchema {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  password?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BookSchema {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn: string;
  stock: number;
  total_stock: number;
  category: string;
  cover_url: string;
  is_ebook: boolean;
  ebook_content: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoanSchema {
  id: string;
  user_id: string;
  book_id: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  status: "borrowed" | "returned" | "overdue";
  created_at: string;
  updated_at: string;
}

export interface ChatMessageSchema {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  message: string;
  created_at: string;
}

export interface SystemSettingsSchema {
  fine_rate: number; // in IDR (Rupiah), default 1000 per day
  max_loan_days: number; // default 7 days
}

interface DatabaseSchema {
  users: UserSchema[];
  books: BookSchema[];
  loans: LoanSchema[];
  chatMessages: ChatMessageSchema[];
  settings: SystemSettingsSchema;
}

// Initial Mock Seed Data (Indonesian Library Context - LibWeb)
const initialData: DatabaseSchema = {
  users: [
    {
      id: "usr_1",
      name: "Admin Perpus",
      email: "admin@libweb.com",
      role: "admin",
      password: "password123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "usr_2",
      name: "Budi Santoso",
      email: "siswa@libweb.com",
      role: "member",
      password: "password123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "usr_3",
      name: "Siti Rahma",
      email: "siti@libweb.com",
      role: "member",
      password: "password123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ],
  books: [
    {
      id: "bk_1",
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      publisher: "Bentang Pustaka",
      year: 2005,
      isbn: "978-979-3062-79-1",
      stock: 4,
      total_stock: 5,
      category: "Fiksi",
      cover_url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
      is_ebook: false,
      ebook_content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "bk_2",
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      publisher: "Lentera Dipantara",
      year: 1980,
      isbn: "978-979-97312-3-4",
      stock: 2,
      total_stock: 3,
      category: "Sastra",
      cover_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
      is_ebook: false,
      ebook_content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "bk_3",
      title: "Belajar TypeScript & React",
      author: "Rian Wijaya",
      publisher: "Informatika",
      year: 2023,
      isbn: "978-602-875-121-0",
      stock: 5,
      total_stock: 5,
      category: "Teknologi",
      cover_url: "https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&q=80&w=400",
      is_ebook: true,
      ebook_content: `# Pengenalan TypeScript dan React di LibWeb\n\nSelamat membaca E-Book ini! Buku ini dirancang untuk mengajarkan Anda konsep dasar TypeScript, pengembangan komponen modular dengan React 19, serta penanganan tipe data (type-safety) untuk sistem web skala industri.\n\n## Daftar Isi\n1. Pengenalan TypeScript\n2. Struktur Komponen React\n3. Pengelolaan State & Hooks\n4. Integrasi API Serverless\n\n## Bab 1: Mengapa TypeScript?\nTypeScript menambahkan static typing pada JavaScript untuk mendeteksi kesalahan sintaks sejak tahap kompilasi. Dengan menggunakan interface, enum, dan generic types, kode Anda menjadi lebih stabil dan mudah dipelihara.\n\n## Bab 2: Komponen Modular\nKomponen React haruslah reusable, modular, dan memiliki tanggung jawab tunggal. Pisahkan file CSS, types, dan components untuk memudahkan kerja tim.\n\n## Bab 3: Logika Sirkulasi di Perpustakaan\nDalam sistem LibWeb, transaksi sirkulasi divalidasi ketat secara server-side agar stok tidak pernah negatif, denda dihitung berdasarkan selisih hari keterlambatan, dan status diperbarui otomatis secara real-time.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "bk_4",
      title: "Negeri 5 Menara",
      author: "A. Fuadi",
      publisher: "Gramedia Pustaka Utama",
      year: 2009,
      isbn: "978-979-22-4845-6",
      stock: 0,
      total_stock: 2,
      category: "Fiksi",
      cover_url: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=400",
      is_ebook: false,
      ebook_content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
    {
      id: "bk_5",
      title: "Sains Modern untuk Pemula",
      author: "Prof. Dr. Anton",
      publisher: "Sains Press",
      year: 2021,
      isbn: "978-602-123-456-7",
      stock: 3,
      total_stock: 3,
      category: "Sains",
      cover_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
      is_ebook: true,
      ebook_content: `# Panduan Sains Modern untuk Pemula\n\nBuku sains modern ini membahas teori-teori fisika kuantum, astronomi kosmologis, serta biologi molekuler secara sederhana dan interaktif untuk pembaca umum.\n\n## Bab 1: Kosmos yang Dinamis\nSeluruh alam semesta berkembang pesat sejak peristiwa Dentuman Besar (Big Bang). Kita dapat mengamati radiasi latar belakang kosmis untuk mendeteksi asal-usul materi.\n\n## Bab 2: Mekanika Kuantum & Atom\nDi dunia subatomik, partikel berperilaku ganda sebagai gelombang dan materi. Teori relativitas umum Einstein menyatu dengan kuantum membentuk dasar teknologi modern seperti semikonduktor dan laser.\n\n## Bab 3: Menjaga Keseimbangan Ekosistem\nKehidupan di Bumi bergantung pada interaksi mikroorganisme, atmosfer, dan siklus karbon yang dinamis. Penting bagi kita untuk melestarikan lingkungan melalui energi terbarukan.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    },
  ],
  loans: [],
  chatMessages: [
    {
      id: "msg_1",
      user_id: "usr_2",
      role: "assistant",
      message: "Halo Budi Santoso! Saya adalah Chatbot Perpustakaan LibWeb. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan rekomendasi buku, status denda, atau cara meminjam buku.",
      created_at: new Date().toISOString(),
    },
  ],
  settings: {
    fine_rate: 1000,
    max_loan_days: 7,
  },
};

// Create some default loans for Budi (usr_2) to show overdue and borrowed statuses
// 1. One returned loan
const date1 = new Date();
date1.setDate(date1.getDate() - 15);
const date2 = new Date();
date2.setDate(date2.getDate() - 8);
initialData.loans.push({
  id: "loan_1",
  user_id: "usr_2",
  book_id: "bk_1", // Laskar Pelangi
  borrow_date: date1.toISOString(),
  due_date: date2.toISOString(),
  return_date: new Date().toISOString(),
  fine_amount: 7000, // 7 days overdue
  status: "returned",
  created_at: date1.toISOString(),
  updated_at: new Date().toISOString(),
});

// 2. One overdue loan (currently borrowed, and overdue)
const date3 = new Date();
date3.setDate(date3.getDate() - 10); // borrowed 10 days ago
const date4 = new Date();
date4.setDate(date4.getDate() - 3); // due 3 days ago
initialData.loans.push({
  id: "loan_2",
  user_id: "usr_2",
  book_id: "bk_4", // Negeri 5 Menara (stock is 0 now because of this loan!)
  borrow_date: date3.toISOString(),
  due_date: date4.toISOString(),
  return_date: null,
  fine_amount: 3000, // 3 days overdue dynamically calculated, but stored initially
  status: "overdue",
  created_at: date3.toISOString(),
  updated_at: new Date().toISOString(),
});

// Carbon-like helper
export const Carbon = {
  now(): Date {
    return new Date();
  },
  parse(dateStr: string): Date {
    return new Date(dateStr);
  },
  diffInDays(dateA: Date, dateB: Date): number {
    const timeDiff = dateA.getTime() - dateB.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  },
  addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  },
  format(date: Date): string {
    return date.toISOString().split("T")[0];
  },
};

// Database Engine (Singleton with Eloquent-like features)
class EloquentDB {
  private data: DatabaseSchema;
  private inTransaction: boolean = false;
  private transactionBackup: string | null = null;

  constructor() {
    if (fs.existsSync(DB_FILE)) {
      try {
        this.data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
        // Dynamic cleanup/check overdue loans on startup
        this.updateOverdueLoans();
      } catch (err) {
        console.error("Failed to read database, resetting to seed data", err);
        this.data = JSON.parse(JSON.stringify(initialData));
        this.saveToDisk();
      }
    } else {
      this.data = JSON.parse(JSON.stringify(initialData));
      this.saveToDisk();
    }
  }

  private saveToDisk() {
    if (this.inTransaction) return; // Wait until transaction completes to commit to disk
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
  }

  // Transaction support (DB::transaction)
  public transaction<T>(callback: () => T): T {
    if (this.inTransaction) {
      return callback(); // Already in a nested transaction, let the outer one handle rollback
    }

    this.inTransaction = true;
    this.transactionBackup = JSON.stringify(this.data);

    try {
      const result = callback();
      this.inTransaction = false;
      this.transactionBackup = null;
      this.saveToDisk();
      return result;
    } catch (error) {
      // Rollback
      console.warn("Transaction failed! Rolling back changes...", error);
      if (this.transactionBackup) {
        this.data = JSON.parse(this.transactionBackup);
      }
      this.inTransaction = false;
      this.transactionBackup = null;
      throw error;
    }
  }

  // Auto calculation of denda for active loans
  public updateOverdueLoans() {
    const now = new Date();
    const fineRate = this.data.settings.fine_rate;

    this.data.loans.forEach((loan) => {
      if (loan.status !== "returned") {
        const dueDate = new Date(loan.due_date);
        if (now > dueDate) {
          const diffTime = now.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            loan.status = "overdue";
            loan.fine_amount = diffDays * fineRate;
            loan.updated_at = now.toISOString();
          }
        } else {
          loan.status = "borrowed";
          loan.fine_amount = 0;
        }
      }
    });
    this.saveToDisk();
  }

  // --- USER MODEL OPERATIONS ---
  public users = {
    all: (includeDeleted = false): UserSchema[] => {
      return this.data.users.filter((u) => includeDeleted || u.deleted_at === null);
    },
    find: (id: string): UserSchema | undefined => {
      return this.data.users.find((u) => u.id === id);
    },
    findByEmail: (email: string): UserSchema | undefined => {
      return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.deleted_at === null);
    },
    create: (user: Omit<UserSchema, "id" | "created_at" | "updated_at" | "deleted_at">): UserSchema => {
      const newUser: UserSchema = {
        ...user,
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      this.data.users.push(newUser);
      this.saveToDisk();
      return newUser;
    },
    update: (id: string, updates: Partial<Omit<UserSchema, "id" | "created_at" | "updated_at">>): UserSchema => {
      const user = this.data.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      Object.assign(user, updates);
      user.updated_at = new Date().toISOString();
      this.saveToDisk();
      return user;
    },
    delete: (id: string): boolean => {
      const user = this.data.users.find((u) => u.id === id);
      if (!user) return false;
      user.deleted_at = new Date().toISOString(); // SoftDelete
      this.saveToDisk();
      return true;
    },
    restore: (id: string): boolean => {
      const user = this.data.users.find((u) => u.id === id);
      if (!user) return false;
      user.deleted_at = null; // Restore SoftDelete
      this.saveToDisk();
      return true;
    },
  };

  // --- BOOK MODEL OPERATIONS ---
  public books = {
    all: (includeDeleted = false): BookSchema[] => {
      return this.data.books.filter((b) => includeDeleted || b.deleted_at === null);
    },
    find: (id: string): BookSchema | undefined => {
      return this.data.books.find((b) => b.id === id);
    },
    create: (book: Omit<BookSchema, "id" | "created_at" | "updated_at" | "deleted_at">): BookSchema => {
      const newBook: BookSchema = {
        ...book,
        id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      this.data.books.push(newBook);
      this.saveToDisk();
      return newBook;
    },
    update: (id: string, updates: Partial<Omit<BookSchema, "id" | "created_at" | "updated_at">>): BookSchema => {
      const book = this.data.books.find((b) => b.id === id);
      if (!book) throw new Error("Book not found");
      Object.assign(book, updates);
      book.updated_at = new Date().toISOString();
      this.saveToDisk();
      return book;
    },
    delete: (id: string): boolean => {
      const book = this.data.books.find((b) => b.id === id);
      if (!book) return false;
      book.deleted_at = new Date().toISOString(); // SoftDelete
      this.saveToDisk();
      return true;
    },
    restore: (id: string): boolean => {
      const book = this.data.books.find((b) => b.id === id);
      if (!book) return false;
      book.deleted_at = null; // Restore SoftDelete
      this.saveToDisk();
      return true;
    },
  };

  // --- LOAN MODEL OPERATIONS ---
  // Implements transactions, stock updates, observers and carbon logic in Indonesian language
  public loans = {
    all: (): LoanSchema[] => {
      this.updateOverdueLoans();
      return this.data.loans;
    },
    find: (id: string): LoanSchema | undefined => {
      this.updateOverdueLoans();
      return this.data.loans.find((l) => l.id === id);
    },
    findByUser: (userId: string): LoanSchema[] => {
      this.updateOverdueLoans();
      return this.data.loans.filter((l) => l.user_id === userId);
    },
    
    // Core Borrow Circulation logic with DB Transactions and stock verification
    borrow: (userId: string, bookId: string): LoanSchema => {
      return this.transaction(() => {
        // 1. Verify User and Book
        const user = this.users.find(userId);
        if (!user) throw new Error("Anggota perpustakaan tidak ditemukan.");
        if (user.deleted_at) throw new Error("Akun anggota ini sedang dinonaktifkan.");

        const book = this.books.find(bookId);
        if (!book) throw new Error("Buku tidak ditemukan.");
        if (book.deleted_at) throw new Error("Buku ini sedang ditarik dari sirkulasi.");

        // 2. Check stock
        if (book.stock <= 0) {
          throw new Error(`Stok buku "${book.title}" tidak mencukupi untuk dipinjam.`);
        }

        // 3. Check if user already borrowing this exact book and hasn't returned it yet
        const activeLoan = this.data.loans.find(
          (l) => l.user_id === userId && l.book_id === bookId && l.status !== "returned"
        );
        if (activeLoan) {
          throw new Error(`Anggota masih meminjam buku "${book.title}" dan belum mengembalikannya.`);
        }

        // 4. Create Loan
        const borrowDate = new Date();
        const maxDays = this.data.settings.max_loan_days;
        const dueDate = Carbon.addDays(borrowDate, maxDays);

        const newLoan: LoanSchema = {
          id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          user_id: userId,
          book_id: bookId,
          borrow_date: borrowDate.toISOString(),
          due_date: dueDate.toISOString(),
          return_date: null,
          fine_amount: 0,
          status: "borrowed",
          created_at: borrowDate.toISOString(),
          updated_at: borrowDate.toISOString(),
        };

        this.data.loans.push(newLoan);

        // 5. OBSERVER PATTERN: Decrement book stock automatically
        book.stock -= 1;
        book.updated_at = new Date().toISOString();

        this.saveToDisk();
        return newLoan;
      });
    },

    // Core Return Circulation logic with DB Transactions, dynamic denda calculation, and stock verification
    return: (loanId: string): LoanSchema => {
      return this.transaction(() => {
        const loan = this.data.loans.find((l) => l.id === loanId);
        if (!loan) throw new Error("Catatan peminjaman tidak ditemukan.");
        if (loan.status === "returned") throw new Error("Buku ini sudah pernah dikembalikan.");

        const book = this.books.find(loan.book_id);
        if (!book) throw new Error("Buku tidak ditemukan.");

        const returnDate = new Date();
        loan.return_date = returnDate.toISOString();

        // Calculate fine (denda) using Carbon logic
        const dueDate = new Date(loan.due_date);
        if (returnDate > dueDate) {
          const diffDays = Carbon.diffInDays(returnDate, dueDate);
          loan.fine_amount = diffDays * this.data.settings.fine_rate;
        } else {
          loan.fine_amount = 0;
        }

        loan.status = "returned";
        loan.updated_at = returnDate.toISOString();

        // OBSERVER PATTERN: Increment book stock automatically
        book.stock = Math.min(book.total_stock, book.stock + 1);
        book.updated_at = new Date().toISOString();

        this.saveToDisk();
        return loan;
      });
    },
  };

  // --- CHAT MESSAGES OPERATIONS ---
  public chatMessages = {
    all: (): ChatMessageSchema[] => {
      return this.data.chatMessages;
    },
    findByUser: (userId: string): ChatMessageSchema[] => {
      return this.data.chatMessages.filter((m) => m.user_id === userId);
    },
    create: (userId: string, role: "user" | "assistant", message: string): ChatMessageSchema => {
      const newMessage: ChatMessageSchema = {
        id: `msg_${Date.now()}`,
        user_id: userId,
        role,
        message,
        created_at: new Date().toISOString(),
      };
      this.data.chatMessages.push(newMessage);
      this.saveToDisk();
      return newMessage;
    },
    clearHistory: (userId: string) => {
      this.data.chatMessages = this.data.chatMessages.filter((m) => m.user_id !== userId);
      // Re-seed assistant welcome
      this.chatMessages.create(
        userId,
        "assistant",
        "Halo! Saya adalah Chatbot Perpustakaan LibWeb. Ada yang bisa saya bantu hari ini? Anda bisa menanyakan rekomendasi buku, status denda, atau cara meminjam buku."
      );
      this.saveToDisk();
    },
  };

  // --- SYSTEM SETTINGS ---
  public settings = {
    get: (): SystemSettingsSchema => {
      return this.data.settings;
    },
    update: (updates: Partial<SystemSettingsSchema>): SystemSettingsSchema => {
      Object.assign(this.data.settings, updates);
      // Re-trigger overdue calculation with new fine rate if updated
      this.updateOverdueLoans();
      this.saveToDisk();
      return this.data.settings;
    },
  };
}

export const db = new EloquentDB();
