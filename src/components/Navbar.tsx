import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { signOut } from "firebase/auth"
import { collection, query, where, getDocs } from "firebase/firestore"
import { firebaseAuth, firestore } from "../lib/firebase"
import { useAuth } from "../lib/auth"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasSite, setHasSite] = useState(false)
  const navigate = useNavigate()
  const { user, profile, role } = useAuth()

  useEffect(() => {
    if (user && role === "supervisor") {
      const q = query(collection(firestore, "locations"), where("supervisorAuthUid", "==", user.uid));
      getDocs(q).then(snap => setHasSite(!snap.empty)).catch(console.error);
    } else {
      setHasSite(false);
    }
  }, [user, role])

  const homePath = role === "admin" ? "/admin" : "/"
  const displayName = profile?.fullName ?? ""
  const firstName =
    displayName?.trim().split(" ")[0] ||
    user?.displayName?.trim().split(" ")[0] ||
    user?.email?.split("@")[0] ||
    ""

  const handleLogout = async () => {
    await signOut(firebaseAuth)
    navigate("/")
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-950 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left */}
        <div className="flex items-center gap-8">
            <Link to={homePath} className="hover:text-yellow transition-colors">
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              Nteer
            </h1>
            </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-300">

            {role === 'admin' ? null : (
              <>
                <Link to="/sites" className="hover:text-white transition-colors">
                  Find Sites
                </Link>

                {role === 'volunteer' ? (
                  <Link to="/volunteer" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                ) : null}

                {role === 'volunteer' ? (
                  <Link to="/notifications" className="hover:text-white transition-colors">
                    Notifications
                  </Link>
                ) : null}

                {role === 'supervisor' && !hasSite ? (
                  <Link to="/registersite" className="hover:text-white transition-colors">
                    List Your Site
                  </Link>
                ) : null}

                {role === 'supervisor' && hasSite ? (
                  <Link to="/supervisor" className="hover:text-white transition-colors">
                    My Site
                  </Link>
                ) : null}
              </>
            )}

            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>

          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>

          {user ? (
            <>
              <span className="hidden sm:inline text-sm font-medium text-brand-950 bg-white/90 border border-white px-4 py-2 rounded-full font-semibold shadow-sm">
                {firstName ? `Welcome ${firstName} 👋🏽` : "Welcome 👋🏽"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-brand-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors border border-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/signup")}
                className="bg-white text-brand-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors"
              >
                Sign Up
              </button>
              <button
                onClick={() => navigate("/signin")}
                className="bg-white text-brand-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors"
              >
                Sign In
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  )
}
