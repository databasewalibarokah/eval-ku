import { useState, FormEvent } from "react";
import { useAppStore } from "../../stores/appStore";
import { Daerah } from "../../types";
import { formatDateTime } from "../../lib/utils";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ManajemenDaerah() {
  const { daerah, addDaerah, updateDaerah, deleteDaerah } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDaerah, setEditingDaerah] = useState<Daerah | null>(null);

  const [formData, setFormData] = useState({
    nama: "",
    wilayah: "barat" as "barat" | "timur",
  });

  const handleOpenModal = (d?: Daerah) => {
    if (d) {
      setEditingDaerah(d);
      setFormData({
        nama: d.nama,
        wilayah: d.wilayah,
      });
    } else {
      setEditingDaerah(null);
      setFormData({
        nama: "",
        wilayah: "barat",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus daerah ini?")) {
      await deleteDaerah(id);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingDaerah) {
      await updateDaerah(editingDaerah.id, formData);
    } else {
      await addDaerah(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-[#171c1f]">Manajemen Daerah</h2>
          <p className="mt-2 text-[#4f606b] font-medium text-lg">Kelola daftar daerah peserta.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Daerah
        </button>
      </div>

      <div className="solid-card overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full">
          <thead className="bg-[#f6fafe]">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Nama Daerah</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Wilayah</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Tgl Dibuat</th>
              <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-[#f0f4f8]">
            {daerah.map((d) => (
              <tr key={d.id} className="hover:bg-[#f6fafe]/50 transition-colors">
                <td className="px-8 py-6 whitespace-nowrap text-[15px] font-bold text-[#171c1f] font-display">{d.nama}</td>
                <td className="px-8 py-6 whitespace-nowrap text-[15px] text-[#171c1f] font-medium capitalize">{d.wilayah}</td>
                <td className="px-8 py-6 whitespace-nowrap text-[15px] text-gray-500 font-medium">{formatDateTime(d.created_at)}</td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-center space-x-3">
                  <button onClick={() => handleOpenModal(d)} className="p-2 text-primary hover:bg-primary/5 rounded-full transition">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                    <Trash2 className="w-5 h-5 hover:text-[#ba1a1a]" />
                  </button>
                </td>
              </tr>
            ))}
            {daerah.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-gray-500 font-medium">
                  Belum ada daerah.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-[#bdc8cb]/20">
          {daerah.map((d) => (
            <div key={d.id} className="p-4 space-y-3 hover:bg-[#f6fafe]/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[16px] font-bold text-[#171c1f] font-display">{d.nama}</div>
                  <div className="text-sm text-[#171c1f] font-medium capitalize mt-1 text-primary">{d.wilayah}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(d)} className="p-2 text-primary hover:bg-primary/5 rounded-full transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                    <Trash2 className="w-4 h-4 hover:text-[#ba1a1a]" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Dibuat: {formatDateTime(d.created_at)}
              </div>
            </div>
          ))}
          {daerah.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-medium bg-[#f0f4f8]/30">
              Belum ada daerah.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none -z-10" />
            
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8 font-display text-primary">{editingDaerah ? "Edit Daerah" : "Tambah Daerah"}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">Nama Daerah</label>
                <input 
                  type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">Wilayah</label>
                <select 
                  value={formData.wilayah} onChange={(e) => setFormData({...formData, wilayah: e.target.value as any})}
                  className="w-full input-field cursor-pointer"
                >
                  <option value="barat">Barat</option>
                  <option value="timur">Timur</option>
                </select>
              </div>
              
              <div className="mt-10 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn-primary px-8">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
