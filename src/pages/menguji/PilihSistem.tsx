import { Link } from "react-router-dom";
import { ClipboardList, UserCheck } from "lucide-react";

export default function PilihSistem() {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto mt-16">
        <h2 className="text-5xl font-display font-extrabold tracking-tight text-[#171c1f]">Mulai Penilaian</h2>
        <p className="mt-4 text-xl text-[#4f606b] font-medium">Pilih program yang akan Anda uji saat ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-4xl mx-auto mt-12">
        <Link to="/menguji/evaluasi/peserta" className="group relative solid-card p-10 hover:-translate-y-2 transition-all duration-300 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <ClipboardList className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mt-8 text-2xl font-display font-bold text-[#171c1f]">Evaluasi</h3>
          <p className="mt-3 text-[#4f606b] text-base">
            Penilaian rutin untuk peserta program evaluasi.
          </p>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:bg-primary/10 transition-colors" />
        </Link>

        <Link to="/menguji/seleksi/peserta" className="group relative solid-card p-10 hover:-translate-y-2 transition-all duration-300 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#006430]/5 group-hover:bg-[#006430]/10 transition-colors">
            <UserCheck className="h-10 w-10 text-[#006430]" />
          </div>
          <h3 className="mt-8 text-2xl font-display font-bold text-[#171c1f]">Seleksi</h3>
          <p className="mt-3 text-[#4f606b] text-base">
            Penilaian untuk penerimaan kandidat baru.
          </p>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#006430]/5 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:bg-[#006430]/10 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
