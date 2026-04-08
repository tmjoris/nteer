import { Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import SiteMap from "./pages/SiteMap"
import RegisterSite from "./pages/RegisterSite"
import About from "./pages/About"
import AdminDashboard from "./pages/AdminDashboard"
import RequireRole from "./components/RequireRole"
import RoleRedirect from "./components/RoleRedirect"
import RequireApprovedSupervisor from "./components/RequireApprovedSupervisor"
import SupervisorApproval from "./pages/SupervisorApproval"
import SupervisorMySite from "./pages/SupervisorMySite"
import SiteDetail from "./pages/SiteDetail"
import VolunteerDashboard from "./pages/VolunteerDashboard"
import Notifications from "./pages/Notifications"
import { useAuth } from "./lib/auth"
import NotificationWatcher from "./components/NotificationWatcher"

function HomeRoute() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="text-brand-500">Loadingâ€¦</div>
      </div>
    );
  }

  if (role === "admin") return <Navigate to="/admin" replace />;

  return <Dashboard />;
}

function SiteMapRoute() {
  const navigate = useNavigate();
  return <SiteMap onBack={() => navigate(-1)} />;
}

export default function App() {
    return (
        <>
          <NotificationWatcher />
          <Routes>
              <Route path="/" element={<HomeRoute />}/>
              <Route path="/signup" element={<SignUp/>}/>
              <Route path="/signin" element={<SignIn/>}/>
              <Route path="/redirect" element={<RoleRedirect />} />
              <Route path="/supervisor-approval" element={<SupervisorApproval />} />
              <Route
                path="/supervisor"
                element={
                  <RequireRole allowed={['supervisor', 'admin']}>
                    <SupervisorMySite />
                   </RequireRole>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireRole allowed={['admin']}>
                    <AdminDashboard />
                  </RequireRole>
                }
              />
              <Route path="/volunteer" element={<VolunteerDashboard />} />
              <Route
                path="/notifications"
                element={
                  <RequireRole allowed={['volunteer', 'admin']}>
                    <Notifications />
                  </RequireRole>
                }
              />
              <Route path="/sites" element={<SiteMapRoute />}/>
              <Route path="/site/:siteKey" element={<SiteDetail />} />
              <Route
                path="/registersite"
                element={
                  <RequireApprovedSupervisor>
                    <RegisterSite />
                  </RequireApprovedSupervisor>
                }
              />
              <Route path="/about" element={<About/>}/>
          </Routes>
        </>
    )
}

