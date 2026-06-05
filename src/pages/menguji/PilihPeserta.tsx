import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";
import { Peserta } from "../../types";
import { Search, Plus, UserCircle, MapPin, CalendarDays, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "../../lib/utils";

export default function PilihPeserta() {
  const { tipe } = useParams<{ tipe: string }>();
  const navigate = useNavigate();
  const { peserta, daerah, settings, addPeserta, hasilTes } = useAppStore();
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [duplicatePeserta, setDuplicatePeserta] = useState<Peserta | null>(null);

  // Filter peserta by tipe and search
  const filteredPeserta = peserta.filter(p => {
    if (p.tipe_peserta !== tipe) return false;
    
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) || p.nomor_telepon.includes(search);
    if (!matchSearch) return false;
    
    if (dateFrom || dateTo) {
      const created = new Date(p.created_at);
      created.setHours(0, 0, 0, 0);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (created > to) return false;
      }
    }
    
    return true;
  });

  // Form State for new Peserta
  const [formData, setFormData] = useState({
    nama: "",
    usia: "",
    daerah_id: "",
    pekerjaan: "",
    nomor_telepon: "",
    metadata: {} as Record<string, any>
  });

  const activeSettings = settings.find(s => s.tipe === tipe);
  const metadataFields = activeSettings?.metadata_fields || [];

  const handleCreatePeserta = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const existing = peserta.find(p =>
      p.nama.toLowerCase() === formData.nama.toLowerCase().trim() &&
      p.daerah_id === formData.daerah_id &&
      p.tipe_peserta === tipe
    );

    if (existing) {
      setDuplicatePeserta(existing);
      return;
    }

    await doCreatePeserta();
  };

  const doCreatePeserta = async () => {
    if (!user) return;

    const newP = await addPeserta({
      nama: formData.nama.trim(),
      usia: Number(formData.usia),
      daerah_id: formData.daerah_id,
      pekerjaan: formData.pekerjaan,
      nomor_telepon: formData.nomor_telepon,
      tipe_peserta: tipe as "evaluasi" | "seleksi",
      metadata: formData.metadata,
      created_by: user.id
    });
    
    setIsNewModalOpen(false);
    setDuplicatePeserta(null);
    if(newP) {
      navigate(`/menguji/peserta/${newP.id}`);
    }
  };

  const setMetaField = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value }
    }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-tight text-[#171c1f] capitalize mb-1">Pilih Peserta {tipe}</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Cari peserta yang sudah ada atau daftarkan peserta baru.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Daftarkan Peserta Baru
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
            placeholder="Cari nama atau nomor telepon peserta..."
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPeserta.map(p => {
          const d = daerah.find(x => x.id === p.daerah_id);
          return (
            <div 
              key={p.id} 
              onClick={() => navigate(`/menguji/peserta/${p.id}`)}
              className="solid-card p-4 sm:p-6 cursor-pointer hover:border-primary/50 hover:shadow-lg border border-transparent shadow-sm hover:-translate-y-1 transition duration-300"
            >
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2.5 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl">
                  <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-[#171c1f]">{p.nama}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary opacity-70" />
                    {d?.nama || "-"}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 font-mono tracking-tight">{p.nomor_telepon}</div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredPeserta.length === 0 && (search || dateFrom || dateTo) && (
          <div className="col-span-full text-center py-16 text-gray-500 border border-dashed border-[#bdc8cb]/30 rounded-xl bg-[#f0f4f8]/50">
            Peserta tidak ditemukan. Silakan daftarkan peserta baru.
          </div>
        )}
      </div>

      {/* Modal Peserta Baru */}
      {isNewModalOpen && !duplicatePeserta && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card shadow-2xl max-w-3xl w-full p-5 sm:p-6 md:p-10 my-4 sm:my-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-[#171c1f] mb-4 sm:mb-6 md:mb-8 capitalize">Daftar Peserta {tipe} Baru</h3>
            
            <form onSubmit={handleCreatePeserta} className="space-y-5 sm:space-y-8">
              {/* Biodata Wajib */}
              <div className="space-y-5">
                <h4 className="font-display font-medium text-lg text-primary border-b border-[#bdc8cb]/30 pb-2">Informasi Dasar</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-600">Nama Lengkap*</label>
                    <input type="text" required value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-600">Usia*</label>
                    <input type="number" required value={formData.usia} onChange={e=>setFormData({...formData, usia:e.target.value})} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-600">Pekerjaan*</label>
                    <input type="text" required value={formData.pekerjaan} onChange={e=>setFormData({...formData, pekerjaan:e.target.value})} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-600">Nomor Telepon*</label>
                    <input type="text" required value={formData.nomor_telepon} onChange={e=>setFormData({...formData, nomor_telepon:e.target.value})} className="input-field w-full font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1.5 text-gray-600">Daerah*</label>
                    <select required value={formData.daerah_id} onChange={e=>setFormData({...formData, daerah_id:e.target.value})} className="input-field w-full appearance-none">
                      <option value="">-- Pilih Daerah --</option>
                      {daerah.map(d => <option key={d.id} value={d.id}>{d.nama} ({d.wilayah})</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dinamis Metadata */}
              {metadataFields.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-display font-medium text-lg text-primary border-b border-[#bdc8cb]/30 pb-2 mt-2">Informasi Tambahan <span className="text-sm font-sans font-normal opacity-70 ml-2">(Sesuai Konfigurasi Admin)</span></h4>
                  
                  {(() => {
                    const groupedFields = metadataFields.reduce((acc, field) => {
                      const group = field.group || 'Umum';
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(field);
                      return acc;
                    }, {} as Record<string, typeof metadataFields>);

                    return Object.entries(groupedFields).map(([groupName, fields]) => (
                      <div key={groupName} className="space-y-4">
                        {(groupName !== 'Umum' || Object.keys(groupedFields).length > 1) && (
                          <h5 className="font-display font-semibold text-[#171c1f] border-b border-gray-100 pb-1">{groupName}</h5>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {fields.map(f => (
                            <div key={f.id} className={f.type === 'text' ? 'md:col-span-2' : ''}>
                              <label className="block text-sm font-semibold mb-1.5 text-gray-600">
                                {f.label} {f.is_required && <span className="text-error">*</span>}
                              </label>
                              {f.type === 'select' ? (
                                <select 
                                  required={f.is_required} 
                                  value={formData.metadata[f.key] || ""} 
                                  onChange={e=>setMetaField(f.key, e.target.value)}
                                  className="input-field w-full appearance-none"
                                >
                                  <option value="">-- Pilih --</option>
                                  {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input 
                                  type={f.type} 
                                  required={f.is_required}
                                  value={formData.metadata[f.key] || ""}
                                  onChange={e=>setMetaField(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                                  className="input-field w-full"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-8 border-t border-[#bdc8cb]/30">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">Lanjut ke Tes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Duplicate Peserta */}
      {duplicatePeserta && (() => {
        const d = daerah.find(x => x.id === duplicatePeserta.daerah_id);
        const userHasil = hasilTes.filter(h => h.peserta_id === duplicatePeserta.id);
        return (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-4 animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 flex items-center gap-3 border-b border-amber-100">
                <div className="p-2 bg-amber-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-amber-800">Peserta Sudah Terdaftar</h3>
                  <p className="text-sm text-amber-600">Peserta dengan nama, daerah, dan tipe yang sama sudah ada.</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-[#171c1f]">{duplicatePeserta.nama}</div>
                      <div className="text-xs text-gray-500">{duplicatePeserta.usia} Thn <span className="opacity-50 mx-1">•</span> {duplicatePeserta.pekerjaan}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary opacity-70" />
                      {d?.nama || "-"} ({d?.wilayah || "-"})
                    </div>
                    <div className="font-mono">{duplicatePeserta.nomor_telepon}</div>
                    <div className="col-span-2 text-xs text-gray-400">
                      Terdaftar: {formatDate(duplicatePeserta.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Riwayat Tes ({userHasil.length})</h4>
                  {userHasil.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userHasil.map(h => (
                        <div key={h.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <div>
                            <div className="font-medium text-[#171c1f]">{h.snapshot_tes.nama}</div>
                            <div className="text-xs text-gray-400">{formatDate(h.tanggal_tes)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#171c1f]">{h.skor_akhir}</span>
                            {h.is_lulus ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> {h.label_hasil}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> {h.label_hasil}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic bg-gray-50 rounded-lg p-3 text-center">
                      Belum ada tes yang dilakukan.
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setDuplicatePeserta(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={doCreatePeserta}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                >
                  Tetap Tambahkan
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
