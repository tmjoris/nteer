import { useState, useMemo } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Users, Star, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

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
           {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-brand-950 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-serif font-bold tracking-tight">Nteer</h1>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-300">
              <a href="/sites" className="hover:text-white transition-colors">Find Sites</a>
              <a href="#" className="hover:text-white transition-colors">List Your Site</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white text-brand-950 px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-100 transition-colors" onClick={handleSignUp}>
              Sign Up
            </button>
          </div>
        </div>
      </nav>
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
        {/* Footer */}
      <footer className="bg-brand-950 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif font-bold mb-6">Nteer</h2>
            <p className="text-brand-400 max-w-sm leading-relaxed">
              We believe in the power of human connection. Our mission is to make volunteering as easy as ordering a ride, empowering everyone to serve their community.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-brand-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-brand-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-500">
          <p>© 2026 Nteer Technologies Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">English (US)</a>
            <a href="#" className="hover:text-white transition-colors">Nairobi</a>
          </div>
        </div>
      </footer>
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
