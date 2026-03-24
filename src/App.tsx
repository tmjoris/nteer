import {Routes, Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import SupervisorDashboard from "./pages/SupervisorDashboard"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import SiteMap from "./pages/SiteMap"
import RegisterSite from "./pages/RegisterSite"
import About from "./pages/About"
import SiteDashboard from "./pages/SiteDashboard"

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/signin" element={<SignIn/>}/>
            <Route path="/supervisor" element={<SupervisorDashboard/>}/>
            <Route path="/sites" element={<SiteMap onBack={function (): void {
                throw new Error("Function not implemented.")
            } }/>}/>
            <Route path="/site/:siteKey" element={<SiteDashboard />} />
            <Route path="/registersite" element={<RegisterSite/>}/>
            <Route path="/about" element={<About/>}/>
        </Routes>
    )
}