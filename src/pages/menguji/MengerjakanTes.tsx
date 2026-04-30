import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../stores/appStore";
import { useAuthStore } from "../../stores/authStore";
import { JawabanItem } from "../../types";
import { ArrowLeft, Save } from "lucide-react";

export default function MengerjakanTes() {
  const { id, tes_id } = useParams<{ id: string, tes_id: string }>();
  const navigate = useNavigate();
  
  const { peserta, tes, addHasilTes } = useAppStore();
  const { user } = useAuthStore();
  
  const p = peserta.find(x => x.id === id);
  const t = tes.find(x => x.id === tes_id);
  
  const [jawaban, setJawaban] = useState<Record<string, JawabanItem>>({});
  const [catatanAkhir, setCatatanAkhir] = useState("");

  if (!p || !t || !user) {
    return <div className="p-8 text-center">Data tidak valid</div>;
  }

  const handleJawaban = (qId: string, teks_pertanyaan: string, val: number, cat?: string) => {
    setJawaban(prev => ({
      ...prev,
      [qId]: {
        pertanyaan_id: qId,
        teks_pertanyaan,
        nilai: val,
        catatan: cat ?? prev[qId]?.catatan
      }
    }));
  };

  const calculateScore = () => {
    let finalScore = 0;
    const items = Object.values(jawaban);
    
    if (t.tipe_penilaian === 'berbobot') {
      let sum = 0;
      t.pertanyaan.forEach(q => {
        const ans = jawaban[q.id]?.nilai || 0;
        sum += (ans * q.bobot);
      });
      finalScore = sum / (t.pembagi_final || 1);
    } else {
      let sum = 0;
      items.forEach((ans: JawabanItem) => sum += ans.nilai);
      finalScore = sum / (t.pertanyaan.length || 1);
    }
    return Number(finalScore.toFixed(2));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(jawaban).length !== t.pertanyaan.length) {
      return alert("Harap jawab semua pertanyaan!");
    }

    const skor = calculateScore();
    const is_lulus = skor >= t.batas_kelulusan;

    await addHasilTes({
      peserta_id: p.id,
      tipe_tes: t.tipe,
      tes_id: t.id,
      penguji_uid: user.id,
      tanggal_tes: new Date().toISOString(),
      snapshot_tes: { ...t },
      jawaban: Object.values(jawaban),
      skor_akhir: skor,
      is_lulus,
      label_hasil: is_lulus ? t.label_lulus : t.label_tidak_lulus,
      catatan_akhir: catatanAkhir
    });

    navigate(`/menguji/peserta/${p.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-semibold text-sm md:text-base px-4 py-2.5 rounded-xl hover:bg-primary/5 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" /> Kembali
      </button>

      <div className="glass-card p-4 sm:p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="border-b border-[#bdc8cb]/30 pb-6 sm:pb-8 mb-6 sm:mb-10 text-center relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-[#171c1f] tracking-tight leading-tight">{t.nama}</h1>
          <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-lg">Peserta: <span className="font-bold text-[#171c1f]">{p.nama}</span></p>
          <div className="mt-5 inline-flex px-4 py-1.5 bg-[#f0f4f8] border border-[#bdc8cb]/30 text-primary rounded-lg text-sm font-bold tracking-wide">
            Sistem: {t.tipe_penilaian}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          {t.pertanyaan.map((q, idx) => (
<div key={q.id} className="solid-card shadow-sm p-4 sm:p-6 md:p-8 border-transparent transition-colors duration-300 focus-within:border-primary/30">
               <div className="flex gap-3 sm:gap-4 items-start">
                 <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-display font-bold flex items-center justify-center text-sm sm:text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-xl font-display font-bold text-[#171c1f] leading-relaxed">{q.teks_utama}</h3>
                  {q.teks_sub && <p className="text-gray-600 mt-2 text-sm leading-relaxed">{q.teks_sub}</p>}
                  
                  <div className="mt-4 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
                    {t.rentang_nilai.map(r => (
                      <label 
                        key={r.nilai} 
                        className={`flex-1 min-w-0 sm:min-w-[120px] relative flex flex-col items-center justify-center p-3 sm:p-5 cursor-pointer rounded-2xl border-[1.5px] transition-all duration-300 ${jawaban[q.id]?.nilai === r.nilai ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,96,100,0.08)] ring-1 ring-primary/30' : 'border-[#bdc8cb]/40 hover:border-primary/40 bg-white/50 backdrop-blur-sm'}`}
                      >
                        <input 
                          type="radio" 
                          name={`q_${q.id}`} 
                          value={r.nilai} 
                          className="sr-only"
                          onChange={() => handleJawaban(q.id, q.teks_utama, r.nilai)}
                          required
                        />
<span className={`text-xl sm:text-2xl md:text-3xl font-display font-black mb-1 sm:mb-2 transition-colors duration-300 ${jawaban[q.id]?.nilai === r.nilai ? 'text-primary' : 'text-gray-400'}`}>{r.nilai}</span>
                         <span className={`text-[10px] sm:text-xs uppercase tracking-wide font-bold text-center transition-colors duration-300 ${jawaban[q.id]?.nilai === r.nilai ? 'text-primary' : 'text-gray-500'}`}>{r.label}</span>
                      </label>
                    ))}
                  </div>

                  {q.catatan_aktif && (
                    <div className="mt-4 sm:mt-6">
                      <label className="block text-sm font-bold text-gray-600 mb-2">
                        Catatan Penguji {q.catatan_wajib && <span className="text-error">*</span>}
                      </label>
                      <textarea
                        required={q.catatan_wajib}
                        className="input-field w-full min-h-[100px]"
                        rows={3}
                        placeholder="Tambahkan catatan khusus untuk poin penilaian ini..."
                        value={jawaban[q.id]?.catatan || ""}
                        onChange={(e) => handleJawaban(q.id, q.teks_utama, jawaban[q.id]?.nilai || 0, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {t.catatan_akhir_aktif && (
            <div className="pt-6 sm:pt-10 border-t border-[#bdc8cb]/30 mt-4 sm:mt-8">
              <label className="block text-lg sm:text-xl font-display font-bold text-[#171c1f] mb-3 sm:mb-4">
                Catatan Keseluruhan {t.catatan_akhir_wajib && <span className="text-error">*</span>}
              </label>
              <textarea
                required={t.catatan_akhir_wajib}
                className="input-field w-full min-h-[150px]"
                rows={5}
                placeholder="Tuliskan kesimpulan, impresi, atau catatan menyeluruh mengenai performa peserta..."
                value={catatanAkhir}
                onChange={e => setCatatanAkhir(e.target.value)}
              />
            </div>
          )}

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 bg-white/80 backdrop-blur-[24px] border-t border-[#bdc8cb]/30 flex justify-end items-center z-40 lg:pl-64 shadow-[0_-8px_32px_rgba(0,96,100,0.06)]">
             <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
               <span className="text-xs sm:text-sm font-bold text-gray-500 font-mono tracking-tight">Pastikan semua poin penilaian telah terisi</span>
               <button type="submit" className="btn-primary w-full sm:w-auto py-3 px-8 text-base">
                 <Save className="w-5 h-5 mr-2"/>
                 Kirim Hasil Penilaian
               </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
