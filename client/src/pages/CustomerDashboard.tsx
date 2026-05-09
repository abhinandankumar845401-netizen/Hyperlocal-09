import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ShieldCheck, Package, Star, Clock, TrendingUp,
  MapPin, LogOut, Bell, Search, ChevronRight, Zap, Bot,
  RefreshCw, AlertCircle, Filter, Loader2, X, CheckCircle2, CreditCard,
  Map as MapIcon, Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import TrustBot from '@/components/TrustBot';
import api from '@/lib/api';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const INVENTORY: Record<string, { name: string; price: number }[]> = {
  Grocery: [
    { name: 'Organic Milk 1L', price: 65 },
    { name: 'Brown Bread', price: 45 },
    { name: 'Basmati Rice 5kg', price: 450 },
    { name: 'Farm Fresh Eggs (12)', price: 90 },
  ],
  Pharmacy: [
    { name: 'Paracetamol 500mg', price: 25 },
    { name: 'Vitamin C Strips', price: 120 },
    { name: 'Hand Sanitizer 200ml', price: 95 },
    { name: 'Digital Thermometer', price: 299 },
  ],
  Repairs: [
    { name: 'Oil Change Service', price: 899 },
    { name: 'Brake Pad Replacement', price: 1450 },
    { name: 'Engine Diagnostics', price: 500 },
    { name: 'AC Cleaning', price: 750 },
  ],
  Default: [
    { name: 'Standard Service', price: 500 },
    { name: 'General Consultation', price: 200 },
    { name: 'Custom Order', price: 1000 },
  ]
};

interface Shop {
  _id: string;
  shopName: string;
  category: string;
  description?: string;
  trustScore: number;
  isVerified: boolean;
  deliveryRadius: number;
  isOpen: boolean;
  businessHours: string;
  address: {
    street: string;
    city: string;
    state: string;
    location: { coordinates: [number, number] };
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  Grocery: '🛒', Pharmacy: '💊', Electronics: '💻', Bakery: '🥐',
  Clothing: '👗', Repairs: '🔧', Food: '🍛', Books: '📚',
  'Pet Store': '🐾', Jewellery: '💍', 'Health & Fitness': '💪',
  'Home Decor': '🏠', Toys: '🧸', Automobile: '🚗', Dairy: '🥛',
  Printing: '🖨️', Flowers: '🌸', Laundry: '👔', Stationery: '✏️', Default: '🏪',
};

const CATEGORY_IMAGES: Record<string, string> = {
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  Pharmacy: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=400&q=80',
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80',
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  Clothing: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=400&q=80',
  Repairs: 'https://images.unsplash.com/photo-1487700160041-babef9c3cb55?auto=format&fit=crop&w=400&q=80',
  Food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  Default: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80',
};

const CATEGORIES = ['All', 'Grocery', 'Pharmacy', 'Electronics', 'Bakery', 'Food', 'Clothing', 'Repairs'];

// Component to handle map centering when coordinates change
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLat, setUserLat] = useState<number>(28.6139);
  const [userLng, setUserLng] = useState<number>(77.2090);
  const [locationLabel, setLocationLabel] = useState('Detecting location…');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success'>('idle');

  const fetchShops = useCallback(async (lat: number, lng: number) => {
    try {
      const { data } = await api.get(`/shops/nearby?lat=${lat}&lng=${lng}&radius=10`);
      setShops(data);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to fetch nearby shops.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);
          setLocationLabel('Current Location Active');
          fetchShops(lat, lng);
        },
        () => {
          setLocationLabel('Using Default (Delhi)');
          fetchShops(28.6139, 77.2090);
        }
      );
    } else {
      fetchShops(28.6139, 77.2090);
    }
  }, [fetchShops]);

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || shop.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFakePayment = () => {
    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
    }, 2000);
  };

  const resetPayment = () => {
    setPaymentState('idle');
    setSelectedShop(null);
  };

  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const shopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-[1001] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl auto px-4 h-16 flex items-center justify-between gap-4 mx-auto">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-6 h-6" />
            <span className="hidden sm:inline">TrustLocal</span>
          </div>

          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search groceries, medicine, repairs..."
              className="pl-10 bg-slate-100 dark:bg-slate-800 border-none rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 dark:text-slate-400">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-8">
        {/* Welcome & Location */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}! 👋</h2>
            <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{locationLabel}</span>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 px-2" onClick={() => window.location.reload()}>
                <RefreshCw className="w-3 h-3 mr-1" /> Change
              </Button>
            </div>
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-lg"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button 
              variant={viewMode === 'map' ? 'default' : 'ghost'} 
              size="sm" 
              className="rounded-lg"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="w-4 h-4 mr-2" /> Map View
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {CATEGORY_ICONS[cat] || '🏪'} {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Main Content Area */}
        {viewMode === 'grid' ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800" />
              ))
            ) : filteredShops.length > 0 ? (
              filteredShops.map((shop) => (
                <motion.div
                  key={shop._id}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card 
                    className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                    onClick={() => setSelectedShop(shop)}
                  >
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                      <img 
                        src={(shop as any).images?.[0] || CATEGORY_IMAGES[shop.category] || CATEGORY_IMAGES.Default} 
                        alt={shop.shopName}
                        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent z-0" />
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-xs font-bold shadow-sm z-10">
                        {CATEGORY_ICONS[shop.category] || '🏪'} {shop.category}
                      </div>
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-10 ${shop.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {shop.isOpen ? 'OPEN' : 'CLOSED'}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{shop.shopName}</h3>
                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {shop.trustScore}%
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                        {shop.description || `Verified local ${shop.category.toLowerCase()} merchant in ${shop.address.city}.`}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {shop.businessHours}
                        </div>
                        {shop.isVerified && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No shops found</h3>
                <p className="text-slate-500">Try a different category or location</p>
              </div>
            )}
          </section>
        ) : (
          <section className="h-[600px] relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 z-10">
            <MapContainer 
              center={[userLat, userLng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <ChangeView center={[userLat, userLng]} zoom={13} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={[userLat, userLng]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>

              {filteredShops.map(shop => (
                <Marker 
                  key={shop._id} 
                  position={[shop.address.location.coordinates[1], shop.address.location.coordinates[0]]}
                  icon={shopIcon}
                  eventHandlers={{
                    click: () => setSelectedShop(shop),
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <h4 className="font-bold">{shop.shopName}</h4>
                      <p className="text-xs">{shop.category}</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">Trust Score: {shop.trustScore}%</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </section>
        )}

        {/* Live Marketplace Info */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Live Marketplace Info
            </h3>
          </div>
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10 grid md:grid-cols-3 gap-8">
              <div className="text-center md:text-left">
                <div className="text-4xl font-extrabold mb-2">{shops.length}+</div>
                <div className="text-blue-100 text-sm">Verified Local Merchants</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl font-extrabold mb-2">100%</div>
                <div className="text-blue-100 text-sm">Real-time Trust Scoring</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl font-extrabold mb-2">Local</div>
                <div className="text-blue-100 text-sm">Delhi/NCR Marketplace active</div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>
        </section>
      </main>

      {/* Shop Details Modal */}
      <AnimatePresence>
        {selectedShop && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetPayment}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex items-end relative">
                <button 
                  onClick={resetPayment}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2">
                    {CATEGORY_ICONS[selectedShop.category] || '🏪'} {selectedShop.category}
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">{selectedShop.shopName}</h2>
                  <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selectedShop.address.street}, {selectedShop.address.city}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {paymentState === 'idle' ? (
                  <div className="space-y-8">
                    <div>
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Live Inventory & Pricing
                      </h4>
                      <div className="grid gap-3">
                        {(INVENTORY[selectedShop.category] || INVENTORY.Default).map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:border-blue-500 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-lg shadow-sm">
                                {selectedShop.category === 'Pharmacy' ? '💊' : '📦'}
                              </div>
                              <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-slate-500">In Stock • Fast Delivery</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-blue-600">₹{item.price}</p>
                              <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-wider font-bold">Add</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                          <Star className="w-6 h-6 text-yellow-500 fill-current" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{selectedShop.trustScore}% Trust Score</p>
                          <p className="text-sm text-slate-500">Based on 150+ verified transactions</p>
                        </div>
                      </div>
                      <ShieldCheck className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                ) : paymentState === 'processing' ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-blue-100 dark:border-slate-800 rounded-full" />
                      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
                      <CreditCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Processing Secure Payment</h3>
                      <p className="text-slate-500 mt-1">Verifying trust markers and securing your funds...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-green-600">Payment Successful!</h3>
                      <p className="text-slate-500 mt-1">Your order from **{selectedShop.shopName}** has been confirmed.</p>
                      <p className="text-xs text-slate-400 mt-4 italic font-medium">Redirecting to order tracking...</p>
                    </div>
                    <Button onClick={resetPayment} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">
                      View My Orders
                    </Button>
                  </div>
                )}
              </div>

              {paymentState === 'idle' && (
                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total Amount</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">₹1,120.00</p>
                  </div>
                  <Button onClick={handleFakePayment} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 group">
                    Pay Now <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TrustBot 
        userLocation={userLat && userLng ? { lat: userLat, lng: userLng } : undefined} 
        nearbyShops={filteredShops}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-blue-600 dark:text-blue-400 mb-6">
                <ShieldCheck className="w-8 h-8" />
                TrustLocal
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Empowering neighborhood economies through verified trust markers and AI-powered hyperlocal commerce.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">Nearby Shops</li>
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">My Orders</li>
                <li onClick={() => document.querySelector('.fixed.bottom-6.right-6')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} className="hover:text-blue-600 cursor-pointer">TrustBot AI</li>
                <li onClick={() => navigate('/auth')} className="hover:text-blue-600 cursor-pointer">Become a Seller</li>
              </ul>
            </div>
            <div className="text-left">
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">Help Center</li>
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">Safety & Trust</li>
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">Terms of Service</li>
                <li onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <p>© 2026 TrustLocal Technologies. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-600">Twitter</a>
              <a href="#" className="hover:text-blue-600">LinkedIn</a>
              <a href="#" className="hover:text-blue-600">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
