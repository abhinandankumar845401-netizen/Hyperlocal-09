import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Shopkeeper specific
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  const [locationStatus, setLocationStatus] = useState('Detect Location');

  const detectLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    setLocationStatus('Detecting...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates([pos.coords.longitude, pos.coords.latitude]);
          setLocationStatus('Location Detected ✅');
        },
        () => {
          setLocationStatus('Failed to detect ❌');
        }
      );
    } else {
      setLocationStatus('Not supported ❌');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate(data.role === 'shopkeeper' ? '/seller-dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register/customer', { name, email, password });
      login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register/shopkeeper', {
        name,
        email,
        password,
        shopName,
        category,
        address: { street: 'Main St', city: 'Delhi', state: 'DL', zipCode: '110001', coordinates }
      });
      login(data);
      navigate('/seller-dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-slate-900 shadow-xl mb-4 border border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">TrustLocal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join the verified neighborhood network.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-2xl">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-2xl">
              <Tabs defaultValue="customer" className="w-full p-4">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="customer" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer
                  </TabsTrigger>
                  <TabsTrigger value="seller" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Seller
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="customer">
                  <form onSubmit={handleCustomerSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="c-name">Full Name</Label>
                      <Input id="c-name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-email">Email</Label>
                      <Input id="c-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-password">Password</Label>
                      <Input id="c-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Customer Account'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="seller">
                  <form onSubmit={handleSellerSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="s-name">Owner Name</Label>
                      <Input id="s-name" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-shop">Shop Name</Label>
                      <Input id="s-shop" placeholder="Jane's Bakery" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-category">Category</Label>
                      <Input id="s-category" placeholder="Bakery, Electronics, etc." value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-email">Business Email</Label>
                      <Input id="s-email" type="email" placeholder="contact@janesbakery.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="s-password">Password</Label>
                      <Input id="s-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Shop Location</Label>
                      <Button 
                        onClick={detectLocation} 
                        variant="outline" 
                        className={`w-full ${locationStatus.includes('✅') ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20' : ''}`}
                      >
                        {locationStatus}
                      </Button>
                      <p className="text-[10px] text-slate-500">Required to show your shop to nearby customers.</p>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Seller Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
