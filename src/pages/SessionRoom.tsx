import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, addDoc, orderBy, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Video, Mic, PhoneOff, Settings, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

export default function SessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId || !user) return;

    // Fetch session info
    const fetchSession = async () => {
      const snap = await getDoc(doc(db, 'appointments', sessionId));
      if (snap.exists()) setSessionData(snap.data());
    };
    fetchSession();

    // Listen for messages
    const q = query(
      collection(db, 'appointments', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs: Message[] = [];
      snap.forEach(doc => msgs.push({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [sessionId, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !sessionId || !user) return;

    try {
      await addDoc(collection(db, 'appointments', sessionId, 'messages'), {
        senderId: user.uid,
        text: inputText,
        timestamp: serverTimestamp(),
        appointmentId: sessionId
      });
      setInputText('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans text-brand-slate relative overflow-hidden">
      <div className="mesh-bg" />
      {/* Header */}
      <nav className="glass-panel px-6 py-4 flex justify-between items-center z-40 m-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 btn-glass rounded-xl hover:bg-white/80 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center text-white font-bold">
               <Video size={20} />
             </div>
             <div>
                <p className="font-bold text-lg leading-tight text-brand-slate">Consultation Room</p>
                <p className="text-[10px] uppercase font-bold text-brand-teal tracking-widest">Secure & Private Connection</p>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="p-3 btn-glass rounded-xl hover:bg-white/80 transition-all shadow-sm"><Mic size={20} /></button>
           <button className="p-3 btn-glass rounded-xl hover:bg-white/80 transition-all shadow-sm"><Settings size={20} /></button>
           <button 
             onClick={() => navigate(-1)}
             className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200/50"
           >
              <PhoneOff size={16} /> End Session
           </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4 pt-0 gap-6">
        {/* Video Placeholder (Large) */}
        <div className="flex-[3] rounded-[2.5rem] relative overflow-hidden flex items-center justify-center glass-panel border-4 border-white/60 shadow-2xl">
            <div className="text-center opacity-20 group">
               <Video size={120} className="mx-auto mb-6 group-hover:scale-110 transition-transform text-brand-slate" />
               <p className="text-3xl italic font-bold text-brand-slate">Camera feed connecting...</p>
            </div>
            
            {/* Small self-view */}
            <div className="absolute top-8 right-8 w-60 h-40 rounded-3xl shadow-2xl border-4 border-white/80 overflow-hidden glass-panel flex items-center justify-center">
               <User size={40} className="opacity-10 text-brand-slate" />
            </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 glass-panel rounded-[2.5rem] flex flex-col overflow-hidden border-2 border-white/60 shadow-2xl">
           <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/10">
              <h3 className="font-bold text-xl flex items-center gap-2 text-brand-slate">
                <MessageSquare size={18} /> Chat
              </h3>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">LIVE</span>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div 
                    key={m.id}
                    initial={{ opacity: 0, x: m.senderId === user?.uid ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${m.senderId === user?.uid ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] px-5 py-3 rounded-[1.5rem] text-sm shadow-sm ${
                      m.senderId === user?.uid 
                        ? 'bg-brand-teal text-white rounded-br-none shadow-teal-200/50' 
                        : 'bg-white/60 text-brand-slate rounded-bl-none border border-white/80'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[9px] font-bold mt-2 uppercase text-slate-400">
                      {m.timestamp?.toDate ? format(m.timestamp.toDate(), 'hh:mm a') : 'Just now'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           <form onSubmit={handleSend} className="p-6 bg-white/40 border-t border-white/60 backdrop-blur-md flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-6 py-3.5 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 shadow-sm font-medium transition-all"
              />
              <button 
                type="submit"
                className="w-14 h-14 bg-brand-teal text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-teal-200/50 active:scale-95"
              >
                <Send size={20} />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}

