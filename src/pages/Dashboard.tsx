import { useAppStore } from "../stores/appStore";
import { Link } from "react-router-dom";
import { Users, FileText, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { peserta, hasilTes } = useAppStore();

  const pesertaEvaluasi = peserta.filter(p => p.tipe_peserta === "evaluasi").length;
  const pesertaSeleksi = peserta.filter(p => p.tipe_peserta === "seleksi").length;
  const totalLulus = hasilTes.filter(h => h.is_lulus).length;

  const stats = [
    { name: "Peserta Evaluasi", value: pesertaEvaluasi, icon: Users, color: "bg-blue-500", to: "/peserta/evaluasi" },
    { name: "Peserta Seleksi", value: pesertaSeleksi, icon: Users, color: "bg-purple-500", to: "/peserta/seleksi" },
    { name: "Total Hasil Tes", value: hasilTes.length, icon: FileText, color: "bg-green-500", to: "#" },
    { name: "Total Lulus", value: totalLulus, icon: CheckCircle, color: "bg-teal-500", to: "#" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-[#171c1f]">Overview</h2>
          <p className="mt-2 text-[#4f606b] font-medium text-lg">Your sanctuary for insights and evaluations.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/menguji" 
            className="inline-flex items-center btn-primary"
          >
            Mulai Menguji
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 pt-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden solid-card p-6 sm:p-8 group hover:-translate-y-1 transition-transform duration-300">
            <dt>
              <div className={`absolute rounded-2xl p-4 transition-colors ${stat.name.includes('Lulus') ? 'bg-[#006430]' : 'bg-primary'} group-hover:opacity-90`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-20 truncate text-sm font-bold text-gray-500 uppercase tracking-widest font-display">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-20 flex items-baseline pb-2 mt-2">
              <p className="text-3xl md:text-4xl font-display font-extrabold text-[#171c1f]">
                {stat.value}
              </p>
            </dd>
            {stat.to !== "#" && (
              <Link to={stat.to} className="absolute inset-0 z-10" />
            )}
            <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
