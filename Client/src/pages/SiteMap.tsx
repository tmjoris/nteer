import { useState, useMemo } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Users, Star, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

interface SiteMapProps {
  onBack: () => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.227571545396187, lng: 36.888712784552965 });

  const filteredPois = useMemo(() => {
    if (!searchQuery) return [];
    return locations.filter(poi => 
      poi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poi.cause.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectPoi = (poi: Poi) => {
    setMapCenter(poi.location);
    setSearchQuery(poi.name);
    setShowDropdown(false);
  };

  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/");
  }
   const handleSignUp = () => {
    navigate("/signup");
  }

  return (
    <div className="max-h-screen bg-brand-50 pt-10">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-brand-100 transition-colors text-brand-950"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                    <h1 className="text-3xl font-serif font-bold">Find Volunteer Sites</h1>
                    <p className="text-brand-500">Explore opportunities across Kenya</p>
                    </div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white p-2 rounded-2xl shadow-lg flex items-center gap-2 border border-brand-200">
                    <div className="flex-1 flex items-center gap-3 px-4">
                        <Search className="w-5 h-5 text-brand-400" />
                        <input 
                        type="text" 
                        placeholder="Search by site or cause..." 
                        className="w-full py-2 bg-transparent outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        />
                    </div>
                    </div>

                    <AnimatePresence>
                    {showDropdown && filteredPois.length > 0 && (
                        <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-brand-100 z-[60] overflow-hidden max-h-64 overflow-y-auto"
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

            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-200 bg-white">
                <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
                    <div className="relative h-[500px]">
                    <Map
                        style={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        defaultZoom={12}
                        mapId='DEMO_MAP_ID'
                        onCameraChanged={(ev: MapCameraChangedEvent) => 
                        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
                        }
                    >
                        <PoiMarkers pois={locations} />
                    </Map>
                    </div>
                </APIProvider>

                <div className="p-8 bg-white">
                    <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold">Active Sites</h2>
                    <div className="flex gap-2 text-xs font-bold text-brand-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Capacity</span>
                        <span className="flex items-center gap-1 ml-4"><Star className="w-3 h-3 text-yellow-500" /> Impact Score</span>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map(poi => (
                        <div 
                        key={poi.key}
                        className="p-6 rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => setMapCenter(poi.location)}
                        >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 px-2 py-1 bg-brand-50 rounded-full">
                            {poi.cause}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-brand-600">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {poi.impactScore}%
                            </div>
                        </div>
                        <h3 className="font-bold text-brand-950 mb-4 group-hover:text-brand-600 transition-colors">{poi.name}</h3>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                            <span className="text-brand-500 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Volunteers
                            </span>
                            <span className="font-bold">
                                {poi.current} <span className="text-brand-300 font-normal">/ {poi.capacity}</span>
                            </span>
                            </div>
                            <div className="w-full h-1.5 bg-brand-50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-brand-950 transition-all duration-1000" 
                                style={{ width: `${(poi.current / poi.capacity) * 100}%` }}
                            />
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
          </div>
        <Footer/>
    </div>
  );
};

const PoiMarkers = (props: { pois: Poi[] }) => {
  return (
    <>
      {props.pois.map((poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
        >
          <div className="relative flex h-6 w-6">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 
            ${ poi.current===poi.capacity? "bg-red-400": "bg-blue-400" }`}>
            </span>
          <span className={`relative inline-flex rounded-full h-6 w-6 shadow-lg  
            ${poi.current===poi.capacity ? "bg-red-700 shadow-red-500/50" : "bg-blue-700 shadow-blue-500/50"}`}>
          </span>
        </div>

        </AdvancedMarker>
      ))}
    </>
  );
};

export default SiteMap;
