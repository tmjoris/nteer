import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Settings, 
  Trash2, 
  Globe, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

type Volunteer = {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
};

export default function SupervisorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [site, setSite] = useState<any>(null);
  const [loadingSite, setLoadingSite] = useState(true);
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [newVolunteerName, setNewVolunteerName] = useState('');
  const [newVolunteerEmail, setNewVolunteerEmail] = useState('');

  // Load site
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchSite = async () => {
      try {
        const q = query(collection(firestore, "locations"), where("supervisorAuthUid", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const siteDoc = snap.docs[0];
          setSite({ id: siteDoc.id, ...siteDoc.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSite(false);
      }
    };
    fetchSite();
  }, [user, authLoading, navigate]);

  // Load volunteers
  useEffect(() => {
    if (!site?.id) return;
    const unsub = onSnapshot(collection(firestore, `locations/${site.id}/volunteers`), (snap) => {
      const vols = snap.docs.map(d => ({ id: d.id, ...d.data() } as Volunteer));
      setVolunteers(vols.sort((a,b) => new Date(b.registeredAt).valueOf() - new Date(a.registeredAt).valueOf()));
    });
    return () => unsub();
  }, [site?.id]);

  const updateCapacity = async (delta: number) => {
    if (!site) return;
    const newCap = Math.max(1, (site.capacity || 0) + delta);
    // Optimistic Update
    setSite({ ...site, capacity: newCap });
    try {
      await updateDoc(doc(firestore, "locations", site.id), { capacity: newCap });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!site || !newVolunteerName.trim() || !newVolunteerEmail.trim() || volunteers.length >= (site.capacity || 0)) return;
    
    try {
      // It auto syncs via onSnapshot, so we just write
      await addDoc(collection(firestore, `locations/${site.id}/volunteers`), {
        name: newVolunteerName,
        email: newVolunteerEmail,
        role: 'Registered Volunteer',
        registeredAt: new Date().toISOString(),
      });
      setNewVolunteerName('');
      setNewVolunteerEmail('');
      setIsAddingVolunteer(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckOut = async (id: string) => {
    if (!site) return;
    try {
      await deleteDoc(doc(firestore, `locations/${site.id}/volunteers`, id));
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllVolunteers = async () => {
    if (!site || volunteers.length === 0) return;
    if (window.confirm("Are you sure you want to completely clear the roster?")) {
      for (const v of volunteers) {
        await handleCheckOut(v.id);
      }
    }
  };

  if (authLoading || loadingSite) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
        <div className="text-brand-500 font-bold animate-pulse">Loading Site Command Center...</div>
      </div>
    );
  }

  if (!site) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen pt-32 pb-20 bg-brand-50 flex items-center justify-center px-6 selection:bg-brand-200 text-brand-950 font-sans">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-xl text-center max-w-xl w-full border border-brand-100 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-sm text-brand-500">
                <Globe className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-brand-950 mb-4 tracking-tight">No Site Listed</h2>
              <p className="text-brand-500 mb-10 leading-relaxed max-w-md mx-auto text-lg">
                Before you can access the powerful Supervisor Command Center, you need to list your organization's site on Nteer.
              </p>
              <Link to="/registersite" className="inline-flex w-full py-5 bg-brand-950 text-white text-lg font-bold rounded-2xl hover:bg-brand-800 transition-colors shadow-lg shadow-brand-950/20 justify-center">
                List Your Site Now
              </Link>
            </div>
            {/* Decors */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  const siteLimit = site.capacity || 0;
  const isAtCapacity = volunteers.length >= siteLimit;
  const capacityPercentage = siteLimit === 0 ? 100 : Math.min(100, Math.round((volunteers.length / siteLimit) * 100));

  return (
    <>
    <Navbar/>
    <div className="min-h-screen pt-5 bg-brand-50 selection:bg-brand-200 text-brand-950 font-sans pb-20">
      {/* Header */}
      <header className="px-6 py-12 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-serif font-bold tracking-tight mb-2">Site Command Center</h1>
            <p className="text-brand-600 serif-italic text-lg">Manage your site capacity and active tracking.</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-1">Editing Site</div>
            <div className="flex items-center gap-2 text-brand-900 font-bold text-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              {site.name}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-500 flex items-center justify-end gap-1">
              <MapPin className="w-3 h-3" /> {site.location}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Volunteers */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold">Active Volunteers</h2>
              <button 
                onClick={() => setIsAddingVolunteer(true)}
                disabled={isAtCapacity}
                className="flex items-center gap-2 px-5 py-3 bg-brand-950 text-white rounded-xl text-sm font-bold hover:bg-brand-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <UserPlus className="w-4 h-4" /> Register Volunteer
              </button>
            </div>

            <div className="space-y-4">
              {volunteers.length === 0 && (
                <div className="p-12 border-2 border-dashed border-brand-200 rounded-[2rem] text-center bg-white/50">
                  <Users className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                  <p className="text-brand-400 font-medium">No volunteers registered to this site yet.</p>
                </div>
              )}
              <AnimatePresence>
                {volunteers.map(v => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={v.id}
                    className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-lg">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-brand-950">{v.name}</h3>
                        <p className="text-sm font-medium text-brand-600">{v.email}</p>
                        <p className="text-xs text-brand-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Registered on {format(new Date(v.registeredAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(v.id)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-50 text-brand-900 border border-brand-100 hover:bg-brand-100 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Right Column: Capacity Controls */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-brand-950 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-8">Capacity Controls</h3>
              
              <div className="flex justify-center items-center gap-6 mb-8">
                <button 
                  onClick={() => updateCapacity(-1)}
                  className="w-12 h-12 rounded-full border-2 border-brand-400/30 flex items-center justify-center text-brand-200 hover:border-brand-200 hover:text-white hover:bg-brand-800 transition-all active:scale-95"
                >
                  <span className="text-2xl font-bold leading-none">-</span>
                </button>
                
                <div className="text-center">
                  <div className="text-6xl font-serif font-bold mb-2 flex items-baseline justify-center">
                    {volunteers.length}<span className="text-3xl text-brand-400 font-sans mx-1">/</span>{siteLimit}
                  </div>
                  <div className="text-xs font-bold text-brand-300 uppercase tracking-widest">
                    Active Roster Size
                  </div>
                </div>

                <button 
                  onClick={() => updateCapacity(1)}
                  className="w-12 h-12 rounded-full border-2 border-brand-400/30 flex items-center justify-center text-brand-200 hover:border-brand-200 hover:text-white hover:bg-brand-800 transition-all active:scale-95"
                >
                  <span className="text-2xl font-bold leading-none">+</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-brand-900 rounded-full h-3 mb-6 overflow-hidden">
                <motion.div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isAtCapacity ? "bg-red-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${capacityPercentage}%` }}
                />
              </div>

              <div className={cn(
                "py-3 px-6 rounded-xl text-sm font-bold inline-flex items-center gap-2 justify-center",
                isAtCapacity ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-400"
              )}>
                {isAtCapacity ? (
                  <><AlertCircle className="w-4 h-4" /> Capacity Reached</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Accepting Volunteers</>
                )}
              </div>
            </div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* Quick Actions */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm">
            <h3 className="text-lg font-serif font-bold mb-6 flex items-center gap-2 text-brand-950">
              <Settings className="w-5 h-5 text-brand-600" /> Site Settings
            </h3>
            <div className="space-y-3">
              <button 
                onClick={clearAllVolunteers}
                className="w-full py-4 px-6 bg-brand-50 text-brand-900 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors flex justify-between items-center group"
              >
                Clear Entire Roster
                <Trash2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
              <button className="w-full py-4 px-6 bg-brand-50 text-brand-900 rounded-xl font-bold hover:bg-brand-100 transition-colors flex justify-between items-center group">
                Export Roster
                <Globe className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Adding Volunteer Modal */}
      <AnimatePresence>
        {isAddingVolunteer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingVolunteer(false)}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold mb-6 text-brand-950">Register New Volunteer</h2>
              <form onSubmit={handleAddVolunteer} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    autoFocus
                    required
                    className="w-full p-4 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 text-brand-950 font-medium"
                    placeholder="e.g., Jane Doe"
                    value={newVolunteerName}
                    onChange={e => setNewVolunteerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email"
                    required
                    className="w-full p-4 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10 text-brand-950 font-medium"
                    placeholder="e.g., jane@example.com"
                    value={newVolunteerEmail}
                    onChange={e => setNewVolunteerEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsAddingVolunteer(false)}
                    className="flex-1 py-4 bg-brand-50 rounded-xl font-bold text-brand-600 hover:bg-brand-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors shadow-md"
                  >
                    Add Volunteer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    <Footer/>
    </>
  );
}
