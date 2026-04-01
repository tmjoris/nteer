import { Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import SupervisorDashboard from "./pages/SupervisorDashboard"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import SiteMap from "./pages/SiteMap"
import RegisterSite from "./pages/RegisterSite"
import About from "./pages/About"
import SiteDashboard from "./pages/SiteDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import RequireRole from "./components/RequireRole"
import RoleRedirect from "./components/RoleRedirect"
import RequireApprovedSupervisor from "./components/RequireApprovedSupervisor"
import SupervisorApproval from "./pages/SupervisorApproval"
import { useAuth } from "./lib/auth"

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

export default function App() {
    return (
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
                  <SupervisorDashboard />
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
            <Route path="/redirect" element={<RoleRedirect />} />
            <Route path="/supervisor-approval" element={<SupervisorApproval />} />
            <Route
              path="/supervisor"
              element={
                <RequireRole allowed={['supervisor', 'admin']}>
                  <SupervisorDashboard />
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
            <Route path="/sites" element={<SiteMap onBack={function (): void {
                throw new Error("Function not implemented.")
            } }/>}/>
            <Route path="/site/:siteKey" element={<SiteDashboard />} />
            <Route
              path="/registersite"
              element={
                <RequireApprovedSupervisor>
                  <RegisterSite />
                </RequireApprovedSupervisor>
              }
            />
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
    )
}

