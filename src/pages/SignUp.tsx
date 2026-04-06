import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { normalizeRole } from '../lib/rbac';
import { firebaseAuth, firestore } from '../lib/firebase';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    userRole: "volunteer",
    phoneNumber: "",
    city: ""
  });
  const passwordsMatch = confirmPassword.length === 0 || formData.password === confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        formData.email,
        formData.password
      );

      await addDoc(collection(firestore, 'user'), {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        userRole: normalizeRole(formData.userRole) ?? 'volunteer',
        supervisorStatus:
          normalizeRole(formData.userRole) === 'supervisor' ? 'pending' : 'approved',
        city: formData.city,
        createdOn: serverTimestamp(),
        authUid: userCredential.user.uid,
      });

      navigate("/signin");
    } catch (error) {
      console.error("Error during registration: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-brand-200">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 p-12 lg:p-24 bg-brand-100 flex-col justify-between transition-all duration-700">
        <div>
          <Link to="/" className="text-2xl font-serif font-bold italic text-brand-950">NTeer.</Link>
        </div>
        <div className="max-w-xl">
          <h2 className="text-6xl font-serif font-bold leading-tight mb-6 mt-12 text-brand-950">
            Join the <span className="serif-italic">movement</span>.
          </h2>
          <p className="text-xl text-brand-600 leading-relaxed max-w-lg mb-8">
            Create an account to track your hours, discover amazing sites, and maximize your volunteer impact.
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
            <h1 className="text-4xl font-serif font-bold text-brand-950 mb-3">Create Account</h1>
            <p className="text-brand-600">Join NTeer for an easier volunteering experience</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg placeholder-brand-300"
                required
              />
            </div>

            {/* Password Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pb-3 pr-10 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                    required
                    minLength={8}
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

              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pb-3 pr-10 border-b-2 bg-transparent outline-none transition-all text-lg
                      ${passwordsMatch ? "border-brand-200 focus:border-brand-600" : "border-red-500"}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 text-brand-400 hover:text-brand-600 mb-3"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
            {!passwordsMatch && (
              <p className="text-sm font-medium text-red-600 mt-1">Passwords do not match</p>
            )}

            {/* Phone & Role Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pb-3 border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-900 uppercase tracking-widest">
                  I am a...
                </label>
                <select
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleChange}
                  className="w-full pb-[13.5px] border-b-2 border-brand-200 bg-transparent focus:border-brand-600 outline-none transition-all text-lg"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="supervisor">Site Supervisor</option>
                </select>
              </div>
            </div>

            {/* Registration Button */}
            <div className="pt-8">
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
                    <span className="text-lg">Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-brand-600 mt-8 font-medium">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="text-brand-950 font-bold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
