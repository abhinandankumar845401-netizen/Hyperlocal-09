import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Package, TrendingUp, Bell, LogOut,
  Plus, AlertTriangle, Star, Clock, ChevronRight,
  BarChart3, Users, Zap, Settings, Bot, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '@/store/useAuthStore';
import TrustBot from '@/components/TrustBot';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MOCK_ORDERS = [
  { id: "ORD-2201", customer: "Rahul M.", items: 3, amount: 420, status: "pending", time: "5 min ago" },
  { id: "ORD-2200", customer: "Priya S.", items: 1, amount: 180, status: "preparing", time: "15 min ago" },
  { id: "ORD-2199", customer: "Amit K.", items: 5, amount: 890, status: "delivered", time: "1 hr ago" },
  { id: "ORD-2198", customer: "Sneha R.", items: 2, amount: 350, status: "delivered", time: "2 hr ago" },
];

const MOCK_PRODUCTS = [
  { name: "Organic Atta 5kg", stock: 12, price: 280, status: "ok" },
  { name: "Tata Salt 1kg", stock: 3, price: 28, status: "low" },
  { name: "Amul Butter 500g", stock: 0, price: 275, status: "out" },
  { name: "Basmati Rice 10kg", stock: 8, price: 650, status: "ok" },
  { name: "Sunflower Oil 1L", stock: 2, price: 145, status: "low" },
];

const statusColors: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const stockColors: Record<string, string> = {
  ok: "text-green-600 dark:text-green-400",
  low: "text-orange-500 dark:text-orange-400",
  out: "text-red-600 dark:text-red-400",
};

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', category: '' });
  const [activeTab, setActiveTab] = useState('Overview');
  const [location, setLocation] = useState<[number, number]>([28.6139, 77.2090]); // Default Delhi

  useState(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  });

  const shopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 z-40 hidden lg:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            TrustLocal
          </div>
          <p className="text-xs text-slate-500 mt-1">Seller Dashboard</p>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {[
            { label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
            { label: "Orders", icon: <Package className="w-4 h-4" /> },
            { label: "Inventory", icon: <Zap className="w-4 h-4" /> },
            { label: "Customers", icon: <Users className="w-4 h-4" /> },
            { label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
            { label: "TrustBot AI", icon: <Bot className="w-4 h-4" /> },
            { label: "Settings", icon: <Settings className="w-4 h-4" /> },
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.label ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Shopkeeper'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-slate-500 hover:text-red-500">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Seller Dashboard
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="lg:ml-64 p-6 space-y-6">
        {activeTab === 'Overview' && (
          <>
            {/* Trust Score Banner */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Your Shop Trust Score</p>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black text-green-400">92</span>
                    <span className="text-slate-400 text-xl mb-2">/100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+4 pts this week — Top 5% in your area</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
                    <div className="text-2xl font-bold text-green-400">₹28,400</div>
                    <div className="text-slate-400 text-xs mt-1">Today's Revenue</div>
                  </div>
                  <div className="text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
                    <div className="text-2xl font-bold">14</div>
                    <div className="text-slate-400 text-xs mt-1">Orders Today</div>
                  </div>
                  <div className="text-center bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-4">
                    <div className="text-2xl font-bold text-blue-400">4.8★</div>
                    <div className="text-slate-400 text-xs mt-1">Avg Rating</div>
                  </div>
                </div>
              </div>
            </motion.div>

        {/* Alerts */}
        {MOCK_PRODUCTS.filter(p => p.status !== 'ok').length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-2xl px-5 py-4 text-orange-700 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {MOCK_PRODUCTS.filter(p => p.status === 'out').length} item(s) out of stock & {MOCK_PRODUCTS.filter(p => p.status === 'low').length} item(s) running low.
              <button className="ml-2 underline">Restock now →</button>
            </span>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Orders */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Orders
              </h2>
              <Button size="sm" variant="ghost" className="text-blue-600 gap-1">All orders <ChevronRight className="w-4 h-4" /></Button>
            </div>
            <Card className="border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
              <CardContent className="p-0">
                {MOCK_ORDERS.map((order, i) => (
                  <div key={order.id} className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i < MOCK_ORDERS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{order.customer}</p>
                        <p className="text-xs text-slate-400">{order.id} • {order.items} items • {order.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>{order.status}</span>
                      <span className="font-bold text-sm">₹{order.amount}</span>
                      {order.status === 'pending' && (
                        <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-3">Accept</Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <div className="space-y-4">
            <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-br from-purple-600 to-blue-700 text-white">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { icon: <TrendingUp className="w-4 h-4 text-green-500" />, text: "Sales up 18% vs last week" },
                  { icon: <Clock className="w-4 h-4 text-blue-500" />, text: "Peak hours: 6PM–9PM today" },
                  { icon: <Star className="w-4 h-4 text-orange-500" />, text: "3 new 5-star reviews today" },
                  { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: "Amul Butter needs restocking" },
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex-shrink-0 mt-0.5">{insight.icon}</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{insight.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">This Month</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Revenue", value: "₹1.84L", color: "text-green-600" },
                  { label: "Orders Fulfilled", value: "312", color: "text-blue-600" },
                  { label: "Repeat Customers", value: "74%", color: "text-purple-600" },
                  { label: "On-time Delivery", value: "96%", color: "text-orange-600" },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">{stat.label}</span>
                    <span className={`font-bold text-sm ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shop Map Location */}
            <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden h-64">
              <CardHeader className="pb-2"><CardTitle className="text-base">Shop Location</CardTitle></CardHeader>
              <CardContent className="h-full p-0">
                <MapContainer center={location} zoom={14} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={location} icon={shopIcon}>
                    <Popup>Your shop is live here</Popup>
                  </Marker>
                </MapContainer>
              </CardContent>
            </Card>

          </div>
        </div>
        </>
        )}

        {/* Inventory */}
        {activeTab === 'Inventory' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Inventory</h2>
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={() => setShowAddProduct(!showAddProduct)}>
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>

          {showAddProduct && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <Card className="border-blue-200 dark:border-blue-800/50 shadow-sm mb-4">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-600" />Add New Product</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Product Name</Label>
                      <Input placeholder="e.g. Tata Salt 1kg" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Input placeholder="e.g. Staples" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Price (₹)</Label>
                      <Input type="number" placeholder="0" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Quantity</Label>
                      <Input type="number" placeholder="0" value={newProduct.quantity} onChange={e => setNewProduct(p => ({ ...p, quantity: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" /> Save Product
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Product</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Stock</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Price</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRODUCTS.map((p, i) => (
                    <tr key={p.name} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${i < MOCK_PRODUCTS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <td className="px-5 py-4 text-sm font-medium">{p.name}</td>
                      <td className={`px-5 py-4 text-sm font-bold ${stockColors[p.status]}`}>{p.stock}</td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">₹{p.price}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${p.status === 'ok' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : p.status === 'low' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {p.status === 'ok' ? '✓ In Stock' : p.status === 'low' ? '⚠ Low Stock' : '✗ Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Orders */}
        {activeTab === 'Orders' && (
          <Card className="border border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
            <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
            <CardContent className="p-0">
              {MOCK_ORDERS.map((order, i) => (
                <div key={order.id} className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i < MOCK_ORDERS.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{order.customer}</p>
                      <p className="text-xs text-slate-400">{order.id} • {order.items} items • {order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>{order.status}</span>
                    <span className="font-bold text-sm">₹{order.amount}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>

      <TrustBot />
    </div>
  );
}
