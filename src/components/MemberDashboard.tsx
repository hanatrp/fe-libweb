import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../config";
import { User, Loan, Book, ChatMessage } from "../types";
import { MessageSquare, Sparkles, Send, Trash2, Calendar, AlertCircle, BookOpen, Clock, RefreshCw, Bookmark, ArrowRight, HelpCircle } from "lucide-react";

interface MemberDashboardProps {
  currentUser: User | null;
  loans: Loan[];
  books: Book[];
  onReturnBook: (loanId: string) => void;
  onReadEbook: (book: Book) => void;
  onRefreshLoans: () => void;
}

export default function MemberDashboard({
  currentUser,
  loans,
  books,
  onReturnBook,
  onReadEbook,
  onRefreshLoans,
}: MemberDashboardProps) {
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeLoans = loans.filter((l) => l.user_id === currentUser?.id && l.status !== "returned");
  const returnHistory = loans.filter((l) => l.user_id === currentUser?.id && l.status === "returned");
  const totalFine = activeLoans.reduce((sum, l) => sum + l.fine_amount, 0);

  // Fetch Chat History on mount or user switch
  const fetchChatHistory = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [currentUser]);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentUser) return;

    const userText = inputMessage;
    setInputMessage("");
    setSendingChat(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      user_id: currentUser.id,
      role: "user",
      message: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      } else {
        throw new Error("Gagal menerima balasan chatbot.");
      }
    } catch (err: any) {
      // Add error indicator
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        user_id: currentUser.id,
        role: "assistant",
        message: "Maaf, sistem mengalami gangguan koneksi ke LibBot AI. Silakan coba kirim ulang pesan Anda beberapa saat lagi.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  // Clear chat history
  const handleClearHistory = async () => {
    if (!currentUser) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dengan LibBot?")) return;
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      }
    } catch (err) {
      console.error("Failed to clear chat history", err);
    }
  };

  return (
    <div id="member-dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12 animate-fade-in">
      
      {/* LEFT & CENTER: Loans, Overdue notice, E-Books */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* WELCOME SUMMARY ACCENT */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white p-6 shadow-md flex items-center justify-between">
          <div className="absolute -right-20 -bottom-20 h-56 w-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold font-display">Halo, {currentUser?.name}!</h2>
            <p className="text-xs text-indigo-100/80 mt-1 max-w-md">Status keanggotaan aktif Anda berjalan normal. Terbuka akses penuh e-book premium.</p>
          </div>
          <div className="hidden sm:block text-right relative z-10 shrink-0">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest font-mono">Total Tagihan Denda</p>
            <p className="text-2xl font-black mt-1 text-indigo-100">Rp{totalFine.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* 🚨 ACTIVE FINE / OVERDUE DETAILED BANNER */}
        {totalFine > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50/75 p-5 flex items-start space-x-3.5">
            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5 animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">Pemberitahuan Denda Keterlambatan</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Anda memiliki keterlambatan pengembalian buku. Denda akumulasi Anda saat ini adalah <strong className="text-red-700">Rp{totalFine.toLocaleString("id-ID")}</strong>. Segera serahkan buku tersebut ke petugas perpustakaan di meja layanan untuk menghentikan denda harian.
              </p>
            </div>
          </div>
        )}

        {/* 1. CURRENT ACTIVE LOANS */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">Buku yang Sedang Dipinjam ({activeLoans.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar buku fisik yang saat ini berada di tangan Anda.</p>
            </div>
            
            <button
              onClick={onRefreshLoans}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
              title="Refresh status peminjaman"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {activeLoans.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Clock className="mx-auto h-12 w-12 text-slate-250" />
              <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tidak ada pinjaman buku aktif</p>
              <p className="text-xs">Cari buku menarik pada katalog utama untuk mulai mengajukan peminjaman.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activeLoans.map((loan) => (
                <div key={loan.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img
                      src={loan.book_cover}
                      alt={loan.book_title}
                      referrerPolicy="no-referrer"
                      className="h-14 w-10 object-cover rounded-lg shadow bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-bold font-display text-slate-800">{loan.book_title}</h4>
                      <p className="text-xs text-slate-500 font-semibold">karya {loan.book_author}</p>
                      
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                        <span className="flex items-center"><Calendar className="mr-1 h-3.5 w-3.5 text-indigo-550" /> Pinjam: {loan.borrow_date.split("T")[0]}</span>
                        <span className="flex items-center text-red-600"><Clock className="mr-1 h-3.5 w-3.5" /> Jatuh Tempo: {loan.due_date.split("T")[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      {loan.status === "overdue" ? (
                        <span className="inline-flex items-center rounded-lg bg-red-100 px-2.5 py-1 text-[9px] font-extrabold text-red-800 border border-red-200 uppercase tracking-widest font-mono">
                          TERLAMBAT
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-800 border border-indigo-100 uppercase tracking-widest font-mono">
                          AKTIF
                        </span>
                      )}
                      <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                        Denda: <span className={loan.fine_amount > 0 ? "text-red-600 font-extrabold" : "text-slate-500 font-bold"}>Rp{loan.fine_amount.toLocaleString("id-ID")}</span>
                      </p>
                    </div>

                    {/* Simulation Return button directly inside member dashboard to play and preview */}
                    <button
                      onClick={() => onReturnBook(loan.id)}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-850 text-xs font-bold uppercase tracking-wider px-3.5 py-2 transition-colors cursor-pointer"
                      title="Kembalikan buku ini (Simulasi)"
                    >
                      Kembalikan Buku
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. HISTORY OF COMPLETED LOANS */}
        {returnHistory.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold font-display text-slate-800 uppercase tracking-wider">Riwayat Pengembalian Lampau</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {returnHistory.map((loan) => (
                <div key={loan.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center space-x-3 truncate">
                    <img
                      src={loan.book_cover}
                      alt={loan.book_title}
                      referrerPolicy="no-referrer"
                      className="h-8 w-6 object-cover rounded-lg shadow-sm shrink-0 bg-slate-100"
                    />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate font-display">{loan.book_title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Kembali pada {loan.return_date?.split("T")[0]}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-widest font-mono">
                      TUNTAS
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Denda: Rp{loan.fine_amount.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ==========================================
          RIGHT: LIVE CHATBOT HELP (LIBBOT AI)
          ========================================== */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 rounded-2xl border border-slate-100 bg-white shadow-lg overflow-hidden flex flex-col h-[520px]">
          
          {/* Bot Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between shadow">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-indigo-600 text-white shadow shadow-indigo-500/20 animate-pulse">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wide font-display">LibBot Virtual Asisten</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Bertenaga AI</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Bersihkan riwayat chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === "assistant";
              return (
                <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                    isBot
                      ? "bg-white border border-slate-150 text-slate-800 rounded-tl-none"
                      : "bg-indigo-600 text-white rounded-tr-none font-medium"
                  }`}>
                    <p>{msg.message}</p>
                    <span className={`block text-[8px] mt-1 text-right font-mono ${
                      isBot ? "text-slate-400" : "text-indigo-200"
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {sendingChat && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl bg-white border border-slate-150 p-3 shadow-sm flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">LibBot sedang mengetik...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef}></div>
          </div>

          {/* Quick prompt chips */}
          <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5">
            <button
              onClick={() => setInputMessage("Bagaimana cara menghitung denda keterlambatan?")}
              className="text-[9px] font-bold bg-white border border-slate-200 hover:border-indigo-600 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-indigo-700 transition-all cursor-pointer"
            >
              Info Denda 💸
            </button>
            <button
              onClick={() => setInputMessage("Rekomendasikan buku fiksi terpopuler")}
              className="text-[9px] font-bold bg-white border border-slate-200 hover:border-indigo-600 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-indigo-700 transition-all cursor-pointer"
            >
              Rekomendasi 📚
            </button>
          </div>

          {/* Input Chat Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan rekomendasi, sirkulasi..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMessage.trim()}
              className="h-9 w-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
