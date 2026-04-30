import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuthStore } from "../../stores/authStore";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-[#f0f4f8] text-[#171c1f] font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 transform bg-white/70 backdrop-blur-[24px] border-[1.5px] border-white/40 transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} shadow-[0_8px_32px_rgba(0,96,100,0.06)] lg:shadow-none lg:border-r lg:border-[#dfe3e7]`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10" />

        {/* Header */}
        <header className="bg-transparent border-none">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-6 lg:px-12">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-primary hover:bg-primary/5 p-2 rounded-2xl transition focus:outline-none lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6 glass-card px-5 py-2 sm:px-6 sm:py-3 rounded-full ml-auto">
              <div className="text-right">
                <p className="text-sm font-bold text-primary font-display">{user?.nama}</p>
                <p className="text-xs text-gray-500 tracking-wide capitalize">{user?.role}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-gray-500 hover:text-error rounded-full hover:bg-error/10 transition"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 lg:pt-4">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
