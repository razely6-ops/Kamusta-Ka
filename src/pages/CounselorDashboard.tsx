import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar, Check, X, Clock, Users, ArrowUpRight, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  clientId: string;
  clientName?: string;
  startTime: any;
  status: string;
  paymentStatus: string;
  amount: number;
}

export default function CounselorDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where('counselorId', '==', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snap) => {
      const list: Appointment[] = [];
      snap.forEach(doc => {
        const data = doc.data() as Appointment;
        list.push({ id: doc.id, ...data });
      });
      setAppointments(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  if (loading) return <div className="p-20 text-center font-sans font-bold text-2xl text-brand-slate animate-pulse">Organizing your schedule...</div>;

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const earnings = appointments.filter(a => a.paymentStatus === 'paid').reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="min-h-screen text-brand-slate font-sans relative">
      <div className="mesh-bg" />
      <nav className="glass-panel border-b-0 px-6 py-4 flex justify-between items-center sticky top-4 z-40 max-w-7xl mx-auto rounded-2xl mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
            K
          </div>
          <span className="text-xl font-bold tracking-tight">Kamusta Ka | Expert</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-brand-slate">{profile?.fullName}</p>
            <p className="text-[10px] uppercase font-bold text-brand-teal tracking-wider">Verified Professional</p>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-xl btn-glass text-xs font-bold text-red-600 hover:bg-red-50 transition-all">Log Out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <header className="mb-12 glass-panel rounded-[2.5rem] p-10">
          <h1 className="text-5xl font-bold text-brand-slate mb-4 italic">Kamusta ka, {profile?.fullName.split(' ')[0]}?</h1>
          <p className="text-slate-600 text-lg">You have {pendingCount} new session requests awaiting your attention.</p>
        </header>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'bg-amber-100 text-amber-600' },
            { label: 'Total Earnings', value: `₱${earnings.toLocaleString()}`, icon: DollarSign, color: 'bg-teal-100 text-teal-600' },
            { label: 'Active Clients', value: new Set(appointments.map(a => a.clientId)).size, icon: Users, color: 'bg-sky-100 text-sky-600' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-brand-slate">{stat.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon size={28} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-brand-slate mb-6 px-2">Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <div className="glass-panel border-dashed border-2 border-slate-300 rounded-[2.5rem] p-20 text-center">
                <Calendar size={48} className="mx-auto mb-4 opacity-10 text-brand-slate" />
                <p className="italic font-medium text-slate-400">Your schedule is open. Take some time for yourself.</p>
              </div>
            ) : (
              appointments.map((a, i) => (
                <motion.div 
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-[2rem] p-6 hover:shadow-lg transition-all flex items-center gap-6"
                >
                  <div className="w-16 h-16 bg-white/60 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-brand-teal uppercase tracking-widest">{format(a.startTime.toDate(), 'EEE')}</span>
                    <span className="text-2xl font-bold text-brand-slate">{format(a.startTime.toDate(), 'dd')}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-brand-slate">Client ID: ...{a.clientId.slice(-4)}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                        a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                       <Clock size={12} />
                       {format(a.startTime.toDate(), 'hh:mm a')} • 1hr Session
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleStatus(a.id, 'confirmed')}
                          className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200/50"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => handleStatus(a.id, 'cancelled')}
                          className="w-12 h-12 bg-white/60 border border-rose-200 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => navigate(`/session/${a.id}`)}
                        className="px-6 py-3 bg-brand-slate text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        Join Call <ArrowUpRight size={14} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div>
             <h2 className="text-2xl font-bold text-brand-slate mb-6 px-2">Your Impact</h2>
             <div className="bg-teal-900/10 border border-teal-500/20 p-8 rounded-[2.5rem] relative overflow-hidden backdrop-blur-md">
                <p className="text-lg italic font-bold text-teal-900 mb-6 leading-relaxed">
                  "Listening is not just hearing. It's about being present with the silence between words."
                </p>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">❤</div>
                   <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Practitioner Weekly</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
