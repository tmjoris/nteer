/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Pill, 
  Plane, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Globe, 
  AlertCircle,
  ChevronRight,
  Calendar,
  Info,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addHours, parseISO, isAfter, isBefore } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import ReactMarkdown from 'react-markdown';
import { Medication, Trip, TravelAdvice } from '../types';
import { cn } from '../lib/utils';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SupervisorDashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [advice, setAdvice] = useState<Record<string, TravelAdvice>>({});
  const [loadingAdvice, setLoadingAdvice] = useState<string | null>(null);
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [newMed, setNewMed] = useState<Partial<Medication>>({ frequency: 'daily' });
  const [isPlanningTrip, setIsPlanningTrip] = useState(false);
  const [newTrip, setNewTrip] = useState<Partial<Trip>>({
    homeTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    destinationTimeZone: 'UTC'
  });

  // Load data
  useEffect(() => {
    const savedMeds = localStorage.getItem('meds');
    const savedTrip = localStorage.getItem('trip');
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedTrip) setTrip(JSON.parse(savedTrip));
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('trip', JSON.stringify(trip));
  }, [trip]);

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    const med: Medication = {
      id: crypto.randomUUID(),
      name: newMed.name,
      dosage: newMed.dosage || '',
      frequency: newMed.frequency as any,
      time: newMed.time || '08:00',
      notes: newMed.notes || '',
    };
    setMedications([...medications, med]);
    setNewMed({ frequency: 'daily' });
    setIsAddingMed(false);
  };

  const handleTakeMed = (id: string) => {
    setMedications(meds => meds.map(m => 
      m.id === id ? { ...m, lastTaken: new Date().toISOString() } : m
    ));
  };

  const handleDeleteMed = (id: string) => {
    setMedications(meds => meds.filter(m => m.id !== id));
  };

  const handlePlanTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.destination || !newTrip.startDate || !newTrip.endDate) return;
    const tripData: Trip = {
      id: crypto.randomUUID(),
      destination: newTrip.destination,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      homeTimeZone: newTrip.homeTimeZone || 'UTC',
      destinationTimeZone: newTrip.destinationTimeZone || 'UTC',
    };
    setTrip(tripData);
    setIsPlanningTrip(false);
  };

  const fetchAdvice = async (medName: string) => {
    if (!trip) return;
    setLoadingAdvice(medName);
    setLoadingAdvice(null);
  };

  const timeZoneInfo = useMemo(() => {
    if (!trip) return null;
    const now = new Date();
    const homeTime = formatInTimeZone(now, trip.homeTimeZone, 'HH:mm');
    const destTime = formatInTimeZone(now, trip.destinationTimeZone, 'HH:mm');
    
    // Calculate offset
    const homeDate = toZonedTime(now, trip.homeTimeZone);
    const destDate = toZonedTime(now, trip.destinationTimeZone);
    const offsetHours = (destDate.getTime() - homeDate.getTime()) / (1000 * 60 * 60);

    return { homeTime, destTime, offsetHours };
  }, [trip]);

  const [showSummary, setShowSummary] = useState(false);
  const [generalTips, setGeneralTips] = useState<string>('');
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    if (trip && !generalTips) {
      const fetchTips = async () => {
        setLoadingTips(true);
        setLoadingTips(false);
      };
      fetchTips();
    }
  }, [trip]);

  if (showSummary) {
    return (
      <div className="min-h-screen bg-white p-8">
        <button 
          onClick={() => setShowSummary(false)}
          className="mb-8 text-brand-600 font-bold flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
        </button>
        <div className="max-w-2xl mx-auto border-2 border-brand-950 p-12 rounded-[3rem]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold mb-2">Prescription Summary</h1>
            <p className="text-brand-500 uppercase tracking-widest text-xs font-bold">Official Travel Document Supplement</p>
          </div>
          
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8 border-b border-brand-100 pb-8">
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-400 mb-1">Traveler</div>
                <div className="font-bold">Verified User</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-brand-400 mb-1">Destination</div>
                <div className="font-bold">{trip?.destination}</div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold">Active Prescriptions</h2>
              {medications.map(med => (
                <div key={med.id} className="flex justify-between items-center py-4 border-b border-brand-50 last:border-0">
                  <div>
                    <div className="font-bold text-lg">{med.name}</div>
                    <div className="text-brand-500">{med.dosage}</div>
                  </div>
                  <div className="text-right text-sm text-brand-400 italic">
                    {med.frequency}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-brand-50 rounded-2xl text-xs text-brand-500 leading-relaxed">
              <p className="font-bold mb-2 text-brand-950">Note to Customs/Medical Personnel:</p>
              This document is a digital summary of the traveler's current medication regimen. Please cross-reference with physical prescription labels and official doctor's letters where required by local law.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen pt-5">
      {/* Header */}
      <header className="px-6 py-12 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-serif font-bold tracking-tight mb-2">MedVoyage</h1>
            <p className="text-brand-600 serif-italic text-lg">Your prescriptions, without borders.</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium uppercase tracking-widest text-brand-400 mb-1">Current Status</div>
            <div className="flex items-center gap-2 text-brand-900 font-medium">
              <Globe className="w-4 h-4" />
              {trip ? `Traveling to ${trip.destination}` : 'At Home Base'}
            </div>
            {medications.length > 0 && (
              <button 
                onClick={() => setShowSummary(true)}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-500 hover:text-brand-950 flex items-center gap-1 ml-auto"
              >
                <ShieldCheck className="w-3 h-3" /> View Travel Summary
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Medications */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold">My Medications</h2>
              <button 
                onClick={() => setIsAddingMed(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-950 text-white rounded-full text-sm font-medium hover:bg-brand-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>

            <div className="space-y-4">
              {medications.length === 0 && (
                <div className="p-12 border-2 border-dashed border-brand-200 rounded-3xl text-center">
                  <Pill className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                  <p className="text-brand-400">No medications added yet.</p>
                </div>
              )}
              {medications.map(med => (
                <motion.div 
                  layout
                  key={med.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-brand-950">{med.name}</h3>
                        <p className="text-sm text-brand-500">{med.dosage} • {med.frequency}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleTakeMed(med.id)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-bold transition-all",
                          med.lastTaken && format(parseISO(med.lastTaken), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-brand-100 text-brand-900 hover:bg-brand-200"
                        )}
                      >
                        {med.lastTaken && format(parseISO(med.lastTaken), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          ? <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Taken</span>
                          : "Mark as Taken"
                        }
                      </button>
                      <button 
                        onClick={() => handleDeleteMed(med.id)}
                        className="p-2 text-brand-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {trip && (
                    <div className="mt-4 pt-4 border-t border-brand-50 flex items-center justify-between">
                      <button 
                        onClick={() => fetchAdvice(med.name)}
                        disabled={loadingAdvice === med.name}
                        className="text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-600 flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> 
                        {loadingAdvice === med.name ? 'Checking...' : 'Travel Safety Check'}
                      </button>
                      {advice[med.name] && (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <Info className="w-3 h-3" /> Advice Ready
                        </span>
                      )}
                    </div>
                  )}

                  <AnimatePresence>
                    {advice[med.name] && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-brand-50 rounded-2xl text-sm space-y-3">
                          <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Legality:</span> {advice[med.name].legality}
                            </div>
                          </div>
                          <div>
                            <span className="font-bold block mb-1">Requirements:</span>
                            <ul className="list-disc list-inside text-brand-600 space-y-1">
                              {advice[med.name].requirements.map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Travel & Tools */}
        <div className="lg:col-span-5 space-y-8">
          {/* Travel Planner Card */}
          <section className="bg-brand-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
                {!trip && (
                  <button 
                    onClick={() => setIsPlanningTrip(true)}
                    className="px-4 py-2 bg-white text-brand-950 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors"
                  >
                    Plan Trip
                  </button>
                )}
              </div>

              {trip ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-serif font-bold mb-1">{trip.destination}</h2>
                    <p className="text-brand-300 text-sm">
                      {format(parseISO(trip.startDate), 'MMM d')} — {format(parseISO(trip.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {timeZoneInfo && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-brand-400 mb-1">Home Time</div>
                        <div className="text-xl font-mono">{timeZoneInfo.homeTime}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-brand-400 mb-1">Local Time</div>
                        <div className="text-xl font-mono">{timeZoneInfo.destTime}</div>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-brand-300">
                        <Clock className="w-3 h-3" />
                        {timeZoneInfo.offsetHours > 0 ? `+${timeZoneInfo.offsetHours}` : timeZoneInfo.offsetHours} hours difference
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setTrip(null);
                      setAdvice({});
                    }}
                    className="w-full py-3 border border-white/20 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    End Trip
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <h2 className="text-2xl font-serif font-bold mb-2">No active trip</h2>
                  <p className="text-brand-300 text-sm leading-relaxed">
                    Plan your next journey to get medication legality checks and time zone adjustment advice.
                  </p>
                </div>
              )}
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
          </section>

          {/* Time Zone Helper */}
          {trip && timeZoneInfo && (
            <section className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-sm">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" /> Time Zone Sync
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-brand-600 leading-relaxed">
                  To maintain your biological rhythm, we suggest taking your medications based on your home time zone for the first 48 hours.
                </p>
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                  <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">Next Suggested Dose</div>
                  {medications.length > 0 ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold">{medications[0].name}</div>
                        <div className="text-sm text-brand-500">Scheduled for {medications[0].time} (Home)</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-brand-950">
                          {formatInTimeZone(
                            parseISO(`${format(new Date(), 'yyyy-MM-dd')}T${medications[0].time}:00`),
                            trip.destinationTimeZone,
                            'HH:mm'
                          )}
                        </div>
                        <div className="text-[10px] text-brand-400 uppercase">Local Time</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-brand-400">Add medications to see schedule.</div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* General Travel Tips */}
          {trip && (
            <section className="bg-brand-100/50 p-6 rounded-[2rem] border border-brand-200">
              <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-600" /> Destination Intelligence
              </h3>
              {loadingTips ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-brand-200 rounded w-3/4"></div>
                  <div className="h-4 bg-brand-200 rounded w-full"></div>
                  <div className="h-4 bg-brand-200 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="prose prose-sm text-brand-700 leading-relaxed">
                  <ReactMarkdown>{generalTips}</ReactMarkdown>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingMed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-30">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMed(false)}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold mb-6">Add Medication</h2>
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Name</label>
                  <input 
                    autoFocus
                    required
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                    placeholder="e.g., Metformin"
                    value={newMed.name || ''}
                    onChange={e => setNewMed({...newMed, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Dosage</label>
                    <input 
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      placeholder="e.g., 500mg"
                      value={newMed.dosage || ''}
                      onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Time</label>
                    <input 
                      type="time"
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      value={newMed.time || '08:00'}
                      onChange={e => setNewMed({...newMed, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Frequency</label>
                  <select 
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                    value={newMed.frequency}
                    onChange={e => setNewMed({...newMed, frequency: e.target.value as any})}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as-needed">As Needed</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingMed(false)}
                    className="flex-1 py-3 border border-brand-200 rounded-xl font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isPlanningTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanningTrip(false)}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold mb-6">Plan Your Trip</h2>
              <form onSubmit={handlePlanTrip} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Destination</label>
                  <input 
                    autoFocus
                    required
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                    placeholder="e.g., Tokyo, Japan"
                    value={newTrip.destination || ''}
                    onChange={e => setNewTrip({...newTrip, destination: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Start Date</label>
                    <input 
                      type="date"
                      required
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      value={newTrip.startDate || ''}
                      onChange={e => setNewTrip({...newTrip, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">End Date</label>
                    <input 
                      type="date"
                      required
                      className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                      value={newTrip.endDate || ''}
                      onChange={e => setNewTrip({...newTrip, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">Destination Time Zone</label>
                  <select 
                    className="w-full p-3 bg-brand-50 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-950/10"
                    value={newTrip.destinationTimeZone}
                    onChange={e => setNewTrip({...newTrip, destinationTimeZone: e.target.value})}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsPlanningTrip(false)}
                    className="flex-1 py-3 border border-brand-200 rounded-xl font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors"
                  >
                    Start Journey
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-6 left-6 right-6 bg-brand-950 text-white p-4 rounded-full shadow-2xl flex justify-around items-center md:hidden z-40">
        <button className="p-2"><Pill className="w-6 h-6" /></button>
        <button className="p-2"><Plane className="w-6 h-6" /></button>
        <button className="p-2"><ShieldCheck className="w-6 h-6" /></button>
      </nav>
    </div>
    <Footer/>
    </>
  );
}
