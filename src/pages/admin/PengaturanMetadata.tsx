import { useState, FormEvent } from "react";
import { useAppStore } from "../../stores/appStore";
import { MetadataFieldConfig } from "../../types";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export default function PengaturanMetadata() {
  const { settings, updateSettings } = useAppStore();
  const [activeTab, setActiveTab] = useState<"evaluasi" | "seleksi">("evaluasi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<MetadataFieldConfig | null>(null);

  const activeSettings = settings.find(s => s.tipe === activeTab);
  const fields = (activeSettings?.metadata_fields || []).sort((a, b) => a.order - b.order);

  const [formData, setFormData] = useState<Omit<MetadataFieldConfig, 'id' | 'order'>>({
    key: "",
    label: "",
    type: "text",
    options: [],
    is_required: false,
    group: "",
  });

  const [optionsStr, setOptionsStr] = useState("");

  const handleOpenModal = (f?: MetadataFieldConfig) => {
    if (f) {
      setEditingField(f);
      setFormData({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options,
        is_required: f.is_required,
        group: f.group || "",
      });
      setOptionsStr(f.options?.join(",") || "");
    } else {
      setEditingField(null);
      setFormData({
        key: "",
        label: "",
        type: "text",
        options: [],
        is_required: false,
        group: "",
      });
      setOptionsStr("");
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus field ini?")) {
      const newFields = fields.filter(f => f.id !== id);
      await updateSettings(activeTab, newFields);
    }
  };

  const handleMove = async (index: number, dir: 1 | -1) => {
    if (index + dir < 0 || index + dir >= fields.length) return;
    const newFields = [...fields];
    // swap order
    const temp = newFields[index].order;
    newFields[index].order = newFields[index + dir].order;
    newFields[index + dir].order = temp;
    await updateSettings(activeTab, newFields);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const opts = formData.type === "select" ? optionsStr.split(",").map(s => s.trim()).filter(s=>s) : [];
    
    if (editingField) {
      const newFields = fields.map(f => f.id === editingField.id ? { ...f, ...formData, options: opts } : f);
      await updateSettings(activeTab, newFields);
    } else {
      const newField: MetadataFieldConfig = {
        ...formData,
        options: opts,
        id: uuidv4(),
        order: fields.length > 0 ? Math.max(...fields.map(f => f.order)) + 1 : 1
      };
      await updateSettings(activeTab, [...fields, newField]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-[#171c1f] mb-1">Pengaturan Metadata Biodata</h2>
          <p className="text-gray-500 text-sm">Atur field kustom tambahan untuk form registrasi peserta.</p>
        </div>
        <div className="flex p-1 bg-white/80 backdrop-blur shadow-sm border border-[#bdc8cb]/30 rounded-xl self-start">
          <button
            onClick={() => setActiveTab("evaluasi")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "evaluasi" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-[#171c1f]"}`}
          >
            Evaluasi
          </button>
          <button
            onClick={() => setActiveTab("seleksi")}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${activeTab === "seleksi" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-[#171c1f]"}`}
          >
            Seleksi
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl md:text-2xl font-display font-bold text-[#171c1f] capitalize">Field Metadata {activeTab}</h3>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary inline-flex items-center py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Field
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-16 text-gray-500 border border-dashed border-[#bdc8cb]/30 rounded-xl bg-[#f0f4f8]/50">
            <div className="max-w-sm mx-auto">
              <p className="text-lg font-bold text-[#171c1f] mb-1">Belum ada field kustom</p>
              <p className="text-sm">Klik 'Tambah Field' untuk menambahkan properti metadata biodata tambahan.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((f, idx) => (
              <div key={f.id} className="solid-card flex items-center justify-between p-5 border border-[#bdc8cb]/20 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex items-center space-x-5">
                  <div className="flex flex-col space-y-1 text-gray-500">
                    <button onClick={() => handleMove(idx, -1)} disabled={idx === 0} className="hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-gray-500 p-0.5"><ArrowUp className="w-5 h-5"/></button>
                    <button onClick={() => handleMove(idx, 1)} disabled={idx === fields.length - 1} className="hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-gray-500 p-0.5"><ArrowDown className="w-5 h-5"/></button>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-lg text-[#171c1f] mb-1.5">{f.label} <span className="text-gray-500 text-sm font-mono font-medium ml-2">({f.key})</span></h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#f0f4f8] border border-[#bdc8cb]/30 rounded-md text-xs font-bold text-gray-600">{f.type === 'text' ? 'Teks Pendek' : f.type === 'number' ? 'Angka' : 'Dropdown'}</span>
                      {f.is_required && <span className="px-2.5 py-1 bg-error/10 border border-error/20 text-error rounded-md text-xs font-bold uppercase tracking-wide">Wajib</span>}
                      {f.group && <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-xs font-bold">Grup: {f.group}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(f)} className="p-2.5 text-gray-400 hover:text-[#171c1f] hover:bg-[#f0f4f8] rounded-xl transition-colors"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-2.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card shadow-2xl max-w-lg w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl md:text-2xl font-display font-bold text-primary">{editingField ? "Edit Field" : "Tambah Field"}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-600">Key (snake_case)</label>
                <input 
                  type="text" required value={formData.key} onChange={(e) => setFormData({...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="input-field w-full font-mono text-sm border border-[#bdc8cb]/30" 
                  placeholder="misal: skor_toefl"
                />
                <p className="text-xs text-gray-500 mt-1.5 font-medium">Ini adalah ID unik di database, gunakan huruf kecil dan underscore.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-600">Label Tampilan</label>
                <input 
                  type="text" required value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="input-field w-full border border-[#bdc8cb]/30" 
                  placeholder="misal: Skor TOEFL Murni"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-600">Tipe Input</label>
                  <select 
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="input-field w-full appearance-none border border-[#bdc8cb]/30 cursor-pointer"
                  >
                    <option value="text">Teks Singkat</option>
                    <option value="number">Angka</option>
                    <option value="select">Dropdown (Select)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-600">Grup (Opsional)</label>
                  <input 
                    type="text" value={formData.group} onChange={(e) => setFormData({...formData, group: e.target.value})}
                    className="input-field w-full border border-[#bdc8cb]/30" 
                    placeholder="misal: Data Akademik"
                  />
                </div>
              </div>

              {formData.type === "select" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold mb-1.5 text-gray-600">Pilihan (Pisahkan dengan koma)</label>
                  <input 
                    type="text" required value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)}
                    className="input-field w-full border border-[#bdc8cb]/30" 
                    placeholder="Laki-laki, Perempuan"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 bg-[#f0f4f8] border border-[#bdc8cb]/30 p-4 rounded-xl mt-2">
                <input 
                  type="checkbox" id="is_required" checked={formData.is_required} onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
                  className="h-4 w-4 rounded border-[#bdc8cb] text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="is_required" className="text-sm font-bold cursor-pointer text-[#171c1f] select-none">Tandai sebagai wajib diisi (Required)</label>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-[#bdc8cb]/30">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
