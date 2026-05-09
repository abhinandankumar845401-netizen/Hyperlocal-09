import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, Zap, PackageOpen, Bot, Star, ArrowRight, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            TrustLocal
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="font-medium hidden sm:inline-flex" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/25" onClick={() => navigate('/auth')}>
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-500/20 via-green-500/20 to-purple-500/20 rounded-full blur-[100px] opacity-70" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6 ring-1 ring-blue-500/20">
              <Bot className="w-4 h-4" />
              AI-Powered Trust Engine V1.0
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Trust Your <br className="hidden md:block" /> Neighborhood Again.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              An AI-powered hyperlocal marketplace connecting you directly with trusted nearby businesses. No dark stores. No fake reviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 shadow-xl" onClick={() => navigate('/auth')}>
                Explore Nearby Shops
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full border-2" onClick={() => navigate('/auth')}>
                Become a Seller
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Floating Cards Demo Animation */}
      <section className="relative -mt-10 mb-20 px-6 hidden md:block z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div style={{ y }} className="grid grid-cols-3 gap-6">
            <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transform -rotate-6 translate-y-12">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    98% Trust Score
                  </div>
                </div>
                <h3 className="font-bold text-lg">Sharma's Grocery</h3>
                <p className="text-sm text-slate-500 mb-4">1.2 km away • Since 1998</p>
                <div className="flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 15m delivery</span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">Order Now</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 border-2 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-slate-900 z-10 transform scale-105">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">TrustBot AI</h3>
                    <p className="text-sm text-slate-500 mt-1">"I found 3 verified pharmacies with fast delivery nearby."</p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl shadow-slate-200/50 dark:shadow-none border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transform rotate-6 translate-y-12">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <PackageOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">Live Inventory</h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      </div>
                      <div className="h-2 w-8 bg-green-500/50 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why TrustLocal */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Future is Local.</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Warehouse delivery apps destroy communities. We empower them.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">AI Trust Engine</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Our AI analyzes reviews, delivery times, and community feedback to assign real-time trust scores to local businesses. Fake reviews are eliminated.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Hyperlocal Velocity</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Why wait for a warehouse? Order directly from the shop 2 streets away and get same-hour delivery straight from the source.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Keep Wealth Local</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Every transaction on TrustLocal keeps money in your community, helping neighborhood entrepreneurs thrive against corporate monopolies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Ready to join the revolution?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Whether you're a customer looking for trusted local goods, or a shopkeeper ready to digitize your business.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 h-14 px-10 text-lg rounded-full font-bold" onClick={() => navigate('/auth')}>
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            TrustLocal
          </div>
          <div className="flex gap-6 text-sm font-medium">
             <button onClick={() => navigate('/auth')} className="text-slate-500 hover:text-blue-600">Become a Seller</button>
             <button onClick={() => navigate('/auth')} className="text-slate-500 hover:text-blue-600">Login</button>
             <button className="text-slate-500 hover:text-blue-600">Terms</button>
          </div>
          <div className="text-sm text-slate-500">
            © 2026 TrustLocal. Built for the Future.
          </div>
        </div>
      </footer>
    </div>
  );
}
