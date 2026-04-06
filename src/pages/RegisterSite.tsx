import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Info, 
  Users, 
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from "../components/Navbar"
import Footer from '../components/Footer';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CAUSES = [
  'Environment',
  'Education',
  'Health',
  'Animal Welfare',
  'Community',
  'Arts'
];

function MapClickHandler({ setLocation }: { setLocation: (loc: {lat: number, lng: number}) => void }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const RegisterSite: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    cause: '',
    description: '',
    capacity: '',
    current: '',
    impactScore: '',
  });

  const [location, setLocation] = useState({ lat: -1.25137798, lng: 36.89112782 });
  const [showMapModal, setShowMapModal] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await addDoc(collection(firestore, 'locations'), {
        name: formData.name,
        cause: formData.cause,
        description: formData.description,
        capacity: Number(formData.capacity) || 0,
        current: Number(formData.current) || 0,
        impactScore: Number(formData.impactScore) || 0,
        location: location,
        status: 'pending',
        supervisorAuthUid: user.uid,
        createdOn: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (e) {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Thanks! Your site is now properly formatted and pending admin approval. You'll be able to manage your dashboard once approved.
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
            <p className="text-brand-500">Provide the specific details of your organization's headquarters.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Progress Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-6">Registration Progress</h3>
              <div className="space-y-6">
                {[
                  { step: 1, label: 'Organization Identity' },
                  { step: 2, label: 'Metrics & Location' },
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
                  <h2 className="text-2xl font-serif font-bold mb-8">Organization Identity</h2>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                      <input 
                        type="text"
                        name="name"
                        placeholder="Organization Name"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="relative">
                      <select 
                        name="cause"
                        required
                        className="w-full px-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all appearance-none text-brand-950"
                        value={formData.cause}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Primary Cause</option>
                        {CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="relative">
                      <textarea 
                        name="description"
                        placeholder="Detailed Description (e.g. Al-Tawoon Islamic Youth Group is a community-based...)"
                        required
                        rows={6}
                        className="w-full p-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all resize-none"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
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
                  <h2 className="text-2xl font-serif font-bold mb-8">Metrics & Location</h2>
                  
                  <div className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="number"
                          name="capacity"
                          placeholder="Maximum Capacity (e.g. 30)"
                          required
                          min="0"
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.capacity}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="number"
                          name="current"
                          placeholder="Current Users (e.g. 10)"
                          required
                          min="0"
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.current}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="relative">
                        <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-300" />
                        <input 
                          type="number"
                          name="impactScore"
                          placeholder="Impact Score Rating (0-100)"
                          required
                          min="0"
                          max="100"
                          className="w-full pl-12 pr-4 py-4 bg-brand-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-950 outline-none transition-all"
                          value={formData.impactScore}
                          onChange={handleInputChange}
                        />
                    </div>

                    <div className="relative flex items-center justify-between p-4 bg-brand-50 border-none rounded-2xl outline-none transition-all">
                      <div className="flex items-center gap-3 text-brand-950">
                        <MapPin className="w-5 h-5 text-brand-400" />
                        <span className="font-bold text-sm tracking-wide bg-white px-3 py-1 rounded-md border border-brand-100">
                          {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowMapModal(true)}
                        className="px-5 py-3 bg-brand-200 text-brand-950 rounded-xl text-sm font-bold hover:bg-brand-300 transition-colors shadow-sm"
                      >
                        Adjust on Map
                      </button>
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
                  <h2 className="text-2xl font-serif font-bold mb-8">Review Formulation</h2>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-brand-50 rounded-3xl space-y-4">
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Site Name</span>
                        <span className="font-bold text-brand-950">{formData.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Cause & Metrics</span>
                        <span className="font-bold text-brand-950">{formData.cause} | Capacity: {formData.capacity}</span>
                      </div>
                      <div className="flex justify-between border-b border-brand-100 pb-2">
                        <span className="text-brand-400 text-sm">Impact Rating</span>
                        <span className="font-bold text-brand-950">{formData.impactScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-400 text-sm">Coordinates</span>
                        <span className="font-bold text-brand-950 text-sm">
                          Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-brand-500 text-center px-4 font-medium leading-relaxed">
                      By submitting this form, you affirm that the coordinates and descriptors provided are accurate. We will contact you to finalize the organization review process via your account data.
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
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-brand-950 text-white rounded-2xl font-bold hover:bg-brand-800 transition-all shadow-md"
                >
                  {isSubmitting ? 'Submitting…' : 'Finalize Validation'}
                </button>
              )}
              </div>
              {submitError ? <div className="mt-4 text-sm text-red-700 font-medium text-center">{submitError}</div> : null}
            </form>
          </div>
        </div>
      </div>
      
      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMapModal(false)}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <h2 className="text-2xl font-serif font-bold mb-2">Pin your exact location</h2>
              <p className="text-brand-500 mb-6 font-medium">Click precisely where your organisation operates so volunteers can find you easily.</p>
              
              <div className="w-full h-96 rounded-2xl overflow-hidden border border-brand-100 shadow-inner z-0 relative">
                <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[location.lat, location.lng]} />
                  <MapClickHandler setLocation={setLocation} />
                </MapContainer>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="px-8 py-3 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors shadow-md"
                >
                  Confirm Coordinates
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    <Footer/>
    </>
  );
};

export default RegisterSite;
