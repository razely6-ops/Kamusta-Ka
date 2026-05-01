import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, Briefcase, ChevronRight } from 'lucide-react';

export default function Register() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'client' | 'counselor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    specialization: '',
    bio: '',
    hourlyRate: 1000,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;

    setLoading(true);
    try {
      // 1. Create User Profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
        photoURL: user.photoURL,
      });

      // 2. If counselor, create specific profile
      if (role === 'counselor') {
        const profileId = user.uid; // Simple one-to-one mapping for now
        await setDoc(doc(db, 'counselorProfiles', profileId), {
          userId: user.uid,
          specialization: formData.specialization,
          bio: formData.bio,
          hourlyRate: Number(formData.hourlyRate),
          isVerified: false,
          rating: 5,
          reviewCount: 0
        });
      }

      await refreshProfile();
      navigate(role === 'counselor' ? '/counselor/dashboard' : '/client/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-20 text-center font-bold text-slate-400">Please sign in first.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-sans text-brand-slate relative">
      <div className="mesh-bg" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass-panel rounded-[2.5rem] p-12 shadow-2xl"
      >
        <div className="text-center mb-10">
           <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6">
            K
          </div>
          <h2 className="text-4xl font-bold mb-4 italic">Complete your Profile</h2>
          <p className="text-slate-500 font-medium">How would you like to use Kamusta Ka?</p>
        </div>

        {!role ? (
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => setRole('client')}
              className="p-8 rounded-3xl border-2 border-white/60 bg-white/20 hover:bg-white/40 hover:border-teal-500/50 transition-all group flex flex-col items-center gap-4 text-center backdrop-blur-sm shadow-sm"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <User size={32} />
              </div>
              <span className="font-bold text-xl">Seeking Help</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">I am looking for support</p>
            </button>
            <button 
              onClick={() => setRole('counselor')}
              className="p-8 rounded-3xl border-2 border-white/60 bg-white/20 hover:bg-white/40 hover:border-teal-500/50 transition-all group flex flex-col items-center gap-4 text-center backdrop-blur-sm shadow-sm"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                <Briefcase size={32} />
              </div>
              <span className="font-bold text-xl">Offering Help</span>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">I am a professional</p>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:bg-white focus:border-teal-500/50 transition-all font-semibold"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            {role === 'counselor' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Specialization</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. CBT, Family Therapy"
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:bg-white focus:border-teal-500/50 transition-all font-semibold"
                    value={formData.specialization}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Bio</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:bg-white focus:border-teal-500/50 transition-all font-semibold"
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Hourly Rate (PHP)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:bg-white focus:border-teal-500/50 transition-all font-semibold"
                    value={formData.hourlyRate}
                    onChange={e => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-6">
              <button 
                type="button"
                onClick={() => setRole(null)}
                className="flex-1 px-8 py-4 btn-glass rounded-2xl font-bold text-slate-600 hover:bg-white/80 transition-all"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-[2] px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-teal-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Profile...' : 'Join Kamusta Ka'}
                {!loading && <ChevronRight size={20} />}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
