import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heart, Shield, Users, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { user, profile, signIn } = useAuth();

  const handleStart = () => {
    if (!user) {
      signIn();
    } else if (!profile) {
      navigate('/register');
    } else {
      navigate(profile.role === 'counselor' ? '/counselor/dashboard' : '/client/dashboard');
    }
  };

  return (
    <div className="min-h-screen font-sans text-brand-slate relative">
      <div className="mesh-bg" />
      {/* Navigation */}
      <nav className="fixed top-4 left-6 right-6 z-50 glass-panel rounded-2xl px-8 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center text-white font-bold text-xl">
            K
          </div>
          <span className="text-2xl font-semibold text-brand-slate tracking-tight">Kamusta Ka</span>
        </div>
        <div className="flex gap-6 items-center">
          <button onClick={handleStart} className="text-sm font-medium text-slate-600 hover:text-brand-teal transition-colors">
            {user ? 'Dashboard' : 'Log In'}
          </button>
          {!user && (
            <button 
              onClick={handleStart}
              className="px-6 py-2 bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-lg shadow-teal-200/50 hover:opacity-90 transition-all active:scale-95"
            >
              Join Now
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-panel rounded-3xl p-10"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-slate mb-4 italic leading-tight">
              Kamusta ka?
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Find a safe space to talk with professional counselors today. No judgment, just support.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleStart}
                className="px-8 py-4 bg-brand-teal text-white rounded-2xl text-lg font-bold shadow-xl shadow-teal-200/50 hover:scale-105 transition-all flex items-center gap-2 group"
              >
                Find a Counselor
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 btn-glass rounded-2xl text-lg font-semibold text-slate-700 hover:bg-white/80 transition-all">
                Be a Counselor
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 avatar-border">
              <img 
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1000" 
                alt="Supportive environment"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: 'Private & Secure', 
                desc: 'Your privacy is our priority. Every session is encrypted and records are kept confidential.' 
              },
              { 
                icon: Users, 
                title: 'Expert Counselors', 
                desc: 'Access a diverse pool of licensed and verified professionals specialized in various areas.' 
              },
              { 
                icon: Clock, 
                title: 'Flexible Timing', 
                desc: 'Book sessions that fit your schedule. Instant support or planned consultations.' 
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[2rem] glass-panel"
              >
                <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-white mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-brand-slate mb-4">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-brand-olive/10 px-6 text-center">
        <p className="text-sm opacity-60">© 2026 Kamusta Ka. Built with care for the community.</p>
      </footer>
    </div>
  );
}
