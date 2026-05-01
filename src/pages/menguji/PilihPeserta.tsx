import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";
import { Peserta } from "../../types";
import { Search, Plus, UserCircle, MapPin } from "lucide-react";

export default function PilihPeserta() {
  const { tipe } = useParams<{ tipe: string }>();
  const navigate = useNavigate();
  const { peserta, daerah, settings, addPeserta } = useAppStore();
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Filter peserta by tipe and search
  const filteredPeserta = peserta.filter(p => 
    p.tipe_peserta === tipe && 
    (p.nama.toLowerCase().includes(search.toLowerCase()) || p.nomor_telepon.includes(search))
  );

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

    const newP = await addPeserta({
      nama: formData.nama,
      usia: Number(formData.usia),
      daerah_id: formData.daerah_id,
      pekerjaan: formData.pekerjaan,
      nomor_telepon: formData.nomor_telepon,
      tipe_peserta: tipe as "evaluasi" | "seleksi",
      metadata: formData.metadata,
      created_by: user.id
    });
    
    setIsNewModalOpen(false);
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

      <div className="glass-card p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-11"
            placeholder="Cari nama atau nomor telepon peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        {filteredPeserta.length === 0 && search && (
          <div className="col-span-full text-center py-16 text-gray-500 border border-dashed border-[#bdc8cb]/30 rounded-xl bg-[#f0f4f8]/50">
            Peserta tidak ditemukan. Silakan daftarkan peserta baru.
          </div>
        )}
      </div>

      {/* Modal Peserta Baru */}
      {isNewModalOpen && (
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
    </div>
  );
}
