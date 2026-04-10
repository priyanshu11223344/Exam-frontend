import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Trophy, User, LogOut, 
  Clock, ChevronRight, Bell, Edit3, X, School, 
  GraduationCap, Calendar, Hash, Mail, ShieldCheck,
  CreditCard, Sparkles
} from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, updateUser } from '../features/user/userSlice';
import { useAuth } from '@clerk/react';
import Logo from "../assets/Aurethia_logo.avif"
const UserDashboard = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user, loading } = useSelector((state) => state.user);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', school: '', board: '', studentClass: '', age: ''
  });

  useEffect(() => { 
    dispatch(fetchUser({ getToken })); 
  }, [dispatch, getToken]);

  // Keep form in sync with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        school: user.school || '',
        board: user.board || '',
        studentClass: user.studentClass || '',
        age: user.age || ''
      });
    }
  }, [user, isModalOpen]);

  if (loading || !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse tracking-tight">Preparing your workspace...</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser({ getToken, formData }));
    setIsModalOpen(false);
  };

  const upcomingExams = [
    { id: 1, title: "Advanced Mathematics", time: "Today, 04:00 PM", duration: "60 mins" },
    { id: 2, title: "Operating Systems", time: "Tomorrow, 10:00 AM", duration: "90 mins" },
  ];

  return (
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-slate-900 text-white hidden lg:flex flex-col shadow-2xl">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 bg-indigo-600/20 p-3 rounded-2xl border border-indigo-500/30">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/40">
              <img src={Logo} className='h-10 w-10'></img>
            </div>
            <span className="text-xl font-black tracking-tight">AURE<span className="text-indigo-400">THIA</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarItem icon={<BookOpen size={20}/>} label="My Exams" />
          <SidebarItem icon={<Trophy size={20}/>} label="Performance" />
          <SidebarItem icon={<User size={20}/>} label="Profile" />
        </nav>

        <div className="p-6 mt-auto">
          <button className="flex items-center gap-3 w-full p-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase text-xs tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 flex justify-between items-center sticky top-0 z-40">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Welcome, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter mt-1 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Academic Session 2026
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1 inline-block">Student ID: #8291</span>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=4f46e5&color=fff&bold=true`} 
                alt="Profile" className="w-11 h-11 rounded-full border-2 border-white shadow-md"
              />
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto space-y-10">
          
          {/* --- PROFILE SECTION --- */}
          <section className="relative">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-40"></div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200 ring-4 ring-indigo-50">
                    <User size={36} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                        <Mail size={14} className="text-indigo-400" /> {user?.email}
                      </div>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase">
                        <ShieldCheck size={12} /> Verified Profile
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 shadow-lg"
                >
                  <Edit3 size={16} /> Edit Details
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                <DetailBox icon={<School size={18} />} label="School" value={user?.school} color="blue" />
                <DetailBox icon={<GraduationCap size={18} />} label="Board" value={user?.board} color="indigo" />
                <DetailBox icon={<Hash size={18} />} label="Class" value={user?.studentClass} color="purple" />
                <DetailBox icon={<Calendar size={18} />} label="Age" value={user?.age} color="rose" />
              </div>
            </div>
          </section>

          {/* --- DASHBOARD GRID --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Col: Upcoming Exams */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end mb-2 px-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Assessments</h2>
                <button className="text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:underline">View Calendar</button>
              </div>
              
              <div className="grid gap-4">
                {upcomingExams.map(exam => (
                  <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all hover:shadow-md">
                    <div className="flex items-center gap-5">
                      <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-none mb-1">{exam.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{exam.time} • <span className="text-indigo-500">{exam.duration}</span></p>
                      </div>
                    </div>
                    <button className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                      Launch
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Plan & Results */}
            <div className="space-y-10">
              
              {/* Separate Plan Component Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 px-2 tracking-tight flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-600" /> Plan Status
                </h2>
                <PlanCard planName={user?.planName} expiry={user?.planExpiry} />
              </div>

              {/* Recent Results */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 px-2 tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" /> Recent Grades
                </h2>
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-5">
                    <ResultItem subject="Physics 101" score="92/100" date="2 days ago" trend="up" />
                    <ResultItem subject="Data Structures" score="78/100" date="1 week ago" trend="down" />
                  </div>
                  <button className="w-full py-4 bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-t hover:bg-slate-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-1">
                    Download Transcripts <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* --- EDIT PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Profile</h2>
                <p className="text-slate-500 text-sm font-medium">Update your school and class info</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <PremiumInput label="Full Name" value={formData.name} icon={<User size={16}/>} onChange={(v) => setFormData({...formData, name: v})} />
              <div className="grid grid-cols-2 gap-5">
                <PremiumInput label="School" value={formData.school} icon={<School size={16}/>} onChange={(v) => setFormData({...formData, school: v})} />
                <PremiumInput label="Board" value={formData.board} icon={<GraduationCap size={16}/>} onChange={(v) => setFormData({...formData, board: v})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <PremiumInput label="Class" value={formData.studentClass} icon={<Hash size={16}/>} onChange={(v) => setFormData({...formData, studentClass: v})} />
                <PremiumInput label="Age" type="number" value={formData.age} icon={<Calendar size={16}/>} onChange={(v) => setFormData({...formData, age: v})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const PlanCard = ({ planName, expiry }) => {
  const expiryDate = expiry ? new Date(expiry) : null;
  const isExpired = expiryDate ? expiryDate < new Date() : false;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-7 text-white shadow-xl group transition-transform hover:scale-[1.02]">
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all"></div>
      
      <div className="relative z-10 space-y-5">
        <div className="flex justify-between items-center">
          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[9px] font-black uppercase tracking-widest">
            Membership Status
          </div>
          <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
        </div>

        <div>
          <h3 className="text-3xl font-black tracking-tight mb-1">{planName || "Standard"}</h3>
          <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider">Premium Scholar Access</p>
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
          <div>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Validity Period</p>
            <p className="text-sm font-bold">
              {expiryDate ? expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Lifetime"}
            </p>
          </div>
          <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-400 hover:text-white transition-all shadow-lg">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailBox = ({ icon, label, value, color }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div className={`p-4 rounded-2xl border ${themes[color]} flex items-center gap-3 transition-all hover:shadow-md cursor-default`}>
      <div className="opacity-80">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5 leading-none">{label}</p>
        <p className="font-bold text-sm truncate">{value || "---"}</p>
      </div>
    </div>
  );
};

const PremiumInput = ({ label, value, icon, onChange, type = "text" }) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest group-focus-within:text-indigo-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input 
        type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-700"
      />
    </div>
  </div>
);

const SidebarItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
    active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`}>{icon}</div>
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
  </a>
);

const ResultItem = ({ subject, score, date, trend }) => (
  <div className="flex justify-between items-center group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className={`w-1 h-8 rounded-full ${trend === 'up' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
      <div>
        <p className="font-bold text-slate-800 text-sm leading-tight">{subject}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-sm font-black text-indigo-600">{score}</p>
      <p className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Verified</p>
    </div>
  </div>
);

export default UserDashboard;