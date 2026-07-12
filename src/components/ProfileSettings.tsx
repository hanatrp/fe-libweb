import React, { useState, useEffect } from "react";
import { User, SystemSettings } from "../types";
import { Save, ShieldAlert, Key, Settings, Coins, CalendarDays } from "lucide-react";

interface ProfileSettingsProps {
  currentUser: User | null;
  onUpdateProfile: (userData: { name: string; email: string; password?: string }) => void;
  onUpdateSettings: (settingsData: Partial<SystemSettings>) => void;
  isLoading: boolean;
}

export default function ProfileSettings({
  currentUser,
  onUpdateProfile,
  onUpdateSettings,
  isLoading,
}: ProfileSettingsProps) {
  // Profile inputs
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Settings inputs
  const [sysSettings, setSysSettings] = useState<SystemSettings | null>(null);

  // Load profile values when user switches
  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name,
        email: currentUser.email,
        password: "",
      });
    }
  }, [currentUser]);

  // Load initial settings
  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSysSettings(data.settings);
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan kebijakan perpustakaan", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.email) return;
    onUpdateProfile(profile);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sysSettings) return;
    onUpdateSettings(sysSettings);
  };

  return (
    <div id="profile-settings" className="space-y-8 pb-12 max-w-4xl mx-auto animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="border-b border-slate-150 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Ubah kata sandi pribadi Anda atau sesuaikan tarif denda perpustakaan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT CARD: PERSONAL PROFILE EDITOR */}
        <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4 text-indigo-800 font-display uppercase tracking-wider">
            <Key className="h-5 w-5 text-indigo-650" />
            <h2 className="text-base font-bold">Profil Akun Saya</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kata Sandi Baru (Opsional)</label>
              <input
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                placeholder="Biarkan kosong jika tidak ingin diubah"
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs py-3.5 shadow-sm transition-colors cursor-pointer uppercase tracking-widest"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Simpan Perubahan Profil
          </button>
        </form>

        {/* RIGHT CARD: SYSTEM POLICIES (ADMIN ONLY) */}
        {currentUser?.role === "admin" ? (
          sysSettings && (
            <form onSubmit={handleSettingsSubmit} className="rounded-3xl border border-indigo-100 bg-indigo-50/20 p-6 shadow-sm space-y-6">
              <div className="flex items-center space-x-2 border-b border-indigo-100 pb-4 text-indigo-800 font-display uppercase tracking-wider">
                <Settings className="h-5 w-5 text-indigo-700" />
                <h2 className="text-base font-bold">Kebijakan Denda & Sirkulasi</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Konfigurasi ini dikendalikan oleh Petugas untuk menegakkan kedisiplinan pengembalian buku di LibWeb.
              </p>

              <div className="space-y-5">
                {/* Fine Rate (Denda per Hari) */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mb-1.5">
                    <Coins className="mr-1.5 h-4 w-4 text-amber-500" />
                    Tarif Denda Keterlambatan (Rupiah / Hari)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={sysSettings.fine_rate}
                    onChange={(e) => setSysSettings({ ...sysSettings, fine_rate: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                  />
                </div>

                {/* Maximum borrow duration */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mb-1.5">
                    <CalendarDays className="mr-1.5 h-4 w-4 text-indigo-500" />
                    Batas Maksimal Durasi Pinjam (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sysSettings.max_loan_days}
                    onChange={(e) => setSysSettings({ ...sysSettings, max_loan_days: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs py-3.5 shadow-sm transition-colors cursor-pointer uppercase tracking-widest"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Simpan Konfigurasi Kebijakan
              </button>
            </form>
          )
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-center items-center text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-display">Kebijakan Denda & Batas Pinjam</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-semibold">
              Halaman penyesuaian tarif denda dan durasi pinjam dinonaktifkan untuk peran siswa. Akses konfigurasi ini memerlukan peran Petugas/Admin perpustakaan.
            </p>
            <div className="bg-white border border-slate-150 p-4 rounded-2xl text-left text-xs text-slate-600 font-medium">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1.5">📌 Kebijakan saat ini:</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 font-semibold font-mono">
                <li>Tarif Denda: Rp{sysSettings?.fine_rate.toLocaleString("id-ID") || "1.000"} / hari</li>
                <li>Durasi Pinjam: {sysSettings?.max_loan_days || 7} hari</li>
              </ul>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
