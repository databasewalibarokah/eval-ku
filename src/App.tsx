/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { useAppStore } from "./stores/appStore";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManajemenUser from "./pages/admin/ManajemenUser";
import ManajemenDaerah from "./pages/admin/ManajemenDaerah";
import PengaturanMetadata from "./pages/admin/PengaturanMetadata";
import ManajemenTes from "./pages/admin/ManajemenTes";
import PilihSistem from "./pages/menguji/PilihSistem";
import PilihPeserta from "./pages/menguji/PilihPeserta";
import DashboardPeserta from "./pages/menguji/DashboardPeserta";
import MengerjakanTes from "./pages/menguji/MengerjakanTes";
import PesertaList from "./pages/peserta/PesertaList";
import PesertaDetail from "./pages/peserta/PesertaDetail";
import HasilDetail from "./pages/hasil/HasilDetail";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: ("admin" | "penguji")[] }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuthStore();
  
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_active) {
    logout();
    alert("Akun anda nonaktif!");
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default function App() {
  const initStore = useAppStore(state => state.initStore);
  const authInitialize = useAuthStore(state => state.initialize);

  useEffect(() => {
    authInitialize();
    initStore();
  }, [authInitialize, initStore]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/menguji" element={<PilihSistem />} />
            <Route path="/menguji/:tipe/peserta" element={<PilihPeserta />} />
            <Route path="/menguji/peserta/:id" element={<DashboardPeserta />} />
            <Route path="/menguji/peserta/:id/tes/:tes_id" element={<MengerjakanTes />} />
            
            <Route path="/peserta/evaluasi" element={<PesertaList tipe="evaluasi" />} />
            <Route path="/peserta/seleksi" element={<PesertaList tipe="seleksi" />} />
            <Route path="/peserta/detail/:id" element={<PesertaDetail />} />
            
            <Route path="/hasil/:id" element={<HasilDetail />} />
            
            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/users" element={<ManajemenUser />} />
              <Route path="/admin/daerah" element={<ManajemenDaerah />} />
              <Route path="/admin/metadata" element={<PengaturanMetadata />} />
              <Route path="/admin/tes" element={<ManajemenTes />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

