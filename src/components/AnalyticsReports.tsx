import React, { useEffect, useState } from "react";
import { AnalyticsReport, User } from "../types";
import { TrendingUp, Award, Download, Printer, BarChart3, PieChart as PieIcon, LineChart, ShieldCheck, DollarSign, BookOpen, Users } from "lucide-react";

interface AnalyticsReportsProps {
  currentUser: User | null;
}

export default function AnalyticsReports({ currentUser }: AnalyticsReportsProps) {
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/analytics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) {
        throw new Error("Gagal mengambil data laporan analisis.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
    }
  }, [currentUser]);

  // Real CSV generation and download
  const handleCSVExport = () => {
    if (!data) return;
    const summaryHeaders = ["Metrik", "Nilai"];
    const summaryRows = [
      ["Total Koleksi Judul Buku", data.summary.totalBooks],
      ["Total Stok Fisik", data.summary.totalPhysicalStock],
      ["Total E-Book", data.summary.totalEbooks],
      ["Total Anggota Aktif", data.summary.totalMembers],
      ["Buku Sedang Dipinjam", data.summary.totalBorrowedCount],
      ["Keterlambatan Aktif", data.summary.overdueCount],
      ["Denda Berhasil Diterima (Rp)", data.summary.totalFinesCollected],
      ["Denda Berjalan / Tertunggak (Rp)", data.summary.totalPendingFines],
    ];

    const popularHeaders = ["Buku Populer", "Pengarang", "Jumlah Peminjaman"];
    const popularRows = data.popularBooks.map((b) => [b.title, b.author, b.count]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        ["=== RINGKASAN OPERASIONAL ==="].join(","),
        summaryHeaders.join(","),
        ...summaryRows.map((r) => r.join(",")),
        [],
        ["=== KOLEKSI BUKU PALING POPULER ==="].join(","),
        popularHeaders.join(","),
        ...popularRows.map((r) => r.join(",")),
      ]
        .map((e) => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LibWeb_Laporan_Perpustakaan_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable layout trigger
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-250 border-t-indigo-650"></div>
        <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Menghimpun statistik & grafik sirkulasi perpustakaan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/20 p-8 text-center max-w-lg mx-auto space-y-4">
        <ShieldCheck className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="text-base font-bold font-display text-slate-900 uppercase tracking-wider">Gagal Memuat Laporan</h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">{error || "Terjadi masalah koneksi ke server."}</p>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { summary, categoryDistribution, popularBooks, circulationTrend } = data;

  return (
    <div id="analytics-reports" className="space-y-8 pb-12 animate-fade-in print:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 pb-5 gap-4 print:border-b-2 print:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display print:text-2xl">Analisis & Laporan Perpustakaan</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium print:hidden">Laporan real-time status sirkulasi, popularitas judul buku, dan rekap denda perpustakaan.</p>
        </div>

        {/* Action Triggers */}
        <div className="flex space-x-2.5 print:hidden">
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-3 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <Download className="mr-1.5 h-4 w-4 text-slate-500" />
            Ekspor Laporan CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            Cetak / Ekspor PDF
          </button>
        </div>
      </div>

      {/* ==========================================
          BENTO GRID SUMMARY CARDS
          ========================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Koleksi */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Katalog Koleksi</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-display">{summary.totalBooks}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">Judul Buku Terdaftar</p>
          <p className="text-[9px] text-slate-400 mt-2 border-t border-slate-50 pt-2 font-mono font-medium">
            {summary.totalEbooks} E-Book • {summary.totalPhysicalStock} Stok Fisik
          </p>
        </div>

        {/* Siswa Terdaftar */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Anggota Siswa</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-750 border border-emerald-100">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-display">{summary.totalMembers}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">Siswa Terdaftar Aktif</p>
          <p className="text-[9px] text-emerald-700 font-bold mt-2 border-t border-slate-50 pt-2 uppercase tracking-widest font-mono">
            100% Terverifikasi Sistem
          </p>
        </div>

        {/* Buku Sedang Dipinjam */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Sirkulasi Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-slate-900 font-display">{summary.totalBorrowedCount}</p>
          <p className="text-xs text-slate-500 mt-1 font-bold">Buku Sedang Dibawa Pulang</p>
          <p className="text-[9px] text-red-600 font-bold mt-2 border-t border-slate-50 pt-2 flex items-center uppercase tracking-widest font-mono">
            {summary.overdueCount} Terlambat Pengembalian
          </p>
        </div>

        {/* Keuangan Denda */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Denda Terkumpul</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-4 text-xl font-extrabold text-slate-900 font-display">
            Rp{summary.totalFinesCollected.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-bold">Tuntas Dibayar Siswa</p>
          <p className="text-[9px] text-amber-700 font-bold mt-2 border-t border-slate-50 pt-2 uppercase tracking-widest font-mono">
            Rp{summary.totalPendingFines.toLocaleString("id-ID")} Tertunggak
          </p>
        </div>
      </div>

      {/* ==========================================
          CUSTOM HIGH-CRAFTSMANSHIP CHASTE GRAPHICS (SVG BASED)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPH 1: CIRCULATION TREND (Last 7 Days) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center font-display uppercase tracking-wider">
                <LineChart className="mr-2 h-4 w-4 text-indigo-600" />
                Tren Sirkulasi Harian (7 Hari Terakhir)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Membandingkan frekuensi peminjaman vs pengembalian buku harian.</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex space-x-3 text-[10px] font-bold uppercase tracking-wider font-mono">
              <span className="flex items-center text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-500 mr-1.5"></span>
                Pinjam
              </span>
              <span className="flex items-center text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>
                Kembali
              </span>
            </div>
          </div>

          {/* Render Sleek SVG Line Graph */}
          <div className="mt-6 relative h-56 w-full flex items-end">
            <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.2" />

              {/* Area path for Borrows (Indigo) */}
              <path
                d={`M 0,40 
                  ${circulationTrend
                    .map((t, index) => {
                      const x = (index / (circulationTrend.length - 1)) * 100;
                      const y = 40 - Math.min(35, t.borrowed * 10 + 5);
                      return `L ${x},${y}`;
                    })
                    .join(" ")} 
                  L 100,40 Z`}
                fill="rgba(79, 70, 229, 0.08)"
              />

              {/* Line path for Borrows (Indigo) */}
              <path
                d={circulationTrend
                  .map((t, index) => {
                    const x = (index / (circulationTrend.length - 1)) * 100;
                    const y = 40 - Math.min(35, t.borrowed * 10 + 5);
                    return `${index === 0 ? "M" : "L"} ${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Line path for Returns (Emerald) */}
              <path
                d={circulationTrend
                  .map((t, index) => {
                    const x = (index / (circulationTrend.length - 1)) * 100;
                    const y = 40 - Math.min(35, t.returned * 10 + 5);
                    return `${index === 0 ? "M" : "L"} ${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="1,1.5"
                strokeLinecap="round"
              />
            </svg>

            {/* X-Axis labels */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] font-mono font-bold text-slate-400 translate-y-5">
              {circulationTrend.map((t) => {
                const parts = t.date.split("-");
                return <span key={t.date}>{parts[1] || ""}/{parts[2] || ""}</span>;
              })}
            </div>
          </div>
          <div className="h-6"></div> {/* spacer for label offset */}
        </div>

        {/* GRAPH 2: CATEGORY DISTRIBUTION */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center font-display uppercase tracking-wider">
              <PieIcon className="mr-2 h-4 w-4 text-indigo-600" />
              Proporsi Kategori Koleksi
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Persentase jumlah koleksi per bidang subjek.</p>
          </div>

          <div className="mt-6 space-y-4">
            {categoryDistribution.map((cat, i) => {
              const colors = ["bg-indigo-600", "bg-emerald-600", "bg-amber-500", "bg-slate-700", "bg-violet-500"];
              const color = colors[i % colors.length];
              const totalItems = categoryDistribution.reduce((sum, c) => sum + c.value, 0);
              const percentage = Math.round((cat.value / (totalItems || 1)) * 100);

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{cat.name}</span>
                    <span className="font-mono text-slate-400 font-bold">{cat.value} buku ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {categoryDistribution.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">Belum ada buku terdaftar dalam kategori.</p>
            )}
          </div>
        </div>

      </div>

      {/* POPULAR BOOKS BAR TABLE */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center font-display uppercase tracking-wider">
            <Award className="mr-2 h-4.5 w-4.5 text-indigo-600" />
            Top 5 Buku Paling Populer (Kerap Dipinjam)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Paling sering dipinjam oleh siswa dalam sebulan terakhir.</p>
        </div>

        <div className="mt-6 space-y-4.5">
          {popularBooks.map((b, idx) => {
            const maxVal = Math.max(...popularBooks.map((o) => o.count)) || 1;
            const barWidth = Math.round((b.count / maxVal) * 100);

            return (
              <div key={b.title} className="flex items-center space-x-4">
                <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-bold text-slate-500 font-mono">
                  #{idx + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-sm font-display">{b.title} <span className="text-slate-400 font-medium">oleh {b.author}</span></span>
                    <span className="font-mono font-bold text-indigo-700">{b.count} Kali Dipinjam</span>
                  </div>
                  {/* SVG style bar */}
                  <div className="h-3.5 w-full bg-slate-150 rounded-2xl overflow-hidden relative border border-slate-50">
                    <div className="h-full bg-indigo-600 rounded-2xl transition-all duration-500" style={{ width: `${barWidth}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
          {popularBooks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">Belum ada aktivitas peminjaman buku untuk dianalisis.</p>
          )}
        </div>
      </div>

    </div>
  );
}
