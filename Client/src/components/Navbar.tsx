import { useState } from "react"
import { Menu, X } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-950 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left */}
        <div className="flex items-center gap-8">
            <Link to="/" className="hover:text-yellow transition-colors">
            <h1 className="text-2xl font-serif font-bold tracking-tight">
              Nteer
            </h1>
            </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-300">

            <Link to="/sites" className="hover:text-white transition-colors">
              Find Sites
            </Link>

            <Link to="/registersite" className="hover:text-white transition-colors">
              List Your Site
            </Link>

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

        </div>
      </div>
    </nav>
  )
}