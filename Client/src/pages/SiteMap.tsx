import React, { useState, useMemo } from 'react';
import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Search, MapPin, Users, Star, ArrowLeft, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Navigate, useNavigate } from 'react-router-dom';

type Poi = { key: string, location: google.maps.LatLngLiteral, name: string, cause: string, capacity: number, current: number, impactScore: number };

const locations: Poi[] = [
  { key: 'operaHouse', location: { lat: -1.3012375801102751,  lng: 36.97880585878275 }, name: "Alice Children's Home Utawala Volunteers", cause: 'Arts', capacity: 50, current: 32, impactScore: 95 },
  { key: 'tarongaZoo', location: { lat: -1.2873728295381877, lng: 36.893859632980664 }, name: 'Baby Blessing Children’s Home Umoja', cause: 'Animal Welfare', capacity: 30, current: 28, impactScore: 98 },
  { key: 'manlyBeach', location: { lat: -1.209201349185106, lng: 36.898414969228945 }, name: 'Brook School For the Deaf & Autistic', cause: 'Environment', capacity: 100, current: 45, impactScore: 92 },
  { key: 'hyderPark', location: { lat:-1.2629099281992866, lng:36.9208903022985 }, name: 'Baraka Children’s Home Kahawa West', cause: 'Environment', capacity: 20, current: 12, impactScore: 88 },
  { key: 'theRocks', location: { lat: -1.2442610882890712, lng:36.884846553887904 }, name: 'Babadogo Health Centre', cause: 'Education', capacity: 15, current: 8, impactScore: 90 },
  { key: 'circularQuay', location: { lat: -1.208413392973839, lng: 36.89159716738197 }, name: 'Bishop Opera Luigi Zimmerman', cause: 'Community', capacity: 10, current: 9, impactScore: 85 },
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
/**
1. Alice Children’s Home Utawala next to Chief’s camp (2std)
2. Baby Blessing Children’s Home Umoja Tena Estate (Hands Only) (2std)
3. Brook School For the Deaf & Autistic Kamiti Road 9 (7stds)
4. Baraka Children’s Home Kahawa West (Hands on only) (3stds)
5. Baraka Al Ibrahim Children`s Center Kibera (Karanja Road) (2stds)
6. Babadogo Health Centre Babadogo/Ruraka(Hands on only)(3stds)
7. Bishop Opera Luigi Zimmerman (15stds)
8. Cerebral Palsy Society of Kenya Donholm (Hands on Only) (2stds)
9. Cottolengo centre Karen 0706397095 (Hands on Only) (2stds)
10. Child Rescue (Uzima Wa Watoto) Bahati, Makadara (Hands On only) (2stds)
11. Christ Chapel Children`s Home Huruma (3stds)
12. Community Progressive Focus centre Embakasi Area 0722332738 (Hands on only) (4stds)
13. Dream Centre: Baby Rescue and Care(Home Of Hope) Donholm Phase 8,Police Line (Hands on only)
14. Dorothy Children`s Home Thome/Marurui Area (Hands on only) (10 stds)
15. First Love Kenya Karen (2stds)
16. Happy Life Children`s Home Roysambu (Hands on only) (10 stds)
 */

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
          <Pin background={'#141414'} glyphColor={'#fff'} borderColor={'#fff'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default SiteMap;
