import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { titleCase } from "title-case";
import { formatDate, isInDateRange } from "../../lib/utils";
import { HasilTes, Peserta } from "../../types";
import ConfirmModal from "../../components/ConfirmModal";
import { Search, MapPin, Calendar, Download, Trash2, CalendarDays } from "lucide-react";
import * as XLSX from "xlsx";

export default function PesertaList({ tipe }: { tipe: "evaluasi" | "seleksi" }) {
  const { peserta, daerah, tes, hasilTes, deletePeserta } = useAppStore();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deletePeserta(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Date filter follows test dates, so a participant tested across several months
  // shows up in every month they were tested. Participants without tests fall back to registration date.
  const filtered = peserta.filter(p => {
    if (p.tipe_peserta !== tipe) return false;
    
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || 
      daerah.find(d => d.id === p.daerah_id)?.nama.toLowerCase().includes(search.toLowerCase());
    
    if (!matchSearch) return false;
    
    if (dateFrom || dateTo) {
      const userHasil = hasilTes.filter(h => h.peserta_id === p.id);
      if (userHasil.length > 0) {
        return userHasil.some(h => isInDateRange(h.tanggal_tes, dateFrom, dateTo));
      }
      return isInDateRange(p.created_at, dateFrom, dateTo);
    }
    
    return true;
  });

  const handleExport = () => {
    const labelLulus = tipe === "evaluasi" ? "Layak Diberi SK" : "Lulus";
    const labelTidakLulus = tipe === "evaluasi" ? "Tidak Layak Diberi SK" : "Tidak Lulus";
    const activeTes = tes.filter(t => t.tipe === tipe && t.is_active).sort((a, b) => a.order - b.order);

    // The same person may have been registered more than once (same name, daerah and tipe),
    // with each test recorded under a different record. Merge them into one row per person.
    const personKey = (p: Peserta) => `${p.nama.trim().toLowerCase()}|${p.daerah_id}`;
    const groups = new Map<string, Peserta[]>();
    peserta.filter(p => p.tipe_peserta === tipe).forEach(p => {
      const key = personKey(p);
      groups.set(key, [...(groups.get(key) || []), p]);
    });
    const exportKeys = Array.from(new Set(filtered.map(personKey)));

    const testColumns = new Map<string, number>();

    const dataToExport = exportKeys.map(key => {
      const records = [...groups.get(key)!].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const p = records[0];
      const d = daerah.find(x => x.id === p.daerah_id);
      const recordIds = new Set(records.map(r => r.id));

      // Keep only the latest attempt of each test
      const latestByTes = new Map<string, HasilTes>();
      hasilTes
        .filter(h => recordIds.has(h.peserta_id))
        .forEach(h => {
          const prev = latestByTes.get(h.tes_id);
          if (!prev || new Date(h.tanggal_tes) > new Date(prev.tanggal_tes)) latestByTes.set(h.tes_id, h);
        });
      const userHasil = Array.from(latestByTes.values());

      // Every active test must be taken and passed; any failure makes the final result a failure
      const requiredHasil = activeTes.map(t => latestByTes.get(t.id));
      let hasilAkhir: string;
      if (userHasil.length === 0) hasilAkhir = "Belum ada hasil";
      else if (userHasil.some(h => !h.is_lulus)) hasilAkhir = labelTidakLulus;
      else if (requiredHasil.some(h => !h)) hasilAkhir = "Belum Lengkap";
      else hasilAkhir = labelLulus;

      const exportRow: Record<string, any> = {
        "Nama Peserta": p.nama,
        "Usia": p.usia,
        "Pekerjaan": p.pekerjaan,
        "Nomor Telepon": p.nomor_telepon,
        "Daerah": d?.nama || "-",
        "Wilayah": d?.wilayah || "-",
        "Tanggal Daftar": formatDate(p.created_at),
      };

      userHasil.forEach(h => {
        const colName = `Tes ${titleCase(h.snapshot_tes.nama.toLowerCase())}`;
        testColumns.set(colName, h.snapshot_tes.order);
        exportRow[colName] = `${h.skor_akhir} (${h.label_hasil})`;
        exportRow[`Tanggal ${colName}`] = formatDate(h.tanggal_tes);
      });

      exportRow["Hasil Akhir"] = hasilAkhir;

      return exportRow;
    });

    activeTes.forEach(t => testColumns.set(`Tes ${titleCase(t.nama.toLowerCase())}`, t.order));
    const sortedTestColumns = Array.from(testColumns.entries())
      .sort((a, b) => a[1] - b[1])
      .flatMap(([colName]) => [colName, `Tanggal ${colName}`]);

    const header = [
      "Nama Peserta",
      "Usia",
      "Pekerjaan",
      "Nomor Telepon",
      "Daerah",
      "Wilayah",
      "Tanggal Daftar",
      ...sortedTestColumns,
      "Hasil Akhir"
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Peserta_${tipe}`);

    // Generate buffer and download
    XLSX.writeFile(workbook, `Data_Peserta_${tipe}_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-[#171c1f]">Data Peserta {tipe}</h2>
          <p className="mt-1 sm:mt-2 text-[#4f606b] font-medium text-sm sm:text-lg">Kelola dan lihat profil peserta program {tipe}.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary group">
          <Download className="w-5 h-5 mr-2 text-primary group-hover:text-primary-container" />
          Export Data (XLSX)
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-11 w-full"
            placeholder="Cari berdasarkan nama atau daerah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarDays className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              className="input-field pl-9 text-sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Tanggal mulai"
            />
          </div>
          <span className="text-gray-400 text-sm">s/d</span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarDays className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              className="input-field pl-9 text-sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Tanggal akhir"
            />
          </div>
          {(search || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
              className="text-xs text-gray-500 hover:text-red-500 px-2 py-1 rounded transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table min-w-full divide-y divide-[#bdc8cb]/30">
            <thead className="bg-[#f0f4f8]/50 border-b border-[#bdc8cb]/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Info Peserta</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Daerah</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Telepon</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Tgl Daftar</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bdc8cb]/20">
              {filtered.map(p => {
                const d = daerah.find(x => x.id === p.daerah_id);
                return (
                  <tr key={p.id} className="hover:bg-primary/5 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="font-display font-medium text-primary text-base">{p.nama}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.usia} Thn <span className="opacity-50 mx-1">•</span> {p.pekerjaan}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[#171c1f]">
                        <MapPin className="w-4 h-4 mr-2 text-primary opacity-80" />
                        {d?.nama || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-[#171c1f] font-mono">
                      {p.nomor_telepon}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[#171c1f]">
                        <Calendar className="w-4 h-4 mr-2 text-primary opacity-80" />
                        {formatDate(p.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Link to={`/peserta/detail/${p.id}`} className="btn-secondary py-1.5 px-4 text-xs">
                          Lihat Detail
                        </Link>
                        <button 
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="btn-secondary py-1.5 px-2 text-xs text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 border-dashed border-[#bdc8cb]/30 bg-[#f0f4f8]/30">Tidak ada peserta ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-[#bdc8cb]/20">
            {filtered.map(p => {
              const d = daerah.find(x => x.id === p.daerah_id);
              return (
                <div key={p.id} className="p-4 space-y-3 hover:bg-primary/5 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-display font-bold text-primary text-base">{p.nama}</div>
                      <div className="text-xs text-gray-500 mt-1">{p.usia} Thn <span className="opacity-50 mx-1">•</span> {p.pekerjaan}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#171c1f]">
                    <div className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary opacity-80" />
                      {d?.nama || "-"}
                    </div>
                    <div className="flex items-center font-mono">
                      {p.nomor_telepon}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary opacity-80" />
                      {formatDate(p.created_at)}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/peserta/detail/${p.id}`} className="btn-secondary py-1 px-3 text-xs w-auto">
                        Detail
                      </Link>
                      <button 
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="btn-secondary py-1 px-2 text-xs w-auto text-red-500 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-[#f0f4f8]/30">
                Tidak ada peserta ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Hapus Peserta?"
        message="Apakah Anda yakin ingin menghapus peserta ini? Semua data terkait (termasuk hasil tes) juga akan terhapus dan tidak dapat dikembalikan."
        confirmText="Hapus"
        variant="danger"
      />
    </div>
  );
}
