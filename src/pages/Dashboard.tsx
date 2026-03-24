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
{ key: "alice_home_utawala", location: { lat: -1.3012375801102751, lng: 36.97880585878275 }, name: "Alice Children's Home Utawala Volunteers", cause: "Arts", capacity: 50, current: 32, impactScore: 95 },
{ key: "baby_blessing_umoja", location: { lat: -1.2873728295381877, lng: 36.893859632980664 }, name: "Baby Blessing Children’s Home Umoja", cause: "Animal Welfare", capacity: 30, current: 30, impactScore: 98 },
{ key: "mama_fatma_home", location: { lat: -1.209201349185106, lng: 36.898414969228945 }, name: "Mama Fatma Goodwill Childrens Home", cause: "Environment", capacity: 45, current: 45, impactScore: 92 },
{ key: "baraka_home_kahawa_west", location: { lat: -1.2629099281992866, lng: 36.9208903022985 }, name: "Baraka Children’s Home Kahawa West", cause: "Environment", capacity: 20, current: 12, impactScore: 88 },
{ key: "babadogo_health_centre", location: { lat: -1.2442610882890712, lng: 36.884846553887904 }, name: "Babadogo Health Centre", cause: "Education", capacity: 8, current: 8, impactScore: 90 },
{ key: "bishop_luigi_zimmerman", location: { lat: -1.208413392973839, lng: 36.89159716738197 }, name: "Bishop Opera Luigi Zimmerman", cause: "Community", capacity: 10, current: 9, impactScore: 85 },
{ key: "cerebral_palsy_donholm", location: { lat: -1.2982490127116522, lng: 36.892197071050106 }, name: "Cerebral Palsy Society of Kenya Donholm", cause: "Arts", capacity: 25, current: 15, impactScore: 87 },
{ key: "cottolengo_centre_karen", location: { lat: -1.3394082805578793, lng: 36.72763829943795 }, name: "Cottolengo Center", cause: "Health", capacity: 40, current: 38, impactScore: 96 },
{ key: "karura_health_centre", location: { lat: -1.2561360998348625, lng: 36.84309555397505 }, name: "Karura Health Centre", cause: "Environment", capacity: 35, current: 20, impactScore: 93 },
{ key: "christ_chapel_home", location: { lat: -1.2590043787909624, lng: 36.87634262088299 }, name: "Christ Chapel Children`s Home", cause: "Education", capacity: 12, current: 5, impactScore: 89 },
{ key: "kahawa_west_health", location: { lat: -1.190159000972583, lng: 36.91430419943684 }, name: "Kahawa West Health Centre", cause: "Arts", capacity: 20, current: 18, impactScore: 91 },
{ key: "community_progressive_focus", location: { lat: -1.2516616096928943, lng: 36.94328748096306 }, name: "Community Progressive Focus Centre", cause: "Community", capacity: 8, current: 4, impactScore: 82 },
{ key: "dorothy_home_thome", location: { lat: -1.203956234105944, lng: 36.877991753887706 }, name: "Dorothy Children`s Home Thome", cause: "Animal Welfare", capacity: 25, current: 22, impactScore: 94 },
{ key: "first_love_karen", location: { lat: -1.3293579537441624, lng: 36.747473480963556 }, name: "First Love Kenya Karen", cause: "Community", capacity: 60, current: 55, impactScore: 97 },
{ key: "happy_life_roysambu", location: { lat: -1.2157114760334924, lng: 36.88620579445689 }, name: "Happy Life Children`s Home Roysambu", cause: "Environment", capacity: 15, current: 10, impactScore: 92 },
{ key: "al_tawoon_youth_korogocho", location:{lat: -1.2513779803302305, lng: 36.89112782644024}, name:"Al-Tawoon Islamic Youth Group", cause:"Community", capacity:30, current:10, impactScore:85 },
{ key: "ananda_marga_academy_huruma", location:{lat: -1.2722937796570462, lng: 36.75420329630453}, name:"Ananda Marga Academy Huruma", cause:"Education", capacity:20, current:10, impactScore:88 },
{ key: "brook_school_deaf_kamiti", location:{lat: -1.209222802074535, lng: 36.89838278096287}, name:"Brook School for the Deaf & Autistic Kamiti Road", cause:"Education", capacity:15, current:6, impactScore:95 },
{ key: "baraka_al_ibrahim_kibera", location:{lat:-1.3146827159107064, lng: 36.78502003196789}, name:"Baraka Za Ibrahim Children’s Center Kibera", cause:"Community", capacity:10, current:6, impactScore:87 },
{ key: "cherish_watoto_learning_centre", location:{lat: -1.2722937796570462, lng: 36.75420329630453}, name:"Cherish Watoto Kenya Learning Centre", cause:"Education", capacity:45, current:22, impactScore:90 },
{ key: "christs_victory_center_githurai", location:{lat: -1.2090619285117354, lng: 36.93263339445683}, name:"Christ's Victory Center Kimbo Githurai", cause:"Community", capacity:55, current:34, impactScore:85 },
{ key: "community_progressive_focus_embakasi", location:{lat: -1.2515114418261875, lng: 36.94321237911563}, name:"Community Progressive Focus Centre", cause:"Community", capacity:22, current:14, impactScore:82 },
{ key: "dream_centre_home_of_hope", location:{lat: -1.2920849319075773, lng: 36.90275044691993}, name:"Dream Centre Baby Rescue and Care", cause:"Children", capacity:35, current:16, impactScore:93 },
{ key: "dagoretti_hidden_talent", location:{lat: -1.2977493935733377, lng: 36.74987346359377}, name:"Dagoretti Corner Child Care Program", cause:"Education", capacity:25, current:18, impactScore:88 },
{ key: "grapes_yard_korogocho", location:{lat: -1.2724653963437262, lng: 36.95769633678646}, name:"Grapes Yard Organization Korogocho", cause:"Community", capacity:35, current:19, impactScore:86 },
{ key: "hope_house_babies_home", location:{lat: -1.2680080366096689, lng: 36.73831219441074}, name:"Hope House Babies Home", cause:"Children", capacity:30, current:17, impactScore:93 },
{ key: "imani_children_home_kayole", location:{lat: -1.2604358211371354, lng: 36.924826530436654}, name:"Imani Children’s Home Kayole", cause:"Children", capacity:15, current:7, impactScore:89 },
{ key: "nest_children_home_runda", location:{lat: -1.0926009045437686, lng: 36.659452192343146}, name:"The Nest Children’s Home Runda", cause:"Children", capacity:45, current:23, impactScore:95 },
{ key: "salvation_army_kabete_home", location:{lat: -1.2658928005890093, lng: 36.76512602144511}, name:"Salvation Army Kabete Children’s Home", cause:"Children", capacity:20, current:13, impactScore:90 },
{ key: "jirani_education_centre_korogocho", location:{lat: -1.2457493990385187, lng: 36.89719539630452}, name:"Jirani Education Centre Korogocho", cause:"Education", capacity:45, current:22, impactScore:88 },
{ key: "kabete_rehabilitation_center", location:{lat: -1.238707655841928, lng: 36.731315995742285}, name:"Kabete Rehabilitation Center", cause:"Health", capacity:67, current:32, impactScore:90 },
{ key: "kangemi_health_centre", location:{lat: -1.2668917958173946, lng: 36.74922202329258}, name:"Kangemi Health Centre", cause:"Health", capacity:45, current:15, impactScore:88 },
{ key: "kirigiti_girls_rehabilitation", location:{lat: -1.172165060639376, lng: 36.84723442329194}, name:"Kirigiti Girls Rehabilitation Center", cause:"Community", capacity:18, current:8, impactScore:89 },
{ key: "kwetu_home_of_peace_madaraka", location:{lat:-1.3088951779477365, lng: 36.811234594457446}, name:"Kwetu Home of Peace Madaraka", cause:"Children", capacity:25, current:9, impactScore:91 },
{ key: "kenya_women_children_wellness", location:{lat: -1.2060034637613832, lng: 36.88240586562139}, name:"Kenya Women and Children’s Wellness Centre", cause:"Health", capacity:35, current:19, impactScore:92 },
{ key: "lower_kabete_dispensary", location:{lat: -1.2395503733507862, lng: 36.7459213147937}, name:"Lower Kabete Dispensary", cause:"Health", capacity:30, current:19, impactScore:88 },
{ key: "mama_fatuma_children_home", location:{lat: -1.2670090268875722, lng: 36.8478446656218}, name:"Mama Fatuma Children’s Home", cause:"Children", capacity:25, current:18, impactScore:90 },
{ key: "mama_fauzia_children_home", location:{lat: -1.2188175649670852, lng: 36.9142986521276}, name:"Mama Fauzia Children’s Home", cause:"Children", capacity:30, current:10, impactScore:89 },
{ key: "mary_immaculate_rehab_center", location:{lat: -1.2111683517878724, lng: 36.896075560349615}, name:"Mary Immaculate Rehab Center", cause:"Health", capacity:40, current:20, impactScore:90 },
{ key: "mary_immaculate_clinic", location:{lat: -1.3085331795041535, lng: 36.83896932549031}, name:"Mary Immaculate Clinic", cause:"Health", capacity:10, current:0, impactScore:88 },
{ key: "mathare_north_health_centre", location:{lat: -1.2558957998163633, lng: 36.865562436786426}, name:"Mathare North Health Centre", cause:"Health", capacity:25, current:18, impactScore:87 },
{ key: "mji_wa_huruma_runda", location:{lat: -1.2250776447083183, lng: 36.827504465621494}, name:"Mji-Wa-Huruma Dispensary Runda", cause:"Health", capacity:15, current:8, impactScore:89 },
{ key: "msamaria_mwema_children_home", location:{lat: -1.22593797237105, lng: 36.72899601349304}, name:"Msamaria Mwema Children Home", cause:"Children", capacity:18, current:10, impactScore:90 },
{ key: "nairobi_children_home", location:{lat: -1.239138325062625, lng: 36.7336275852492}, name:"Nairobi Children’s Home", cause:"Children", capacity:20, current:18, impactScore:95 },
{ key: "new_life_home_trust_lenana", location:{lat: -1.2886887456467833, lng: 36.78782033678651}, name:"New Life Home Trust Lenana Road", cause:"Children", capacity:20, current:5, impactScore:94 },
{ key: "new_life_home_kibera", location:{lat: -1.305678780975741, lng: 36.782262459806425}, name:"New Life Home Kibera", cause:"Community", capacity:22, current:15, impactScore:90 },
{ key: "ngara_health_centre", location:{lat: -1.273074163017246, lng: 36.83150480795122}, name:"Ngara Health Centre", cause:"Health", capacity:25, current:17, impactScore:88 },
{ key: "nyumba_ya_wazee_kasarani", location:{lat:-1.2304624506008681, lng: 36.88736185212755 }, name:"Nyumba ya Wazee Kasarani", cause:"Community", capacity:15, current:10, impactScore:89 },
{ key: "our_lady_of_guadalupe_kamiti", location:{lat: -1.300888203342576, lng: 36.77918826562205}, name:"Our Lady of Guadalupe Parish Adams", cause:"Community", capacity:20, current:11, impactScore:87 },
{ key: "rehema_pefa_home", location:{lat: -1.232884356170069, lng: 36.86738579445699}, name:"Rehema Pefa Home", cause:"Children", capacity:18, current:6, impactScore:90 },
{ key: "st_scholastica_uzima_hospital", location:{lat: -1.2536117733736407, lng: 36.85664315212764}, name:"St. Scholastica Uzima Hospital", cause:"Health", capacity:20, current:8, impactScore:91 },
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
            <button
              onClick={() => navigate("/registersite")}
              className="bg-white text-brand-950 px-10 py-5 rounded-xl font-bold text-lg hover:bg-brand-100 transition-all flex items-center gap-3 group">
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
