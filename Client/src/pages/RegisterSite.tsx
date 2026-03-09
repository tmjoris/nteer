import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Info, 
  Users, 
  Camera,
  ArrowLeft,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from "../components/Navbar"

const CAUSES = [
  'Environment',
  'Education',
  'Health',
  'Animal Welfare',
  'Community',
  'Arts'
];

const RegisterSite: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    orgName: '',
    supervisorName: '',
    email: '',
    phone: '',
    location: '',
    cause: '',
    description: '',
    capacity: '',
    imageUrl: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-brand-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-950 mb-4">Site Registered!</h2>
          <p className="text-brand-500 mb-8 leading-relaxed">
            Thank you for joining Nteer. Our team will review your application and get back to you within 24 hours.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-all"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-brand-50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-brand-100 transition-colors text-brand-950"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-serif font-bold text-brand-950">List Your Site</h1>
            <p className="text-brand-500">Join our network of impactful organizations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Progress Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-6">Registration Progress</h3>
              <div className="space-y-6">
                {[
                  { step: 1, label: 'Organization Info' },
                  { step: 2, label: 'Site Details' },
                  { step: 3, label: 'Review & Submit' }
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-4">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      step === s.step ? "bg-brand-950 text-white scale-110" : 
                      step > s.step ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-400"
                    )}>
                      {step > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      step === s.step ? "text-brand-950 font-bold" : "text-brand-400"
                    )}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-950 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <Info className="w-8 h-8 text-brand-400 mb-4" />
                <h4 className="font-serif font-bold text-lg mb-2">Why list on Nteer?</h4>
                <p className="text-sm text-brand-300 leading-relaxed">
                  Access a community of verified volunteers, manage shifts effortlessly, and track your organization's social impact in real-time.
                </p>
              </div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-brand-100 shadow-xl">
              {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif font-bold mb-8">Organization Information</h2>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                      <input 
                        type="text"
                        name="orgName"
                        placeholder="Organization Name"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                        value={formData.orgName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                      <input 
                        type="text"
                        name="supervisorName"
                        placeholder="Supervisor Name"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                        value={formData.supervisorName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="email"
                          name="email"
                          placeholder="Email Address"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-serif font-bold mb-8">Site Details</h2>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                      <input 
                        type="text"
                        name="location"
                        placeholder="Site Location (City, Area)"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <select 
                          name="cause"
                          required
                          className="w-full px-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all appearance-none"
                          value={formData.cause}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Cause</option>
                          {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="number"
                          name="capacity"
                          placeholder="Volunteer Capacity"
                          required
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.capacity}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <textarea 
                        name="description"
                        placeholder="Tell us about your site and what volunteers will do..."
                        required
                        rows={4}
                        className="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                      <input 
                        type="url"
                        name="imageUrl"
                        placeholder="Image URL (Optional)"
                        className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <h2 className="text-2xl font-serif font-bold mb-8">Review Your Information</h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-brand-50 rounded-3xl space-y-4">
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Organization</span>
                        <span className="font-bold text-brand-950">{formData.orgName}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Supervisor</span>
                        <span className="font-bold text-brand-950">{formData.supervisorName}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Location</span>
                        <span className="font-bold text-brand-950">{formData.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-400 text-sm">Cause</span>
                        <span className="font-bold text-brand-950">{formData.cause}</span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-400 text-center px-4">
                      By submitting this form, you agree to our Terms of Service and Privacy Policy. We will contact you to verify your organization.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-12 flex gap-4">
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 border-2 border-brand-100 text-brand-950 rounded-2xl font-bold hover:bg-brand-50 transition-all"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    Continue <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-all"
                  >
                    Submit Registration
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterSite;
