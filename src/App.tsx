import React, { useState, useEffect } from "react";
import { API_BASE } from "./config";
import Navbar from "./components/Navbar.tsx";
import LandingPage from "./components/LandingPage.tsx";
import AdminDashboard from "./components/AdminDashboard.tsx";
import UserManagement from "./components/UserManagement.tsx";
import AnalyticsReports from "./components/AnalyticsReports.tsx";
import MemberDashboard from "./components/MemberDashboard.tsx";
import EbookReader from "./components/EbookReader.tsx";
import ProfileSettings from "./components/ProfileSettings.tsx";
import { User, Book, Loan, SystemSettings } from "./types";
import { LogIn, X, Info, HelpCircle } from "lucide-react";

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ fine_rate: 1000, max_loan_days: 7 });
  const [activeTab, setActiveTab] = useState<string>("home");
  const [activeEbook, setActiveEbook] = useState<Book | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Manual Login Form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // ==========================================
  // 📥 API LOADING METHODS
  // ==========================================

  const fetchBooks = async () => {
    try {
      const headers: any = {};
      if (currentUser) headers.Authorization = `Bearer ${authToken}`;
      const includeDeleted = currentUser?.role === "admin" ? "?include_deleted=true" : "";
      
      const res = await fetch(`${API_BASE}/books${includeDeleted}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
      }
    } catch (err) {
      console.error("Gagal memuat katalog buku", err);
    }
  };

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/users?include_deleted=true`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Gagal memuat data anggota", err);
    }
  };

  const fetchLoans = async () => {
    if (!currentUser) {
      setLoans([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/loans`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans);
      }
    } catch (err) {
      console.error("Gagal memuat sirkulasi peminjaman", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Gagal memuat kebijakan sistem", err);
    }
  };

  // Reload data context
  const reloadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchBooks(), fetchUsers(), fetchLoans(), fetchSettings()]);
    setIsLoading(false);
  };

  // Check and restore login session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            setActiveTab(data.user.role === "admin" ? "admin-dashboard" : "member-dashboard");
          } else {
            localStorage.removeItem('token');
            setAuthToken(null);
          }
        } catch (err) {
          console.error("Failed to restore session", err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    restoreSession();
  }, []);

  // Initial loading and context reload when currentUser changes
  useEffect(() => {
    reloadData();
  }, [currentUser]);

  // ==========================================
  // ⚡ SIMULATION ROLE QUICK SWITCHING
  // ==========================================

  const handleRoleChange = async (role: "guest" | "member" | "admin") => {
    if (role === "guest") {
      setCurrentUser(null);
      setActiveTab("home");
    } else if (role === "member") {
      // Auto login as Budi Santoso (siswa@libweb.com)
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "siswa@libweb.com", password: "password123" }),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(data.token);
          localStorage.setItem('token', data.token);
          setActiveTab("member-dashboard");
        }
      } catch (err) {
        console.error("Auto login as member failed", err);
      } finally {
        setIsLoading(false);
      }
    } else if (role === "admin") {
      // Auto login as Admin Perpus (admin@libweb.com)
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "admin@libweb.com", password: "password123" }),
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthToken(data.token);
          localStorage.setItem('token', data.token);
          setActiveTab("admin-dashboard");
        }
      } catch (err) {
        console.error("Auto login as admin failed", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('token');
    setActiveTab("home");
  };

  // ==========================================
  // 🔑 MANUAL LOGIN OPERATIONS
  // ==========================================

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('token', data.token);
        setShowLoginModal(false);
        setLoginEmail("");
        setLoginPassword("");
        setActiveTab(data.user.role === "admin" ? "admin-dashboard" : "member-dashboard");
      } else {
        setLoginError(data.error || "Login gagal.");
      }
    } catch (err) {
      setLoginError("Koneksi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 📝 USER ACTIONS & API INTERFACES
  // ==========================================

  // Borrow Book sirkulasi
  const handleBorrowBook = async (bookId: string, studentId?: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/loans/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          book_id: bookId,
          student_id: studentId || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        reloadData();
      } else {
        alert(`Gagal Pinjam: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Return Book sirkulasi
  const handleReturnBook = async (loanId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/loans/${loanId}/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        reloadData();
      } else {
        alert(`Gagal Pengembalian: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Add Book (Admin)
  const handleAddBook = async (bookData: any) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Buku berhasil ditambahkan.");
        fetchBooks();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Update Book (Admin)
  const handleUpdateBook = async (id: string, bookData: any) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Buku berhasil diperbarui.");
        fetchBooks();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Delete Book SoftDelete
  const handleDeleteBook = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    if (!window.confirm("Apakah Anda yakin ingin melakukan SoftDelete pada buku ini? Data sirkulasi lampau tetap aman.")) return;
    
    try {
      const res = await fetch(`${API_BASE}/books/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBooks();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Restore Book SoftDelete
  const handleRestoreBook = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/books/${id}/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBooks();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Add User (Admin)
  const handleAddUser = async (userData: any) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Update User (Admin)
  const handleUpdateUser = async (id: string, userData: any) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Delete User SoftDelete
  const handleDeleteUser = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    if (!window.confirm("Apakah Anda yakin ingin menangguhkan keanggotaan siswa ini secara sementara?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Restore User SoftDelete
  const handleRestoreUser = async (id: string) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/restore`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah sirkulasi.");
    }
  };

  // Update profile current student/admin
  const handleUpdateProfile = async (profileData: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/auth/profile/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCurrentUser(data.user);
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  // Update policy system settings (Admin)
  const handleUpdateSettings = async (settingsData: any) => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settingsData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchSettings();
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Terjadi masalah koneksi.");
    }
  };

  return (
    <div id="libweb-app" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Dynamic Navbar with Interactive Quick Role Switching */}
      <Navbar
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onShowLoginModal={() => setShowLoginModal(true)}
      />

      {/* MAIN LAYOUT WRAPPER */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === "home" && (
          <LandingPage
            books={books}
            currentUser={currentUser}
            onBorrow={(bookId) => handleBorrowBook(bookId)}
            onReadEbook={(b) => setActiveEbook(b)}
            onShowLoginModal={() => setShowLoginModal(true)}
            isLoading={isLoading}
          />
        )}

        {activeTab === "member-dashboard" && currentUser?.role === "member" && (
          <MemberDashboard
            currentUser={currentUser}
            loans={loans}
            books={books}
            onReturnBook={handleReturnBook}
            onReadEbook={(b) => setActiveEbook(b)}
            onRefreshLoans={fetchLoans}
          />
        )}

        {activeTab === "admin-dashboard" && currentUser?.role === "admin" && (
          <AdminDashboard
            books={books}
            users={users}
            loans={loans}
            settings={settings}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            onRestoreBook={handleRestoreBook}
            onBorrowBook={(studentId, bookId) => handleBorrowBook(bookId, studentId)}
            onReturnBook={handleReturnBook}
            isLoading={isLoading}
          />
        )}

        {activeTab === "user-management" && currentUser?.role === "admin" && (
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onRestoreUser={handleRestoreUser}
            isLoading={isLoading}
          />
        )}

        {activeTab === "analytics" && currentUser?.role === "admin" && (
          <AnalyticsReports currentUser={currentUser} />
        )}

        {activeTab === "profile" && currentUser && (
          <ProfileSettings
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* ==========================================
          MODAL 1: STUDY INTERACTIVE E-BOOK PREVIEWER
          ========================================== */}
      {activeEbook && (
        <EbookReader book={activeEbook} onClose={() => setActiveEbook(null)} />
      )}

      {/* ==========================================
          MODAL 2: MANUAL LOG IN PORTAL
          ========================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-slide-in">
            
            {/* Modal header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LogIn className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm tracking-wide">Login LibWeb</span>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleManualLogin} className="p-6 space-y-4">
              
              {/* Simulator info panel */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-[11px] text-emerald-800">
                <p className="font-bold uppercase tracking-wide flex items-center">
                  <Info className="mr-1.5 h-3.5 w-3.5" />
                  Gunakan Akun Pengujian Cepat:
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-0.5">
                  <li><strong>Siswa:</strong> <code>siswa@libweb.com</code> / <code>password123</code></li>
                  <li><strong>Petugas:</strong> <code>admin@libweb.com</code> / <code>password123</code></li>
                </ul>
              </div>

              {loginError && (
                <div className="rounded-xl bg-red-50 text-red-700 p-2.5 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="siswa@libweb.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase">Kata Sandi</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 transition-colors cursor-pointer"
              >
                Masuk Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 print:hidden mt-auto">
        <p>© {new Date().getFullYear()} LibWeb • Sistem Informasi Perpustakaan Terpadu. All rights reserved.</p>
      </footer>

    </div>
  );
}
