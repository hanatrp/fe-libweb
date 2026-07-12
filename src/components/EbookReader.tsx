import React, { useState, useEffect } from "react";
import { Book } from "../types";
import { BookOpen, Bookmark, Save, X, Type, ChevronLeft, ChevronRight, FileText, CheckSquare, Settings } from "lucide-react";

interface EbookReaderProps {
  book: Book;
  onClose: () => void;
}

export default function EbookReader({ book, onClose }: EbookReaderProps) {
  // Reading configurations
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [personalNotes, setPersonalNotes] = useState("");
  const [readingProgress, setReadingProgress] = useState(15); // initial simulated progress

  // Load from localStorage for persistent bookmark/note-taking simulation
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`libweb_bookmarks_${book.id}`);
    const savedNotes = localStorage.getItem(`libweb_notes_${book.id}`);
    const savedProgress = localStorage.getItem(`libweb_progress_${book.id}`);
    
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedNotes) setPersonalNotes(savedNotes);
    if (savedProgress) setReadingProgress(Number(savedProgress));
  }, [book.id]);

  const handleSaveNotes = () => {
    localStorage.setItem(`libweb_notes_${book.id}`, personalNotes);
    alert("Catatan belajar berhasil disimpan!");
  };

  const handleToggleBookmark = (heading: string) => {
    let updated;
    if (bookmarks.includes(heading)) {
      updated = bookmarks.filter((b) => b !== heading);
    } else {
      updated = [...bookmarks, heading];
    }
    setBookmarks(updated);
    localStorage.setItem(`libweb_bookmarks_${book.id}`, JSON.stringify(updated));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setReadingProgress(value);
    localStorage.setItem(`libweb_progress_${book.id}`, String(value));
  };

  // Split content into simple mock sections/chapters for our index
  const sections = [
    { id: "intro", title: "Pengenalan & Pendahuluan" },
    { id: "chapter1", title: "Bab 1: Dasar Teori & Pengantar" },
    { id: "chapter2", title: "Bab 2: Panduan Langkah demi Langkah" },
    { id: "chapter3", title: "Bab 3: Implementasi Kasus Nyata" },
  ];

  const fontSizeClasses = {
    sm: "text-xs md:text-sm leading-relaxed",
    base: "text-sm md:text-base leading-relaxed",
    lg: "text-base md:text-lg leading-relaxed",
    xl: "text-lg md:text-xl leading-relaxed",
  };

  return (
    <div id="ebook-reader" className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
      
      {/* READER INTERFACE BLOCK */}
      <div className="w-full max-w-5xl bg-white h-full shadow-2xl flex flex-col md:flex-row animate-slide-in">
        
        {/* LEFT SIDEBAR: Index, study notes, bookmarks */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-[350px] md:h-full bg-slate-50 shrink-0">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">Menu Belajar Siswa</span>
            </div>
            
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrolling tools area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Table of contents */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daftar Isi Buku</h4>
              <div className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    className="w-full flex items-center space-x-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-white hover:text-emerald-700 transition-colors"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Progress Selector */}
            <div className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Progres Membaca</span>
                <span className="text-emerald-700">{readingProgress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={readingProgress}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400 italic">Seret penggeser untuk mencatat progres belajar Anda.</p>
            </div>

            {/* Bookmarks Manager */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penanda / Bookmarks</h4>
              <div className="space-y-1">
                {bookmarks.map((b) => (
                  <div key={b} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-150 text-[11px] text-slate-600">
                    <span className="truncate font-medium">{b}</span>
                    <button onClick={() => handleToggleBookmark(b)} className="text-red-500 hover:text-red-700 font-bold">X</button>
                  </div>
                ))}
                {bookmarks.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Belum ada bagian buku yang ditandai.</p>
                )}
              </div>
            </div>

            {/* Study Notes Textarea */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan Belajar Pribadi</h4>
                <button
                  onClick={handleSaveNotes}
                  className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Save className="h-3 w-3" />
                  <span>Simpan</span>
                </button>
              </div>
              <textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="Tulis ringkasan bab atau catatan belajar Anda di sini... Catatan ini akan tersimpan otomatis."
              ></textarea>
            </div>

          </div>

        </div>

        {/* RIGHT AREA: Active Scrollable text reading pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/20">
          
          {/* Reader Topbar */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{book.category} E-Book</p>
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{book.title}</h3>
            </div>

            {/* Adjust options & Close */}
            <div className="flex items-center space-x-2">
              
              {/* Font Size Selector */}
              <div className="flex items-center border border-slate-200 rounded-lg bg-white p-1 text-xs font-semibold">
                <Type className="h-4 w-4 text-slate-400 mx-1" />
                <button
                  onClick={() => setFontSize("sm")}
                  className={`px-1.5 py-0.5 rounded ${fontSize === "sm" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize("base")}
                  className={`px-1.5 py-0.5 rounded ${fontSize === "base" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("lg")}
                  className={`px-1.5 py-0.5 rounded ${fontSize === "lg" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("xl")}
                  className={`px-1.5 py-0.5 rounded ${fontSize === "xl" ? "bg-slate-100 text-slate-800" : "text-slate-400"}`}
                >
                  A++
                </button>
              </div>

              {/* Close Button Desktop */}
              <button
                onClick={onClose}
                className="hidden md:inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Tutup Previewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE READING CONTEXT */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white max-w-3xl mx-auto w-full shadow-inner shadow-slate-50">
            <article className={`prose max-w-none text-slate-800 ${fontSizeClasses[fontSize]}`}>
              <div className="border-b border-slate-100 pb-5 mb-6 flex justify-between items-center">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Halaman Utama</p>
                
                <button
                  onClick={() => handleToggleBookmark("Judul Utama")}
                  className={`flex items-center space-x-1.5 text-xs font-semibold rounded-lg px-2.5 py-1 ${
                    bookmarks.includes("Judul Utama")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes("Judul Utama") ? "fill-emerald-600 text-emerald-600" : ""}`} />
                  <span>{bookmarks.includes("Judul Utama") ? "Ditandai" : "Tandai Bagian"}</span>
                </button>
              </div>

              {/* Standard ebook text render */}
              <div className="whitespace-pre-line font-serif">
                {book.ebook_content || "Maaf, konten e-book ini belum disiapkan oleh admin."}
              </div>
            </article>
          </div>

        </div>

      </div>

    </div>
  );
}
