import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const state = location.state as any;
    if (typeof state?.error === 'string' && state.error.length > 0) {
      setError(state.error);
    }

    try {
      const stored = sessionStorage.getItem('auth_error');
      if (stored) {
        setError(stored);
        sessionStorage.removeItem('auth_error');
      }
    } catch {
      // ignore
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(firebaseAuth, formData.email, formData.password);
      const state = location.state as any;
      const from = typeof state?.from === 'string' ? state.from : '/redirect';
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error during signing in: ", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-200">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 p-12 lg:p-24 bg-brand-950 flex-col justify-between text-white transition-all duration-700">
        <div>
          <Link to="/" className="text-2xl font-serif font-bold italic text-brand-50">NTeer.</Link>
        </div>
        <div className="max-w-xl">
          <h2 className="text-6xl font-serif font-bold leading-tight mb-6 mt-12">
            Welcome back to your <span className="serif-italic">impact</span>.
          </h2>
          <p className="text-xl text-brand-100 opacity-80 leading-relaxed max-w-lg mb-8">
            Pick up where you left off. The community is still counting on you.
          </p>
        </div>
        <div className="text-sm font-medium text-brand-400">
          © {new Date().getFullYear()} NTeer Platform
        </div>
      </div>

      {/* Right side */}
      <div className="relative flex flex-col justify-center w-full lg:w-1/2 bg-brand-50 p-8 lg:p-24 transition-all duration-700">
        <Link to="/" className="absolute top-8 left-8 lg:hidden text-2xl font-serif font-bold italic text-brand-950">NTeer.</Link>

        <div className="max-w-md w-full mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif font-bold text-brand-950 mb-3">Log in</h1>
            <p className="text-brand-600">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-brand-600 hover:text-brand-950 transition-colors uppercase tracking-widest"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pb-3 pr-12 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-600 mb-3"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center pt-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer w-5 h-5 appearance-none border-2 border-brand-300 rounded cursor-pointer checked:bg-brand-950 checked:border-brand-950 transition-colors"
                  />
                  <div className="absolute text-brand-50 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-700 group-hover:text-brand-950 transition-colors">Remember me</span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-brand-950 text-white px-8 py-5 rounded-xl font-bold hover:bg-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">Access Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-brand-600 mt-8 font-medium">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-brand-950 font-bold hover:underline transition-colors"
              >
                Join now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
