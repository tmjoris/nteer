import {Routes, Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/signin" element={<SignIn/>}/>
        </Routes>
    )
}