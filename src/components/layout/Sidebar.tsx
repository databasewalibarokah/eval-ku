import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { 
  LayoutDashboard, 
  PlayCircle, 
  Users, 
  FileText, 
  Settings, 
  MapPin, 
  UserCog, 
  ListTodo
} from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const publicLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mulai Menguji", href: "/menguji", icon: PlayCircle },
    { name: "Peserta Evaluasi", href: "/peserta/evaluasi", icon: Users },
    { name: "Peserta Seleksi", href: "/peserta/seleksi", icon: Users },
  ];

  const adminLinks = [
    { name: "Manajemen User", href: "/admin/users", icon: UserCog },
    { name: "Manajemen Daerah", href: "/admin/daerah", icon: MapPin },
    { name: "Pengaturan Metadata", href: "/admin/metadata", icon: Settings },
    { name: "Manajemen Tes", href: "/admin/tes", icon: ListTodo },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f6fafe]">
      <div className="flex items-center px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-primary tracking-tight">
          EvalKU
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2">
        <nav className="space-y-2">
          {publicLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) => cn(
                "group flex items-center px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all",
                isActive 
                  ? "bg-primary text-white shadow-[0_8px_32px_rgba(0,96,100,0.15)]" 
                  : "text-[#171c1f] hover:bg-[#dfe3e7] hover:text-primary"
              )}
            >
              <item.icon className="mr-4 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
          
          {isAdmin && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#dfe3e7]/50 relative">
              <h3 className="px-3 sm:px-4 text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 sm:mb-4 font-display">
                System
              </h3>
              <div className="space-y-2">
              {adminLinks.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) => cn(
"group flex items-center px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-[15px] font-semibold rounded-xl sm:rounded-2xl transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-[0_8px_32px_rgba(0,96,100,0.15)]" 
                      : "text-[#171c1f] hover:bg-[#dfe3e7] hover:text-primary"
                  )}
                >
<item.icon className="mr-3 sm:mr-4 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
