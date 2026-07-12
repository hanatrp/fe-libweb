import React, { useState } from "react";
import { Search, Book, Bookmark, Layers, FileText, ChevronRight, CornerDownRight, CheckCircle, AlertTriangle, Play, HelpCircle, ArrowRight, Library, BookOpen } from "lucide-react";
import { Book as BookType, User } from "../types";

interface LandingPageProps {
  books: BookType[];
  currentUser: User | null;
  onBorrow: (bookId: string) => void;
  onReadEbook: (book: BookType) => void;
  onShowLoginModal: () => void;
  isLoading: boolean;
}

export default function LandingPage({
  books,
  currentUser,
  onBorrow,
  onReadEbook,
  onShowLoginModal,
  isLoading,
}: LandingPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedType, setSelectedType] = useState("Semua"); // Semua, E-Book, Fisik

  // Filter logic
  const categories = ["Semua", ...Array.from(new Set(books.map((b) => b.category)))];

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === "Semua" || b.category === selectedCategory;
    const matchesType =
      selectedType === "Semua" ||
      (selectedType === "E-Book" && b.is_ebook) ||
      (selectedType === "Fisik" && !b.is_ebook);

    return matchesSearch && matchesCategory && matchesType && b.deleted_at === null;
  });

  return (
    <div id="landing-page" className="space-y-12 pb-16">
      
      {/* 🌟 HERO ACCENT BANNER */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 opacity-95"></div>
        {/* Dynamic Abstract Shapes for Visual Interest */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl"></div>
        
        <div className="relative px-6 py-12 sm:px-12 sm:py-20 lg:px-16 lg:py-24 max-w-4xl">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Sistem Informasi Perpustakaan LibWeb</span>
          </span>
          <h1 className="mt-6 text-3xl font-extrabold font-display tracking-tight sm:text-5xl text-white">
            Eksplorasi Dunia Sastra & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
              Sains dalam Satu Genggaman
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg text-slate-350 leading-relaxed">
            Selamat datang di <strong className="text-indigo-400">LibWeb</strong>. Layanan perpustakaan digital interaktif dengan sirkulasi stok buku otomatis, denda dinamis, modul e-book responsif, dan chatbot cerdas bertenaga AI.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#katalog-section"
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5.5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 transition-all hover:translate-y-0.5"
            >
              Cari Katalog Buku
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
            {!currentUser && (
              <button
                onClick={onShowLoginModal}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 px-5.5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-250 hover:bg-slate-800 hover:text-white transition-all"
              >
                Masuk Akun Anggota
              </button>
            )}
          </div>
        </div>

        {/* Floating Quick Stats on Hero margin (Desktop) */}
        <div className="hidden lg:grid absolute right-12 top-1/2 -translate-y-1/2 w-80 grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4">
            <Library className="h-5 w-5 text-indigo-400" />
            <p className="mt-2 text-2xl font-bold font-display">{books.filter(b => !b.is_ebook).length}+</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Buku Cetak Fisik</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4">
            <BookOpen className="h-5 w-5 text-violet-400" />
            <p className="mt-2 text-2xl font-bold font-display">{books.filter(b => b.is_ebook).length}+</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">E-Book Instan</p>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 col-span-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">LibBot AI Asisten</p>
              <p className="text-[10px] text-slate-400 font-medium">Aktif & Siap Membantu Siswa</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Play className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
        </div>
      </section>

      {/* 📦 FILTER & CATALOGUE SECTION */}
      <section id="katalog-section" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900">Katalog Koleksi Buku</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Gunakan fitur pencarian untuk menyaring buku cetak atau e-book premium kami.</p>
          </div>

          {/* Quick type filter */}
          <div className="flex items-center rounded-2xl bg-slate-100 p-1 self-start">
            {["Semua", "E-Book", "Fisik"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  selectedType === t
                    ? "bg-white text-indigo-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan judul, penulis, atau ISBN..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm placeholder:text-slate-455 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Kategori: {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>

          {/* Results Info Counter */}
          <div className="flex items-center justify-end text-xs font-bold uppercase tracking-wider text-slate-500">
            Menampilkan <span className="text-slate-900 mx-1.5 font-display text-sm">{filteredBooks.length}</span> koleksi buku
          </div>
        </div>

        {/* 📚 BOOK LIST BENTO GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Memuat katalog perpustakaan...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
            <Book className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-800">Buku tidak ditemukan</h3>
            <p className="mt-1 text-xs text-slate-500">Coba ubah kata kunci atau ganti filter kategori.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const isAvailable = book.is_ebook || book.stock > 0;
              
              return (
                <div
                  key={book.id}
                  id={`book-card-${book.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Book Cover and badging */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badge Is Ebook vs Physical */}
                    <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                      {book.is_ebook ? (
                        <span className="inline-flex items-center rounded-lg bg-indigo-600 px-2.5 py-1 text-[9px] font-bold text-white tracking-wider uppercase shadow-sm">
                          E-BOOK
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-800 px-2.5 py-1 text-[9px] font-bold text-white tracking-wider uppercase shadow-sm">
                          FISIK
                        </span>
                      )}
                      
                      <span className="inline-flex items-center rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-slate-800 shadow-sm border border-slate-100 uppercase tracking-widest">
                        {book.category}
                      </span>
                    </div>

                    {/* Stock Alert Bubble */}
                    {!book.is_ebook && (
                      <div className="absolute right-3.5 top-3.5">
                        {book.stock === 0 ? (
                          <span className="inline-flex items-center space-x-1 rounded-lg bg-red-100 px-2 py-1 text-[9px] font-bold text-red-800 shadow-sm border border-red-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>STOK HABIS</span>
                          </span>
                        ) : book.stock <= 1 ? (
                          <span className="inline-flex items-center space-x-1 rounded-lg bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-800 shadow-sm border border-amber-200">
                            <AlertTriangle className="h-3 w-3" />
                            <span>SISA {book.stock}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-800 shadow-sm border border-emerald-150">
                            Sisa: {book.stock} exp
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {book.publisher} • {book.year}
                    </span>
                    <h3 className="mt-1 text-base font-bold font-display text-slate-850 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">karya {book.author}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-450 font-mono">
                      <span>ISBN: {book.isbn}</span>
                      {!book.is_ebook && (
                        <span>Total: {book.total_stock} exp</span>
                      )}
                    </div>

                    {/* Interactive CTA buttons based on login role */}
                    <div className="mt-5 pt-1.5 flex gap-2.5">
                      {book.is_ebook ? (
                        <button
                          onClick={() => onReadEbook(book)}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 transition-colors cursor-pointer uppercase tracking-wider shadow-sm"
                        >
                          <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                          Baca E-Book Instan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              onShowLoginModal();
                            } else {
                              onBorrow(book.id);
                            }
                          }}
                          disabled={!isAvailable}
                          className={`flex-1 inline-flex items-center justify-center rounded-2xl font-bold text-xs py-3 transition-all uppercase tracking-wider ${
                            isAvailable
                              ? "bg-slate-900 hover:bg-indigo-600 text-white hover:shadow-md cursor-pointer"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                          {isAvailable ? "Ajukan Pinjam Buku" : "Stok Tidak Tersedia"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 📖 BRIEF COMPLIANCE / EXPLANATION ACCENT */}
      <section className="rounded-3xl border border-indigo-100 bg-indigo-50/30 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold font-display text-slate-900">Alur Sirkulasi Stok & Denda</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            LibWeb mengedepankan akurasi operasional. Pengembalian buku yang terlambat akan dikenakan denda dinamis yang dihitung per hari selisih keterlambatan. Pengisian dan penarikan stok buku cetak terikat langsung dalam proses transaksi sirkulasi (pengurangan otomatis saat dipinjam, penambahan saat dikembalikan).
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-indigo-800">
            <span className="flex items-center"><CheckCircle className="mr-1.5 h-4 w-4 text-indigo-600" /> SIRKULASI ACID</span>
            <span className="flex items-center"><CheckCircle className="mr-1.5 h-4 w-4 text-indigo-600" /> PEMULIHAN SOFTDELETES</span>
            <span className="flex items-center"><CheckCircle className="mr-1.5 h-4 w-4 text-indigo-600" /> DENDA DINAMIS</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100/60 p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Butuh Bantuan?</h4>
            <p className="text-xs text-slate-600 mt-1 font-medium">Gunakan Chatbot AI LibBot yang ramah untuk menanyakan rekomendasi atau info tagihan Anda.</p>
          </div>
          <p className="text-[10px] font-bold text-indigo-600 uppercase mt-4 tracking-wider">Tersedia di Dashboard Siswa →</p>
        </div>
      </section>

    </div>
  );
}
