import React, { useState } from "react";
import { User } from "../types";
import { UserPlus, Edit2, Trash2, RotateCcw, ShieldCheck, ShieldAlert, GraduationCap, Sparkles } from "lucide-react";

interface UserManagementProps {
  users: User[];
  onAddUser: (userData: Omit<User, "id" | "created_at" | "updated_at" | "deleted_at">) => void;
  onUpdateUser: (id: string, userData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onRestoreUser: (id: string) => void;
  isLoading: boolean;
}

export default function UserManagement({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRestoreUser,
  isLoading,
}: UserManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "password123",
    role: "member" as "admin" | "member",
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "member" as "admin" | "member",
  });

  const activeUsers = users.filter((u) => u.deleted_at === null);
  const deletedUsers = users.filter((u) => u.deleted_at !== null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    onAddUser(newUser);
    setNewUser({ name: "", email: "", password: "password123", role: "member" });
    setShowAddForm(false);
  };

  const handleEditClick = (u: User) => {
    setEditingUserId(u.id);
    setEditUserData({
      name: u.name,
      email: u.email,
      role: u.role,
    });
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    onUpdateUser(id, editUserData);
    setEditingUserId(null);
  };

  return (
    <div id="user-management" className="space-y-8 pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Manajemen Anggota</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Mendaftarkan siswa baru, menetapkan peran petugas, atau mengelola penangguhan keanggotaan.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs px-5 py-3 shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          {showAddForm ? "Tutup Formulir" : "Tambah Anggota Baru"}
        </button>
      </div>

      {/* ADD MEMBER FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-md space-y-5 animate-fade-in">
          <h3 className="text-base font-bold font-display text-indigo-750 flex items-center uppercase tracking-wider">
            <Sparkles className="mr-2 h-5 w-5 text-indigo-600" /> Daftarkan Keanggotaan Baru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Lengkap Siswa / Petugas</label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                placeholder="e.g. Ahmad Dhani"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alamat Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                placeholder="e.g. dhani@libweb.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peran / Hak Akses</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "admin" | "member" })}
                className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer font-semibold"
              >
                <option value="member">Siswa (Anggota)</option>
                <option value="admin">Petugas (Admin)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
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
              Simpan Anggota
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE USERS TABLE */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold font-display text-slate-900">Daftar Anggota Aktif ({activeUsers.length} orang)</h3>
          <p className="text-xs text-slate-500 mt-1">Status keanggotaan aktif dapat ditangguhkan sementara (SoftDelete) jika terdapat pelanggaran pengembalian berulang.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-250 border-t-indigo-650"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 font-mono">
                <tr>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Peran (Role)</th>
                  <th className="p-4">Tanggal Pendaftaran</th>
                  <th className="p-4 text-right">Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      {editingUserId === u.id ? (
                        <input
                          type="text"
                          value={editUserData.name}
                          onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full font-semibold"
                        />
                      ) : (
                        <div className="flex items-center space-x-2.5">
                          <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-full text-white font-extrabold text-xs shadow-sm font-display ${
                            u.role === "admin" ? "bg-indigo-600" : "bg-emerald-650"
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 font-display">{u.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUserId === u.id ? (
                        <input
                          type="email"
                          value={editUserData.email}
                          onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full font-mono"
                        />
                      ) : (
                        <span className="font-mono text-slate-500 font-semibold">{u.email}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUserId === u.id ? (
                        <select
                          value={editUserData.role}
                          onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value as "admin" | "member" })}
                          className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                        >
                          <option value="member">Siswa</option>
                          <option value="admin">Petugas</option>
                        </select>
                      ) : u.role === "admin" ? (
                        <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-150 px-2.5 py-1 text-[9px] font-bold text-indigo-800 uppercase tracking-widest font-mono">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                          <span>Petugas</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-150 px-2.5 py-1 text-[9px] font-bold text-emerald-800 uppercase tracking-widest font-mono">
                          <GraduationCap className="mr-1 h-3.5 w-3.5" />
                          <span>Siswa</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-bold font-mono">
                      {u.created_at.split("T")[0]}
                    </td>
                    <td className="p-4 text-right">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => handleEditSubmit(e, u.id)}
                            className="bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl px-3 py-1.5 font-bold text-[10px] cursor-pointer uppercase tracking-wider"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl px-3 py-1.5 font-bold text-[10px] cursor-pointer uppercase tracking-wider"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-750 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Anggota"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Tangguhkan Anggota"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SOFT DELETED MEMBERS */}
      {deletedUsers.length > 0 && (
        <div className="rounded-3xl border border-dashed border-red-200 bg-red-50/5 p-6 space-y-4">
          <div className="flex items-center space-x-2 text-red-800">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-display">Arsip Penangguhan Keanggotaan (SoftDeletes)</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Daftar keanggotaan siswa yang ditangguhkan. Riwayat denda dan catatan sirkulasi lampau tetap terjaga utuh secara administratif. Anda dapat memulihkan akses siswa ini kapan saja.
          </p>

          <div className="divide-y divide-slate-150 rounded-2xl border border-red-100 bg-white p-2">
            {deletedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3.5 text-xs">
                <div>
                  <p className="font-bold text-slate-800 font-display">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{u.email} • Ditangguhkan pada {u.deleted_at?.split("T")[0]}</p>
                </div>
                <button
                  onClick={() => onRestoreUser(u.id)}
                  className="inline-flex items-center space-x-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-3.5 py-2 font-bold uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Aktifkan Kembali</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
