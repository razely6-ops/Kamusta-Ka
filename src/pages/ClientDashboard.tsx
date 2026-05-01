import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, addDoc, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar, MessageSquare, Star, Search, Filter, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Counselor {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  bio: string;
  hourlyRate: number;
  photoURL?: string;
  rating: number;
  reviewCount: number;
}

interface Appointment {
  id: string;
  counselorId: string;
  clientName?: string;
  startTime: any;
  status: string;
  paymentStatus: string;
}

export default function ClientDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'find' | 'sessions'>('find');

  useEffect(() => {
    if (!user) return;

    // Fetch counselors
    const fetchCounselors = async () => {
      const q = query(collection(db, 'counselorProfiles'));
      const querySnapshot = await getDocs(q);
      const userDocs = await getDocs(collection(db, 'users'));
      const userMap = new Map();
      userDocs.forEach(d => userMap.set(d.id, d.data()));

      const list: Counselor[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const userData = userMap.get(data.userId);
        list.push({
          id: doc.id,
          ...data,
          fullName: userData?.fullName || 'Anonymous Counselor',
          photoURL: userData?.photoURL
        } as Counselor);
      });
      setCounselors(list);
    };

    // Fetch appointments
    const qA = query(
      collection(db, 'appointments'),
      where('clientId', '==', user.uid),
      orderBy('startTime', 'desc')
    );
    const unsubscribeA = onSnapshot(qA, (snap) => {
      const list: Appointment[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(list);
    });

    fetchCounselors().then(() => setLoading(false));
    return () => unsubscribeA();
  }, [user]);

  const handleBook = async (counselor: Counselor) => {
    if (!user) return;
    
    // Simulate booking for 1 week from now
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 7);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(11, 0, 0, 0);

    try {
      await addDoc(collection(db, 'appointments'), {
        clientId: user.uid,
        counselorId: counselor.userId,
        startTime,
        endTime,
        status: 'pending',
        paymentStatus: 'unpaid',
        amount: counselor.hourlyRate,
        createdAt: serverTimestamp()
      });
      setActiveTab('sessions');
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  if (loading) return <div className="p-20 text-center font-sans font-bold text-2xl text-brand-slate animate-pulse">Finding calm for you...</div>;

  return (
    <div className="min-h-screen text-brand-slate font-sans relative">
      <div className="mesh-bg" />
      <nav className="glass-panel border-b-0 px-6 py-4 flex justify-between items-center sticky top-4 z-40 max-w-7xl mx-auto rounded-2xl mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-xl font-bold tracking-tight">Kamusta Ka</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold hidden sm:block text-slate-600">Hello, {profile?.fullName.split(' ')[0]}</span>
          <button onClick={logout} className="px-4 py-2 rounded-xl btn-glass text-xs font-bold text-red-600 hover:bg-red-50 transition-all">Log Out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="flex gap-8 mb-10 border-b border-white/40">
          <button 
            onClick={() => setActiveTab('find')}
            className={`pb-4 px-2 text-2xl font-bold transition-all relative ${activeTab === 'find' ? 'text-brand-slate' : 'text-slate-400'}`}
          >
            Find a Counselor
            {activeTab === 'find' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-teal rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`pb-4 px-2 text-2xl font-bold transition-all relative ${activeTab === 'sessions' ? 'text-brand-slate' : 'text-slate-400'}`}
          >
            My Sessions
            {activeTab === 'sessions' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-brand-teal rounded-t-full" />}
          </button>
        </div>

        {activeTab === 'find' ? (
          <div className="space-y-8">
            <div className="glass-panel p-2 rounded-2xl flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or specialization..."
                  className="w-full pl-12 pr-6 py-3 rounded-xl bg-white/50 focus:outline-none focus:bg-white transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <button className="px-6 py-3 btn-glass rounded-xl flex items-center gap-2 font-bold text-sm text-slate-700 hover:shadow-sm transition-all">
                <Filter size={18} />
                Filters
              </button>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {counselors.map((c, i) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden avatar-border bg-teal-100">
                          <img 
                            src={c.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=0d9488&color=fff`} 
                            className="w-full h-full object-cover"
                            alt={c.fullName}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-brand-slate leading-tight">{c.fullName}</h3>
                          <p className="text-xs font-bold text-brand-teal uppercase tracking-wider mt-1">{c.specialization}</p>
                          <div className="flex items-center gap-1 text-amber-500 mt-2">
                             <Star size={14} fill="currentColor" />
                             <span className="text-xs font-bold text-brand-slate">{c.rating || '5.0'}</span>
                             <span className="text-[10px] text-slate-400 font-normal">({c.reviewCount || '0'})</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-brand-slate">₱{c.hourlyRate.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/hr</span></span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-6 bg-white/30 p-3 rounded-xl border border-white/60">
                      {c.bio}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleBook(c)}
                    className="w-full py-3 bg-brand-teal text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Book Consultation
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-panel rounded-[3rem] border-dashed border-2 border-slate-300">
                <Calendar size={64} className="mx-auto mb-4 opacity-10 text-brand-slate" />
                <p className="text-xl font-bold text-slate-400">No appointments yet.</p>
                <button 
                   onClick={() => setActiveTab('find')}
                   className="mt-4 text-brand-teal font-bold hover:underline"
                >
                  Browse Counselors →
                </button>
              </div>
            ) : (
              appointments.map((a, i) => {
                const counselor = counselors.find(c => c.userId === a.counselorId);
                return (
                  <motion.div 
                    key={a.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel rounded-3xl p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:shadow-lg transition-all"
                  >
                    <div className="w-16 h-16 bg-white/60 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">{format(a.startTime.toDate(), 'MMM')}</span>
                      <span className="text-2xl font-bold text-brand-slate leading-none">{format(a.startTime.toDate(), 'dd')}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-slate">{counselor?.fullName || 'Counselor'}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {format(a.startTime.toDate(), 'hh:mm a')} • {a.status.toUpperCase()}
                      </p>
                      <div className="mt-3 flex gap-2">
                         <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                           a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                           a.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                         }`}>
                           {a.status}
                         </span>
                         <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                           a.paymentStatus === 'paid' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
                         }`}>
                           {a.paymentStatus}
                         </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="p-3 btn-glass rounded-2xl hover:bg-white/80 transition-all text-slate-600 shadow-sm">
                        <MessageSquare size={18} />
                      </button>
                      {a.status === 'confirmed' && (
                        <button 
                          onClick={() => navigate(`/session/${a.id}`)}
                          className="px-6 py-3 bg-brand-teal text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-200/50 hover:scale-105 transition-all"
                        >
                          Join Call
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
