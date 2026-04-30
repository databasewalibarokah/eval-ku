import { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { Tes, RentangNilai, Pertanyaan } from "../../types";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function ManajemenTes() {
  const { tes, addTes, updateTes, deleteTes } = useAppStore();
  const [activeTab, setActiveTab] = useState<"evaluasi" | "seleksi">("evaluasi");
  
  const [editingTesId, setEditingTesId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tes> | null>(null);

  const testsForTab = tes.filter(t => t.tipe === activeTab).sort((a,b) => a.order - b.order);

  const startCreate = () => {
    setEditingTesId("new");
    setFormData({
      tipe: activeTab,
      nama: "",
      deskripsi: "",
      order: testsForTab.length + 1,
      is_active: true,
      tipe_penilaian: "berbobot",
      rentang_nilai: [
        { nilai: 1, label: "Sangat Kurang" },
        { nilai: 2, label: "Kurang" },
        { nilai: 3, label: "Cukup" },
        { nilai: 4, label: "Baik" },
        { nilai: 5, label: "Sangat Baik" }
      ],
      pembagi_final: 5,
      batas_kelulusan: 3.0,
      label_lulus: "Lulus",
      label_tidak_lulus: "Tidak Lulus",
      catatan_akhir_aktif: true,
      catatan_akhir_wajib: false,
      pertanyaan: []
    });
  };

  const startEdit = (t: Tes) => {
    setEditingTesId(t.id);
    setFormData({ ...t });
  };

  const handleSave = async () => {
    if (!formData) return;
    
    // validation
    if (!formData.nama) return alert("Nama tes wajib diisi");
    
    if (formData.tipe_penilaian === 'berbobot') {
      const totalBobot = formData.pertanyaan?.reduce((sum, p) => sum + p.bobot, 0) || 0;
      if (formData.pertanyaan && formData.pertanyaan.length > 0 && totalBobot !== 100) {
         return alert(`Sistem Berbobot: Total bobot pertanyaan harus 100. Saat ini: ${totalBobot}`);
      }
    }

    if (editingTesId === "new") {
      await addTes(formData as Omit<Tes, "id" | "created_at" | "updated_at">);
    } else if (editingTesId) {
      await updateTes(editingTesId, formData);
    }
    setEditingTesId(null);
    setFormData(null);
  };

  const addPertanyaan = () => {
    if (!formData) return;
    const current = formData.pertanyaan || [];
    setFormData({
      ...formData,
      pertanyaan: [...current, {
        id: uuidv4(),
        teks_utama: "Pertanyaan Baru",
        bobot: 0,
        order: current.length + 1,
        catatan_aktif: true,
        catatan_wajib: false
      }]
    });
  };

  const updatePertanyaan = (id: string, updates: Partial<Pertanyaan>) => {
    if (!formData) return;
    const newP = formData.pertanyaan?.map(p => p.id === id ? { ...p, ...updates } : p);
    setFormData({ ...formData, pertanyaan: newP });
  };

  const deletePertanyaan = (id: string) => {
    if (!formData) return;
    const newP = formData.pertanyaan?.filter(p => p.id !== id);
    setFormData({ ...formData, pertanyaan: newP });
  };

  if (editingTesId && formData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-[#171c1f]">{editingTesId === "new" ? "Buat Tes Baru" : "Edit Tes"}</h2>
          <div className="flex gap-3">
            <button onClick={() => setEditingTesId(null)} className="btn-secondary shadow border-[#bdc8cb]/30 flex items-center"><X className="w-4 h-4 mr-2"/> Batal</button>
            <button onClick={handleSave} className="btn-primary flex items-center"><Save className="w-4 h-4 mr-2"/> Simpan Tes</button>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-display font-medium text-lg text-primary border-b border-[#bdc8cb]/30 pb-2">Informasi Dasar</h3>
              <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Nama Tes</label><input type="text" className="input-field w-full" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} placeholder="Masukkan nama tes" /></div>
              <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Deskripsi</label><textarea className="input-field w-full min-h-[100px] resize-y" value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} placeholder="Penjelasan singkat mengenai tes ini" /></div>
              <div className="flex items-center gap-3 bg-[#f0f4f8] border border-[#bdc8cb]/30 p-3 rounded-xl">
                <input type="checkbox" className="w-4 h-4 rounded border-[#bdc8cb] text-primary focus:ring-primary" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} id="is_active_check" />
                <label htmlFor="is_active_check" className="text-sm font-bold cursor-pointer text-[#171c1f]">Status Aktif</label>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="font-display font-medium text-lg text-primary border-b border-[#bdc8cb]/30 pb-2">Sistem Penilaian</h3>
              <div className="flex gap-4 p-1 bg-[#f0f4f8] rounded-xl border border-[#bdc8cb]/30 w-fit">
                <label className={`cursor-pointer px-4 py-2 text-sm font-bold rounded-lg transition ${formData.tipe_penilaian==='berbobot' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-[#171c1f]'}`}><input type="radio" className="hidden" name="tipe_penilaian" checked={formData.tipe_penilaian==='berbobot'} onChange={()=>setFormData({...formData, tipe_penilaian: 'berbobot'})} /> Berbobot</label>
                <label className={`cursor-pointer px-4 py-2 text-sm font-bold rounded-lg transition ${formData.tipe_penilaian==='statis' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-[#171c1f]'}`}><input type="radio" className="hidden" name="tipe_penilaian" checked={formData.tipe_penilaian==='statis'} onChange={()=>setFormData({...formData, tipe_penilaian: 'statis'})} /> Statis (Rata-rata)</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Batas Lulus</label><input type="number" step="0.1" className="input-field w-full" value={formData.batas_kelulusan} onChange={e => setFormData({...formData, batas_kelulusan: Number(e.target.value)})} /></div>
                {formData.tipe_penilaian === 'berbobot' && <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Pembagi Final</label><input type="number" step="0.1" className="input-field w-full" value={formData.pembagi_final} onChange={e => setFormData({...formData, pembagi_final: Number(e.target.value)})} /></div>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Label Lulus</label><input type="text" className="input-field w-full" value={formData.label_lulus} onChange={e => setFormData({...formData, label_lulus: e.target.value})} placeholder="Lulus" /></div>
                <div><label className="block text-sm font-semibold mb-1.5 text-gray-600">Label Tidak Lulus</label><input type="text" className="input-field w-full" value={formData.label_tidak_lulus} onChange={e => setFormData({...formData, label_tidak_lulus: e.target.value})} placeholder="Tidak Lulus" /></div>
              </div>
              
              <div className="bg-[#f0f4f8] border border-[#bdc8cb]/30 rounded-xl p-4 space-y-3">
                 <h4 className="font-bold text-sm text-[#171c1f]">Rentang Nilai Opsi Jawaban</h4>
                 <div className="space-y-2">
                 {formData.rentang_nilai?.map((r, i) => (
                   <div key={i} className="flex gap-2 items-center">
                     <input type="number" className="w-20 input-field bg-white/50 backdrop-blur-sm border border-[#bdc8cb]/30 py-1.5 px-3 text-sm" value={r.nilai} onChange={e => {
                       const nr = [...formData.rentang_nilai!]; nr[i].nilai = Number(e.target.value); setFormData({...formData, rentang_nilai: nr});
                     }} placeholder="Nilai" />
                     <input type="text" className="flex-1 input-field bg-white/50 backdrop-blur-sm border border-[#bdc8cb]/30 py-1.5 px-3 text-sm" value={r.label} onChange={e => {
                       const nr = [...formData.rentang_nilai!]; nr[i].label = e.target.value; setFormData({...formData, rentang_nilai: nr});
                     }} placeholder="Label (Misc: Sangat Baik)" />
                     <button onClick={()=>{
                       const nr = formData.rentang_nilai!.filter((_, idx)=>idx!==i); setFormData({...formData, rentang_nilai: nr});
                     }} className="p-2 text-gray-400 hover:text-error transition-colors"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 ))}
                 </div>
                 <button onClick={()=>{
                   setFormData({...formData, rentang_nilai: [...(formData.rentang_nilai||[]), {nilai: 0, label: "Label Baru"}]});
                 }} className="text-sm text-primary hover:text-primary-container font-bold inline-flex items-center mt-2 transition-colors"><Plus className="w-3 h-3 mr-1"/> Tambah Opsi Nilai</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-5 pt-8 border-t border-[#bdc8cb]/30">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-[#171c1f]">Daftar Pertanyaan</h3>
              <button onClick={addPertanyaan} className="btn-secondary shadow border-[#bdc8cb]/30 py-1.5 text-sm inline-flex items-center"><Plus className="w-4 h-4 mr-1.5"/> Tambah Soal</button>
            </div>
            
            {formData.tipe_penilaian === 'berbobot' && (
              <div className="bg-primary/10 border border-primary/20 text-primary-container p-4 rounded-xl text-sm flex items-center justify-between">
                <span className="font-medium">Total Bobot Saat Ini</span>
                <strong className="text-lg">{formData.pertanyaan?.reduce((a,c)=>a+c.bobot,0)}% <span className="text-sm font-normal opacity-70">(Harus 100%)</span></strong>
              </div>
            )}

            <div className="space-y-4">
              {formData.pertanyaan?.map((p, i) => (
                <div key={p.id} className="solid-card shadow-sm border border-[#bdc8cb]/20 p-5 flex gap-4 transition-all duration-300">
                  <div className="font-display font-bold text-primary text-xl pt-1 min-w-[2rem]">{i+1}.</div>
                  <div className="flex-1 space-y-4">
                    <input type="text" className="input-field w-full font-bold text-base h-11" placeholder="Pertanyaan Utama" value={p.teks_utama} onChange={e=>updatePertanyaan(p.id, {teks_utama: e.target.value})} />
                    <textarea className="input-field w-full text-sm min-h-[80px]" placeholder="Sub Pertanyaan / Keterangan Tambahan (Opsional)" value={p.teks_sub || ""} onChange={e=>updatePertanyaan(p.id, {teks_sub: e.target.value})} />
                    
                    <div className="flex flex-wrap gap-4 items-center bg-[#f0f4f8]/50 p-3 rounded-lg border border-[#bdc8cb]/30">
                      {formData.tipe_penilaian === 'berbobot' && (
                        <div className="flex items-center text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-[#bdc8cb]/30">
                          <span className="mr-2 whitespace-nowrap font-bold">Bobot (%)</span>
                          <input type="number" className="w-16 input-field py-1 px-2 text-center font-bold" value={p.bobot} onChange={e=>updatePertanyaan(p.id, {bobot: Number(e.target.value)})} />
                        </div>
                      )}
                      <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-[#171c1f] font-semibold transition"><input type="checkbox" className="mr-2 rounded border-[#bdc8cb] text-primary focus:ring-primary h-4 w-4" checked={p.catatan_aktif} onChange={e=>updatePertanyaan(p.id, {catatan_aktif: e.target.checked})} /> Izinkan Catatan Penguji</label>
                      {p.catatan_aktif && <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-[#171c1f] font-semibold transition"><input type="checkbox" className="mr-2 rounded border-[#bdc8cb] text-primary focus:ring-primary h-4 w-4" checked={p.catatan_wajib} onChange={e=>updatePertanyaan(p.id, {catatan_wajib: e.target.checked})} /> Wajib Isi Catatan</label>}
                    </div>
                  </div>
                  <button onClick={()=>deletePertanyaan(p.id)} className="text-gray-400 hover:text-error self-start p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>
                </div>
              ))}
              {formData.pertanyaan?.length === 0 && (
                <div className="text-center py-12 text-gray-500 border border-dashed border-[#bdc8cb]/30 rounded-xl bg-[#f0f4f8]/50">
                  <p>Belum ada pertanyaan. Tambahkan soal pertama Anda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-[#171c1f] mb-1">Manajemen Tes</h2>
          <p className="text-gray-500 font-medium">Konfigurasi struktur tes, pertanyaan, dan sistem penilaian.</p>
        </div>
        <div className="flex p-1 bg-white/80 backdrop-blur border border-[#bdc8cb]/30 shadow-sm rounded-xl self-start">
          <button onClick={() => setActiveTab("evaluasi")} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "evaluasi" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-[#171c1f]"}`}>Evaluasi</button>
          <button onClick={() => setActiveTab("seleksi")} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "seleksi" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-[#171c1f]"}`}>Seleksi</button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-display font-bold text-[#171c1f] capitalize">Daftar Tes {activeTab}</h3>
          <button onClick={startCreate} className="btn-primary inline-flex items-center py-2 shadow-sm"><Plus className="w-4 h-4 mr-2" />Buat Tes</button>
        </div>

        <div className="space-y-4">
          {testsForTab.map((t) => (
            <div key={t.id} className={`solid-card flex items-center justify-between p-5 border border-[#bdc8cb]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${t.is_active ? '' : 'opacity-60 saturate-50'}`}>
              <div>
                <h4 className="text-lg font-display font-bold text-[#171c1f] flex items-center gap-3">
                  {t.nama}
                  {!t.is_active && <span className="text-xs font-sans font-bold tracking-wide uppercase bg-error/10 text-error px-2.5 py-1 rounded-full border border-error/20">Nonaktif</span>}
                </h4>
                <p className="text-sm text-gray-500 mt-1.5 font-medium line-clamp-2">{t.deskripsi}</p>
                <div className="flex gap-4 mt-3">
                  <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                    Sistem: {t.tipe_penilaian}
                  </span>
                  <span className="inline-flex items-center text-xs font-bold text-gray-600 bg-[#f0f4f8] px-2.5 py-1 rounded-md border border-[#bdc8cb]/30">
                    {t.pertanyaan.length} Soal
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pl-4">
                <button onClick={() => startEdit(t)} className="p-2.5 text-gray-400 hover:text-[#171c1f] hover:bg-[#f0f4f8] rounded-xl transition-colors"><Edit2 className="w-5 h-5"/></button>
                <button onClick={async () => { if(confirm("Hapus tes ini?")) await deleteTes(t.id); }} className="p-2.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
              </div>
            </div>
          ))}
          {testsForTab.length === 0 && (
            <div className="text-center py-16 text-gray-500 border border-dashed border-[#bdc8cb]/30 rounded-xl bg-[#f0f4f8]/50">
              <div className="max-w-sm mx-auto">
                <p className="text-lg font-bold text-[#171c1f] mb-1">Belum ada tes</p>
                <p className="text-sm font-medium">Buat struktur tes pertama Anda untuk program {activeTab} ini.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
