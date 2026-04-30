import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { ArrowLeft, CheckCircle, XCircle, User, FileText, Calendar } from "lucide-react";
import { formatDateTime } from "../../lib/utils";

export default function HasilDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { hasilTes, peserta, users } = useAppStore();
  
  const hasil = hasilTes.find(h => h.id === id);
  if (!hasil) return <div className="p-8 text-center">Data hasil tes tidak ditemukan</div>;

  const p = peserta.find(x => x.id === hasil.peserta_id);
  const penguji = users.find(u => u.id === hasil.penguji_uid);
  const t = hasil.snapshot_tes;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary flex items-center text-sm mb-2 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </button>

      <div className="glass-card overflow-hidden">
        {/* Header Snapshot Info */}
        <div className="relative p-6 sm:p-8 md:p-12 border-b border-[#bdc8cb]/30 overflow-hidden text-[#171c1f] z-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${hasil.is_lulus ? 'from-primary/10 via-primary/5' : 'from-red-500/10 via-red-500/5'} to-transparent pointer-events-none -z-10`}></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div>
              <div className="inline-flex items-center px-4 py-1.5 bg-white/70 border border-[#bdc8cb]/30 rounded-lg text-xs font-bold text-primary tracking-wide mb-5 backdrop-blur-xl">
                Rekam Jejak Historis (Snapshot)
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight leading-none mb-4">{t.nama}</h1>
              <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">{t.deskripsi}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl text-center min-w-[220px] shadow-lg relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-b opacity-10 pointer-events-none ${hasil.is_lulus ? 'from-primary to-transparent' : 'from-[#ba1a1a] to-transparent'}`}></div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">Skor Akhir</p>
              <p className="text-7xl font-display font-bold relative z-10 text-primary">{hasil.skor_akhir}</p>
              <div className={`mt-4 inline-flex items-center text-sm font-bold px-4 py-1.5 border rounded-lg shadow-sm relative z-10 backdrop-blur-sm ${hasil.is_lulus ? 'bg-[#006430] text-white border-[#006430]/20' : 'bg-[#ba1a1a] text-white border-[#ba1a1a]/20'}`}>
                {hasil.is_lulus ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                {hasil.label_hasil}
              </div>
            </div>
          </div>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#bdc8cb]/30 border-b border-[#bdc8cb]/30">
          <div className="flex items-center p-6 lg:p-8 bg-white/50 backdrop-blur-sm hover:bg-[#f0f4f8]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mr-5 shadow-[0_0_15px_rgba(0,96,100,0.1)]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Peserta</p>
              <p className="font-display font-bold text-lg text-[#171c1f]">{p?.nama || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center p-6 lg:p-8 bg-white/50 backdrop-blur-sm hover:bg-[#f0f4f8]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mr-5 shadow-[0_0_15px_rgba(0,96,100,0.1)]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Penguji</p>
              <p className="font-display font-bold text-lg text-[#171c1f]">{penguji?.nama || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center p-6 lg:p-8 bg-white/50 backdrop-blur-sm hover:bg-[#f0f4f8]/80 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mr-5 shadow-[0_0_15px_rgba(0,96,100,0.1)]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Waktu Tes</p>
              <p className="font-mono font-bold text-[#171c1f] tracking-tight">{formatDateTime(hasil.tanggal_tes)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 md:p-12 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          <div className="flex items-center justify-between mb-8 border-b border-[#bdc8cb]/30 pb-6">
            <h3 className="text-2xl font-display font-bold text-[#171c1f] flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg mr-3 border border-primary/20 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              Detail Jawaban
            </h3>
            <span className="text-xs font-bold px-3 py-1.5 bg-[#f0f4f8] border border-[#bdc8cb]/30 text-primary rounded-lg uppercase tracking-wider backdrop-blur-md">
              Sistem: {t.tipe_penilaian}
            </span>
          </div>

          <div className="space-y-6 relative z-10">
            {hasil.jawaban.map((ans, idx) => {
              const q = t.pertanyaan?.find(x => x.id === ans.pertanyaan_id);
              const label = t.rentang_nilai?.find(r => r.nilai === ans.nilai)?.label || "-";
              
              return (
                <div key={idx} className="solid-card p-6 md:p-8 border border-transparent hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#f0f4f8] border border-[#bdc8cb]/30 text-primary font-display font-bold flex items-center justify-center text-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-medium text-[#171c1f] text-lg leading-relaxed">
                        {ans.teks_pertanyaan}
                      </h4>
                      {t.tipe_penilaian === 'berbobot' && (
                        <span className="inline-flex mt-3 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                          Bobot {q?.bobot || 0}%
                        </span>
                      )}
                      
                      <div className="mt-6 flex flex-col sm:flex-row gap-5 sm:items-stretch">
                        <div className="flex items-center bg-[#f0f4f8]/50 rounded-xl p-4 border border-[#bdc8cb]/20 min-w-[200px]">
                          <span className="text-4xl font-display font-black text-primary mr-5 drop-shadow-[0_0_10px_rgba(0,96,100,0.1)]">{ans.nilai}</span>
                          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                        </div>
                        {ans.catatan && (
                          <div className="flex-1 text-sm bg-white/40 backdrop-blur-sm border border-[#bdc8cb]/30 p-4 rounded-xl text-gray-600 leading-relaxed relative">
                             <div className="absolute top-4 left-4 text-primary/10 text-4xl font-display leading-none rotate-180">"</div>
                            <span className="relative z-10 block pl-6 font-medium italic">{ans.catatan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasil.catatan_akhir && (
            <div className="mt-10 bg-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-bold text-lg text-primary mb-4 relative z-10 flex items-center">
                 <FileText className="w-5 h-5 mr-2 opacity-80" /> Catatan Keseluruhan Penguji
              </h4>
              <p className="text-[#171c1f] font-medium leading-relaxed whitespace-pre-wrap relative z-10 text-justify">{hasil.catatan_akhir}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
