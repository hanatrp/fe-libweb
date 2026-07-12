import React from "react";
import { BookOpen, User as UserIcon, LogOut, Shield, GraduationCap, Globe, RefreshCw } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  onRoleChange: (role: "guest" | "member" | "admin") => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onShowLoginModal: () => void;
}

export default function Navbar({
  currentUser,
  onRoleChange,
  activeTab,
  setActiveTab,
  onLogout,
  onShowLoginModal,
}: NavbarProps) {
  return (
    <header id="libweb-header" className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-800">
              Lib<span className="text-indigo-600">Web</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "home"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Katalog Buku
          </button>

          {currentUser?.role === "member" && (
            <>
              <button
                onClick={() => setActiveTab("member-dashboard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "member-dashboard"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Dashboard Saya
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "profile"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Profil & Riwayat
              </button>
            </>
          )}

          {currentUser?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("admin-dashboard")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "admin-dashboard"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Panel Sirkulasi
              </button>
              <button
                onClick={() => setActiveTab("user-management")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "user-management"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Manajemen Anggota
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "analytics"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Analisis & Laporan
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "profile"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Kebijakan Denda
              </button>
            </>
          )}
        </nav>

        {/* Simulator Switching, User Profile Pill or Login Trigger */}
        <div className="flex items-center space-x-3">
          
          {/* SIMULATOR QUICK SWITCHER */}
          {/* <div className="flex items-center rounded-2xl bg-slate-100 p-1 text-xs">
            <span className="hidden lg:inline-block px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Role:
            </span>
            <button
              onClick={() => onRoleChange("guest")}
              className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 transition-all text-[11px] ${
                currentUser === null
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-850"
              }`}
              title="Switch to Guest Visitor view"
            >
              <Globe className="h-3 w-3" />
              <span className="hidden sm:inline font-bold uppercase tracking-wider">Tamu</span>
            </button>
            <button
              onClick={() => onRoleChange("member")}
              className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 transition-all text-[11px] ${
                currentUser?.role === "member"
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-500 hover:text-indigo-700"
              }`}
              title="Switch to Student / Member view"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-bold uppercase tracking-wider">Siswa</span>
            </button>
            <button
              onClick={() => onRoleChange("admin")}
              className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 transition-all text-[11px] ${
                currentUser?.role === "admin"
                  ? "bg-white text-indigo-700 shadow-sm font-bold"
                  : "text-slate-500 hover:text-indigo-700"
              }`}
              title="Switch to Librarian / Admin view"
            >
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline font-bold uppercase tracking-wider">Petugas</span>
            </button>
          </div> */}

          {/* User Profile Info & Action */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div 
                onClick={() => setActiveTab("profile")}
                className="flex items-center space-x-2 rounded-2xl border border-slate-150 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 cursor-pointer transition-colors"
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-xl text-white font-bold text-xs ${
                  currentUser.role === "admin" ? "bg-indigo-600" : "bg-indigo-600"
                }`}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800 max-w-[100px] truncate">{currentUser.name}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {currentUser.role === "admin" ? "Petugas" : "Anggota"}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onShowLoginModal}
              className="flex items-center space-x-1 bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
