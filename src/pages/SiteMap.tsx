import { useState, useMemo, useEffect } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Search, MapPin, Users, Star, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export type Poi = { key: string, location: google.maps.LatLngLiteral, name: string, cause: string, capacity: number, current: number, impactScore: number };

interface SiteMapProps {
  onBack: () => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: -1.227571545396187, lng: 36.888712784552965 });
  const [selectedSite, setSelectedSite] = useState<Poi | null>(null);
  const [locations, setLocations] = useState<Poi[]>([]);

  useEffect(() => {
    const q = query(collection(firestore, 'locations'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => {
        const data = doc.data();
        return {
          key: doc.id,
          location: data.location || { lat: -1.251, lng: 36.891 },
          name: data.name || 'Unnamed Site',
          cause: data.cause || 'Community',
          capacity: data.capacity || 0,
          current: data.current || 0,
          impactScore: data.impactScore || 0
        } as Poi;
      });
      setLocations(fetched);
    });
    return () => unsub();
  }, []);

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
    setSelectedSite(poi);
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
                    setSelectedSite(null);
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
                        <PoiMarkers pois={selectedSite ? [selectedSite] : locations} />
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
                    {(selectedSite ? [selectedSite] : (searchQuery ? filteredPois : locations)).map(poi => (
                        <div 
                        key={poi.key}
                        className="p-6 rounded-2xl border border-brand-100 hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => navigate(`/site/${poi.key}`)}
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
