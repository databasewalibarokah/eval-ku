import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { UserCircle, MapPin, Phone, Briefcase, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { formatDateTime } from "../../lib/utils";

export default function DashboardPeserta() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const peserta = useAppStore(state => state.peserta.find(p => p.id === id));
  const daerah = useAppStore(state => state.daerah.find(d => d.id === peserta?.daerah_id));
  const tesList = useAppStore(state => state.tes.filter(t => t.tipe === peserta?.tipe_peserta && t.is_active).sort((a,b)=>a.order - b.order));
  const hasilTes = useAppStore(state => state.hasilTes.filter(h => h.peserta_id === id));

  if (!peserta) {
    return <div className="p-8 text-center">Peserta tidak ditemukan</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary flex items-center text-sm mb-2 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      {/* Profil Header */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="p-5 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex-shrink-0 relative z-10">
          <UserCircle className="w-20 h-20" />
        </div>
        <div className="flex-1 space-y-5 relative z-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-[#171c1f] capitalize tracking-tight mb-2">{peserta.nama}</h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-[#e3e8ef] border border-[#bdc8cb]/30 rounded-lg text-primary font-bold capitalize">Program {peserta.tipe_peserta}</span>
              <span className="text-gray-500">{peserta.usia} Tahun</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center text-[#171c1f] font-semibold">
              <div className="p-2 bg-[#f0f4f8] rounded-lg mr-3 border border-[#bdc8cb]/20 text-primary"><MapPin className="w-4 h-4" /></div> {daerah?.nama || "-"}
            </div>
            <div className="flex items-center text-[#171c1f] font-semibold">
               <div className="p-2 bg-[#f0f4f8] rounded-lg mr-3 border border-[#bdc8cb]/20 text-primary"><Briefcase className="w-4 h-4" /></div> {peserta.pekerjaan}
            </div>
            <div className="flex items-center text-[#171c1f] font-mono font-semibold">
               <div className="p-2 bg-[#f0f4f8] rounded-lg mr-3 border border-[#bdc8cb]/20 text-primary"><Phone className="w-4 h-4" /></div> {peserta.nomor_telepon}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-2xl font-display font-medium text-[#171c1f] mb-6 flex items-center">
          <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg mr-3"><FileText className="w-6 h-6 text-primary" /></div> 
          Daftar Tes
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tesList.map(t => {
            const hasil = hasilTes.find(h => h.tes_id === t.id);
            const isSelesai = !!hasil;

            return (
              <div key={t.id} className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col ${isSelesai ? 'bg-[#f0f4f8] border-[#bdc8cb]/30' : 'solid-card border-transparent shadow hover:border-primary/30 hover:-translate-y-1'}`}>
                {isSelesai && (
                  <div className="absolute top-6 right-6 flex items-center text-primary-container bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 text-xs font-semibold uppercase tracking-wide">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Selesai
                  </div>
                )}
                
                <h4 className="font-display font-bold text-xl text-[#171c1f] pr-24 leading-snug">{t.nama}</h4>
                <p className="text-sm text-gray-500 mt-2 mb-6 line-clamp-2">{t.deskripsi}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#bdc8cb]/30">
                  <div className="flex gap-3">
                    <span className="text-xs bg-[#e3e8ef] px-2.5 py-1 rounded-md text-gray-600 font-bold capitalize">
                      {t.tipe_penilaian}
                    </span>
                    <span className="text-xs bg-[#e3e8ef] px-2.5 py-1 rounded-md text-gray-600 font-bold">
                      {t.pertanyaan.length} Soal
                    </span>
                  </div>
                  
                  {isSelesai ? (
                    <button 
                      onClick={() => navigate(`/hasil/${hasil.id}`)}
                      className="btn-secondary shadow border border-[#bdc8cb]/30 py-2 px-5 text-sm"
                    >
                      Lihat Hasil
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/menguji/peserta/${peserta.id}/tes/${t.id}`)}
                      className="btn-primary py-2 px-5 text-sm"
                    >
                      Mulai Tes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {tesList.length === 0 && (
            <div className="col-span-full text-center py-16 bg-[#f0f4f8]/50 rounded-2xl border border-dashed border-[#bdc8cb]/30 text-gray-500">
              Belum ada konfigurasi tes yang aktif untuk program ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
