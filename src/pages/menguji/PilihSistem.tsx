import { Link } from "react-router-dom";
import { ClipboardList, UserCheck } from "lucide-react";

export default function PilihSistem() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="text-center max-w-3xl mx-auto mt-8 sm:mt-16">
        <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#171c1f]">Mulai Penilaian</h2>
        <p className="mt-2 sm:mt-4 text-base sm:text-xl text-[#4f606b] font-medium">Pilih program yang akan Anda uji saat ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2 max-w-4xl mx-auto mt-6 sm:mt-12">
        <Link to="/menguji/evaluasi/peserta" className="group relative solid-card p-6 sm:p-10 hover:-translate-y-2 transition-all duration-300 text-center">
          <div className="mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-[1.25rem] sm:rounded-[2rem] bg-primary/5 group-hover:bg-primary/10 transition-colors">
            <ClipboardList className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="mt-4 sm:mt-8 text-xl sm:text-2xl font-display font-bold text-[#171c1f]">Evaluasi</h3>
          <p className="mt-2 sm:mt-3 text-[#4f606b] text-sm sm:text-base">
            Penilaian rutin untuk peserta program evaluasi.
          </p>
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:bg-primary/10 transition-colors" />
        </Link>

        <Link to="/menguji/seleksi/peserta" className="group relative solid-card p-6 sm:p-10 hover:-translate-y-2 transition-all duration-300 text-center">
          <div className="mx-auto flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-[1.25rem] sm:rounded-[2rem] bg-[#006430]/5 group-hover:bg-[#006430]/10 transition-colors">
            <UserCheck className="h-6 w-6 sm:h-10 sm:w-10 text-[#006430]" />
          </div>
          <h3 className="mt-4 sm:mt-8 text-xl sm:text-2xl font-display font-bold text-[#171c1f]">Seleksi</h3>
          <p className="mt-2 sm:mt-3 text-[#4f606b] text-sm sm:text-base">
            Penilaian untuk penerimaan kandidat baru.
          </p>
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#006430]/5 rounded-full blur-[40px] pointer-events-none -z-10 group-hover:bg-[#006430]/10 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
