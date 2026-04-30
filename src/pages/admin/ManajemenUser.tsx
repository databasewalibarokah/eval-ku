import { useState, FormEvent } from "react";
import { useAppStore } from "../../stores/appStore";
import { User } from "../../types";
import { formatDateTime } from "../../lib/utils";
import { Plus, Edit2, Ban, CheckCircle } from "lucide-react";

export default function ManajemenUser() {
  const { users, addUser, updateUser } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    nama: "",
    nomor_telepon: "",
    role: "penguji" as "admin" | "penguji",
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        nama: user.nama,
        nomor_telepon: user.nomor_telepon,
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        nama: "",
        nomor_telepon: "",
        role: "penguji",
      });
    }
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string, is_active: boolean) => {
    await updateUser(id, { is_active: !is_active });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await addUser({ ...formData, is_active: true });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-[#171c1f]">Manajemen User</h2>
          <p className="mt-2 text-[#4f606b] font-medium text-lg">Kelola pengguna yang dapat mengakses aplikasi.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah User
        </button>
      </div>

      <div className="solid-card overflow-hidden">
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full">
          <thead className="bg-[#f6fafe]">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Nama</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Kontak</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Role</th>
              <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Status</th>
              <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest font-display">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-[#f0f4f8]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#f6fafe]/50 transition-colors">
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-[15px] font-bold text-[#171c1f] font-display">{user.nama}</div>
                  <div className="text-sm text-gray-500 mt-1">{formatDateTime(user.created_at)}</div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="text-[15px] text-[#171c1f] font-medium">{user.email}</div>
                  <div className="text-sm text-gray-500 mt-1">{user.nomor_telepon || "-"}</div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === 'admin' ? 'bg-[#2c797d]/10 text-[#006064]' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.is_active ? 'bg-[#006430]/10 text-[#006430]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-center space-x-3">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-primary hover:bg-primary/5 rounded-full transition">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleToggleStatus(user.id, user.is_active)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                    {user.is_active ? <Ban className="w-5 h-5 hover:text-[#ba1a1a]" /> : <CheckCircle className="w-5 h-5 hover:text-[#006430]" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col divide-y divide-[#bdc8cb]/20">
          {users.map((user) => (
            <div key={user.id} className="p-4 space-y-3 hover:bg-[#f6fafe]/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[15px] font-bold text-[#171c1f] font-display">{user.nama}</div>
                  <div className="text-sm text-[#171c1f] font-medium">{user.email}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{user.nomor_telepon || "-"}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full ${user.role === 'admin' ? 'bg-[#2c797d]/10 text-[#006064]' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                  <span className={`px-2.5 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full ${user.is_active ? 'bg-[#006430]/10 text-[#006430]' : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'}`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#bdc8cb]/10">
                <div className="text-xs text-gray-500">
                  {formatDateTime(user.created_at).split(" ")[0]}
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => handleOpenModal(user)} className="p-1.5 text-primary hover:bg-primary/5 rounded-full transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(user.id, user.is_active)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full transition">
                    {user.is_active ? <Ban className="w-4 h-4 hover:text-[#ba1a1a]" /> : <CheckCircle className="w-4 h-4 hover:text-[#006430]" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-8 text-center text-gray-500 bg-[#f0f4f8]/30">
              Belum ada user ditemukan.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[30px] pointer-events-none -z-10" />
            
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8 font-display text-primary">{editingUser ? "Edit User" : "Tambah User"}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">Email</label>
                <input 
                  type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">Nama</label>
                <input 
                  type="text" required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">No Telepon</label>
                <input 
                  type="text" value={formData.nomor_telepon} onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                  className="w-full input-field" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-[#171c1f]">Role</label>
                <select 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                  className="w-full input-field cursor-pointer"
                >
                  <option value="penguji">Penguji</option>
                  <option value="admin">Admin</option>
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
