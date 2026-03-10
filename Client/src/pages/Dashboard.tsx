/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Globe, 
  ShieldCheck, 
  Star,
  Clock,
  ChevronRight,
  Info,
  CheckCircle2,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VolunteerSite, SiteAdvice } from '../types';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MOCK_SITES: VolunteerSite[] = [
  {
    id: '1',
    name: 'Green Earth Initiative',
    location: 'Nairobi, Kenya',
    cause: 'Environment',
    description: 'Reforestation and urban gardening projects to combat climate change.',
    impactScore: 94,
    image: 'https://picsum.photos/seed/forest/800/600',
    distance: '2.4 km'
  },
  {
    id: '2',
    name: 'Code for Kids',
    location: 'Remote / Nairobi',
    cause: 'Education',
    description: 'Teaching basic programming to underprivileged youth in community centers.',
    impactScore: 88,
    image: 'https://picsum.photos/seed/code/800/600',
    distance: '5.1 km'
  },
  {
    id: '3',
    name: 'Paws & Claws Shelter',
    location: 'Karen, Nairobi',
    cause: 'Animal Welfare',
    description: 'Caring for rescued animals and managing adoption events.',
    impactScore: 91,
    image: 'https://picsum.photos/seed/animal/800/600',
    distance: '3.8 km'
  }
];

type Poi = { key: string, location: google.maps.LatLngLiteral, name: string, cause: string, capacity: number, current: number, impactScore: number };

const locations: Poi[] = [
  { key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108 }, name: 'Sydney Opera House Volunteers', cause: 'Arts', capacity: 50, current: 32, impactScore: 95 },
  { key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 }, name: 'Taronga Zoo Wildlife Care', cause: 'Animal Welfare', capacity: 30, current: 28, impactScore: 98 },
  { key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 }, name: 'Manly Beach Cleanup', cause: 'Environment', capacity: 100, current: 45, impactScore: 92 },
  { key: 'hyderPark', location: { lat: -33.8690081, lng: 151.2052393 }, name: 'Hyde Park Gardeners', cause: 'Environment', capacity: 20, current: 12, impactScore: 88 },
  { key: 'theRocks', location: { lat: -33.8587568, lng: 151.2058246 }, name: 'The Rocks Heritage Guides', cause: 'Education', capacity: 15, current: 8, impactScore: 90 },
  { key: 'circularQuay', location: { lat: -33.858761, lng: 151.2055688 }, name: 'Circular Quay Info Point', cause: 'Community', capacity: 10, current: 9, impactScore: 85 },
  { key: 'harbourBridge', location: { lat: -33.852228, lng: 151.2038374 }, name: 'Bridge Climb Support', cause: 'Arts', capacity: 25, current: 15, impactScore: 87 },
  { key: 'kingsCross', location: { lat: -33.8737375, lng: 151.222569 }, name: 'Kings Cross Community Kitchen', cause: 'Health', capacity: 40, current: 38, impactScore: 96 },
  { key: 'botanicGardens', location: { lat: -33.864167, lng: 151.216387 }, name: 'Royal Botanic Gardens Help', cause: 'Environment', capacity: 35, current: 20, impactScore: 93 },
  { key: 'museumOfSydney', location: { lat: -33.8636005, lng: 151.2092542 }, name: 'Museum of Sydney Docents', cause: 'Education', capacity: 12, current: 5, impactScore: 89 },
  { key: 'maritimeMuseum', location: { lat: -33.869395, lng: 151.198648 }, name: 'Maritime Museum Crew', cause: 'Arts', capacity: 20, current: 18, impactScore: 91 },
  { key: 'kingStreetWharf', location: { lat: -33.8665445, lng: 151.1989808 }, name: 'King St Wharf Ambassadors', cause: 'Community', capacity: 8, current: 4, impactScore: 82 },
  { key: 'aquarium', location: { lat: -33.869627, lng: 151.202146 }, name: 'Sea Life Aquarium Guides', cause: 'Animal Welfare', capacity: 25, current: 22, impactScore: 94 },
  { key: 'darlingHarbour', location: { lat: -33.87488, lng: 151.1987113 }, name: 'Darling Harbour Events', cause: 'Community', capacity: 60, current: 55, impactScore: 97 },
  { key: 'barangaroo', location: { lat: -33.8605523, lng: 151.1972205 }, name: 'Barangaroo Reserve Rangers', cause: 'Environment', capacity: 15, current: 10, impactScore: 92 },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'volunteer' | 'host'>('volunteer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<VolunteerSite | null>(null);
  const [siteAdvice, setSiteAdvice] = useState<SiteAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [myImpact, setMyImpact] = useState({ hours: 12, sites: 3, points: 450 });
  const navigate = useNavigate();

  const filteredSites = useMemo(() => {
    return MOCK_SITES.filter(site => 
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.cause.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectSite = async (site: VolunteerSite) => {
    setSelectedSite(site);
    setLoadingAdvice(true);
    setLoadingAdvice(false);
  };

  const handleSelectPoi = (poi: Poi) => {
    setSearchQuery(poi.name);
    setShowDropdown(false);
  };
  
  const handleSignUp = () => {
    navigate("/signup");
  }

    const filteredPois = useMemo(() => {
      if (!searchQuery) return [];
      return locations.filter(poi => 
        poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poi.cause.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [searchQuery]);

  return (
    <div className="min-h-screen bg-brand-50 text-brand-950 font-sans selection:bg-brand-200">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Uber Style Split */}
      <section className="pt-16 min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Volunteer */}
        <div className={cn(
          "relative flex flex-col justify-center p-12 lg:p-24 transition-all duration-700",
          activeTab === 'volunteer' ? "bg-brand-100 lg:bg-brand-100" : "bg-brand-50"
        )}>
          <div className="max-w-xl">
            <h2 className="text-6xl font-serif font-bold leading-tight mb-6">
              Find a site to <span className="serif-italic">serve</span>.
            </h2>
            <p className="text-xl text-brand-600 mb-8 leading-relaxed">
              Connect with local organizations that need your skills. Just like hailing a ride, find your next mission in minutes.
            </p>
            
            <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2 border border-brand-200">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-brand-400" />
                <input 
                  type="text" 
                  placeholder="Enter cause or location..." 
                  className="w-full py-3 bg-transparent outline-none text-lg"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
              <button className="bg-brand-950 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-800 transition-all">
                Search
              </button>
            </div>
            <AnimatePresence>
            {showDropdown && filteredPois.length > 0 && (
                <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className=" top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-brand-100 z-[60] overflow-hidden max-h-64 overflow-y-auto"
                >
                {filteredPois.map(poi => (
                    <button
                    key={poi.key}
                    onClick={() => handleSelectPoi(poi)}
                    className="w-full p-4 text-left hover:bg-brand-50 flex items-center gap-3 transition-colors border-b border-brand-50 last:border-0"
                    >
                    <div className="p-2 bg-brand-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-brand-950">{poi.name}</div>
                        <div className="text-xs text-brand-400 uppercase tracking-widest">{poi.cause}</div>
                    </div>
                    </button>
                ))}
                </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Host */}
        <div className={cn(
          "relative flex flex-col justify-center p-12 lg:p-24 transition-all duration-700",
          activeTab === 'host' ? "bg-brand-950 text-white" : "bg-brand-900 text-brand-100"
        )}>
          <div className="max-w-xl">
            <h2 className="text-6xl font-serif font-bold leading-tight mb-6">
              List your <span className="serif-italic">site</span>.
            </h2>
            <p className="text-xl opacity-80 mb-8 leading-relaxed">
              Are you an organization looking for passionate volunteers? Reach thousands of helpers ready to make an impact.
            </p>
            <button className="bg-white text-brand-950 px-10 py-5 rounded-xl font-bold text-lg hover:bg-brand-100 transition-all flex items-center gap-3 group">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Site List */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-400 mb-2">Nearby Opportunities</h3>
                  <h2 className="text-4xl font-serif font-bold">Recommended for you</h2>
                </div>
                <div className="flex gap-2">
                  {['All', 'Environment', 'Education', 'Health'].map(filter => (
                    <button key={filter} className="px-4 py-2 rounded-full border border-brand-200 text-sm font-medium hover:bg-brand-100 transition-colors">
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSites.map(site => (
                  <motion.div 
                    layoutId={site.id}
                    key={site.id}
                    onClick={() => handleSelectSite(site)}
                    className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-brand-100 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={site.image} 
                        alt={site.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {site.impactScore}% Impact
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">{site.cause}</span>
                        <span className="text-[10px] font-bold text-brand-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {site.distance}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold mb-2 group-hover:text-brand-600 transition-colors">{site.name}</h4>
                      <p className="text-sm text-brand-500 line-clamp-2">{site.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: User Impact & AI Advice */}
          <div className="lg:col-span-4 space-y-8">
            {/* Impact Dashboard */}
            <section className="bg-brand-950 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold mb-6">Your Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-brand-400 mb-1">Hours Served</div>
                    <div className="text-3xl font-serif font-bold">{myImpact.hours}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-[10px] uppercase tracking-widest text-brand-400 mb-1">Sites Visited</div>
                    <div className="text-3xl font-serif font-bold">{myImpact.sites}</div>
                  </div>
                </div>
                <button className="w-full mt-6 py-4 bg-white text-brand-950 rounded-xl font-bold text-sm hover:bg-brand-100 transition-colors">
                  View Full History
                </button>
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
            </section>

            {/* AI Site Intelligence */}
            <AnimatePresence mode="wait">
              {selectedSite ? (
                <motion.section 
                  key="site-advice"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-brand-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-serif font-bold">Site Intelligence</h3>
                    <button onClick={() => setSelectedSite(null)} className="text-brand-300 hover:text-brand-950">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-brand-950 mb-1">{selectedSite.name}</h4>
                      <p className="text-xs text-brand-400 uppercase tracking-widest">{selectedSite.cause} Specialist</p>
                    </div>

                    {loadingAdvice ? (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-brand-50 rounded w-3/4"></div>
                        <div className="h-20 bg-brand-50 rounded w-full"></div>
                        <div className="h-4 bg-brand-50 rounded w-5/6"></div>
                      </div>
                    ) : siteAdvice && (
                      <div className="space-y-6 text-sm">
                        <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100">
                          <div className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-brand-600 shrink-0" />
                            <div>
                              <span className="font-bold block mb-1">Preparation</span>
                              <p className="text-brand-600 leading-relaxed">{siteAdvice.preparation}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="font-bold block mb-2 flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-brand-400" /> What to Bring
                          </span>
                          <ul className="grid grid-cols-2 gap-2">
                            {siteAdvice.whatToBring.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-brand-500 text-xs">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-brand-50">
                          <p className="serif-italic text-brand-600 leading-relaxed">
                            "{siteAdvice.impactSummary}"
                          </p>
                        </div>
                        
                        <button className="w-full py-4 bg-brand-950 text-white rounded-xl font-bold hover:bg-brand-800 transition-colors flex items-center justify-center gap-2">
                          Book Shift <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.section>
              ) : (
                <motion.section 
                  key="empty-advice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-brand-100/50 p-8 rounded-[2.5rem] border border-dashed border-brand-200 text-center"
                >
                  <Info className="w-12 h-12 text-brand-200 mx-auto mb-4" />
                  <h3 className="text-lg font-serif font-bold text-brand-400 mb-2">Select a site</h3>
                  <p className="text-sm text-brand-400">Select an opportunity to see AI-powered preparation advice and impact summaries.</p>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
