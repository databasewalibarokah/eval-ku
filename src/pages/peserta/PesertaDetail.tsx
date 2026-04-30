import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { ArrowLeft, UserCircle, MapPin, Phone, Briefcase, Calendar, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "../../lib/utils";

export default function PesertaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { peserta, daerah, hasilTes, settings } = useAppStore();
  
  const p = peserta.find(x => x.id === id);
  const d = daerah.find(x => x.id === p?.daerah_id);
  const history = hasilTes.filter(h => h.peserta_id === id).sort((a,b)=>new Date(b.tanggal_tes).getTime() - new Date(a.tanggal_tes).getTime());
  
  if (!p) return <div className="p-8 text-center">Peserta tidak ditemukan</div>;

  const activeSettings = settings.find(s => s.tipe === p.tipe_peserta);
  const metadataConfig = activeSettings?.metadata_fields || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary flex items-center text-sm mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Profil */}
        <div className="space-y-8 lg:col-span-1">
          <div className="glass-card p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-24 h-24 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_15px_rgba(0,96,100,0.1)]">
              <UserCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-[#171c1f] capitalize tracking-tight relative z-10">{p.nama}</h2>
            <p className="inline-block px-3 py-1 bg-[#f0f4f8] border border-[#bdc8cb]/30 rounded-lg text-xs font-bold text-primary mt-3 capitalize tracking-wide relative z-10">
              Program {p.tipe_peserta}
            </p>

            <div className="mt-8 border-t border-[#bdc8cb]/30 pt-8 space-y-5 text-left relative z-10">
              <div className="flex items-center text-sm bg-white/40 backdrop-blur-[12px] p-3 rounded-xl border border-[#bdc8cb]/20">
                <div className="p-2 bg-[#f0f4f8] rounded-lg mr-4"><MapPin className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-gray-500 font-medium text-xs mb-0.5">Daerah</p>
                  <p className="text-[#171c1f] font-semibold">{d?.nama || "-"}</p>
                </div>
              </div>
              <div className="flex items-center text-sm bg-white/40 backdrop-blur-[12px] p-3 rounded-xl border border-[#bdc8cb]/20">
                <div className="p-2 bg-[#f0f4f8] rounded-lg mr-4"><Phone className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-gray-500 font-medium text-xs mb-0.5">Telepon</p>
                  <p className="text-[#171c1f] font-mono font-semibold">{p.nomor_telepon}</p>
                </div>
              </div>
              <div className="flex items-center text-sm bg-white/40 backdrop-blur-[12px] p-3 rounded-xl border border-[#bdc8cb]/20">
                <div className="p-2 bg-[#f0f4f8] rounded-lg mr-4"><Briefcase className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-gray-500 font-medium text-xs mb-0.5">Pekerjaan</p>
                  <p className="text-[#171c1f] font-semibold">{p.pekerjaan}</p>
                </div>
              </div>
              <div className="flex items-center text-sm bg-white/40 backdrop-blur-[12px] p-3 rounded-xl border border-[#bdc8cb]/20">
                <div className="p-2 bg-[#f0f4f8] rounded-lg mr-4"><UserCircle className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-gray-500 font-medium text-xs mb-0.5">Usia</p>
                  <p className="text-[#171c1f] font-semibold">{p.usia} Tahun</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Tambahan */}
          {metadataConfig.length > 0 && Object.keys(p.metadata || {}).length > 0 && (
            <div className="glass-card p-6 md:p-8">
              <h3 className="font-display font-medium text-lg text-primary mb-6">Informasi Tambahan</h3>
              <div className="space-y-4">
                {metadataConfig.map(f => (
                  <div key={f.id} className="text-sm bg-[#f0f4f8] p-3.5 rounded-xl border border-[#bdc8cb]/20">
                    <p className="text-gray-500 font-medium text-xs mb-1 uppercase tracking-widest">{f.label}</p>
                    <p className="text-[#171c1f] font-semibold">{p.metadata[f.key] || "-"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Riwayat Tes */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-10">
            <h3 className="text-2xl font-display font-medium text-primary mb-8">Riwayat Hasil Tes</h3>
            
            <div className="space-y-5">
              {history.map(h => (
                <div key={h.id} className="solid-card p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-primary/30 border border-transparent transition-all duration-300 hover:-translate-y-1 group">
                  <div className="flex-1 mb-5 sm:mb-0">
                    <div className="flex items-center">
                      {h.is_lulus ? <CheckCircle className="w-5 h-5 text-[#006430] mr-3 shrink-0" /> : <XCircle className="w-5 h-5 text-[#ba1a1a] mr-3 shrink-0" />}
                      <h4 className="font-display font-bold text-lg text-[#171c1f] group-hover:text-primary transition-colors">{h.snapshot_tes.nama}</h4>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-3 space-x-4">
                      <span className="flex items-center font-mono"><Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70"/> {formatDateTime(h.tanggal_tes)}</span>
                      <span className="flex items-center before:content-[''] before:w-1 before:h-1 before:bg-gray-400 before:rounded-full before:mr-4">
                        Sistem: <span className="capitalize font-semibold text-[#171c1f] ml-1 bg-[#f0f4f8] px-2 py-0.5 rounded border border-[#bdc8cb]/30">{h.snapshot_tes.tipe_penilaian}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#bdc8cb]/30">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Skor</p>
                      <p className="text-2xl font-display font-bold text-primary mt-0.5">{h.skor_akhir}</p>
                    </div>
                    <div className="text-center min-w-[90px]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-widest hidden sm:block mb-1.5">Status</p>
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold w-full border ${h.is_lulus ? 'bg-[#006430] text-white border-[#006430]/20' : 'bg-[#ba1a1a] text-white border-[#ba1a1a]/20'}`}>
                        {h.label_hasil}
                      </span>
                    </div>
                    <Link to={`/hasil/${h.id}`} className="btn-secondary px-4 py-2 text-sm whitespace-nowrap">
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="text-center py-16 text-gray-500 bg-[#f0f4f8] rounded-2xl border border-dashed border-[#bdc8cb]/50">
                  <div className="max-w-sm mx-auto">
                    <p className="text-lg font-bold text-primary mb-1">Riwayat Kosong</p>
                    <p className="text-sm line-clamp-2">Peserta ini belum diproses atau belum menyelesaikan tes apa pun.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
