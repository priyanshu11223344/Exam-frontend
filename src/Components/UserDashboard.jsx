import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Trophy, User, LogOut, 
  Clock, ChevronRight, Bell, Edit3, X, School, 
  GraduationCap, Calendar, Hash, Mail, ShieldCheck,
  CreditCard, Sparkles
} from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, updateUser } from '../features/user/userSlice';
import { useAuth, useUser } from '@clerk/react';
import { Link } from 'react-router-dom';
import Logo from "../assets/Aurethia_logo.avif"
import API from '../api/axios';
const UserDashboard = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { user, loading, error } = useSelector((state) => state.user);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', school: '', board: '', studentClass: '', age: ''
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [assignedExams, setAssignedExams] = useState([]);
  const [classSessions, setClassSessions] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [answerFiles, setAnswerFiles] = useState({});

  useEffect(() => { 
    if (isClerkLoaded && clerkUser) {
      dispatch(fetchUser({ getToken, clerkUser }));
    }
  }, [dispatch, getToken, isClerkLoaded, clerkUser]);

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

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user?.board || !user?.studentClass) {
        setAssignedExams([]);
        setClassSessions([]);
        return;
      }

      setExamLoading(true);
      try {
        const [assignmentResponse, sessionResponse] = await Promise.all([
          API.get("/exams/assignments", {
            params: {
              board: user.board,
              className: user.studentClass,
            },
          }),
          API.get("/teachers/student-sessions", {
            params: {
              board: user.board,
              className: user.studentClass,
            },
          }),
        ]);
        setAssignedExams(assignmentResponse.data.data || []);
        setClassSessions(sessionResponse.data.data || []);
      } catch (error) {
        console.error("Unable to load assigned work", error);
      } finally {
        setExamLoading(false);
      }
    };

    loadAssignments();
  }, [user?.board, user?.studentClass]);

  if (loading || !isClerkLoaded) {
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

  if (error || !user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Unable to prepare your dashboard</h1>
        <p className="mt-2 max-w-lg text-slate-500">
          {error || "Your student profile could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => dispatch(fetchUser({ getToken, clerkUser }))}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUser({ getToken, clerkUser, formData }));
    setIsModalOpen(false);
  };

  const handleAnswerUpload = async (assignmentId) => {
    const files = answerFiles[assignmentId] || [];

    if (!files.length) {
      alert("Select answer-sheet photos first.");
      return;
    }

    const uploadData = new FormData();
    files.forEach((file) => uploadData.append("answerSheets", file));
    uploadData.append("userEmail", user.email);
    uploadData.append("userName", user.name);

    try {
      await API.post(`/exams/assignments/${assignmentId}/answer-sheets`, uploadData);
      alert("Answer sheets submitted");
      setAnswerFiles({ ...answerFiles, [assignmentId]: [] });
    } catch (error) {
      alert(error.response?.data?.error || "Unable to submit answer sheets");
    }
  };

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
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarItem icon={<BookOpen size={20}/>} label="My Exams" active={activeTab === "exams"} onClick={() => setActiveTab("exams")} />
          <SidebarItem icon={<Calendar size={20}/>} label="Calendar" active={activeTab === "calendar"} onClick={() => setActiveTab("calendar")} />
          <SidebarItem icon={<Trophy size={20}/>} label="Performance" active={activeTab === "performance"} onClick={() => setActiveTab("performance")} />
          <SidebarItem icon={<User size={20}/>} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
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
          {activeTab === "dashboard" && <section className="relative">
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
          </section>}

          {/* --- DASHBOARD GRID --- */}
          {activeTab === "dashboard" && <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left Col: Upcoming Exams */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end mb-2 px-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Assessments</h2>
                <button onClick={() => setActiveTab("calendar")} className="text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:underline">View Calendar</button>
              </div>
              
              <div className="grid gap-4">
                {examLoading && <p className="text-slate-500 font-semibold">Loading assignments...</p>}
                {!examLoading && assignedExams.slice(0, 3).length === 0 && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-500 font-semibold">
                    No assigned exams yet for your board and class.
                  </div>
                )}
                {assignedExams.slice(0, 3).map(exam => (
                  <div key={exam._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all hover:shadow-md">
                    <div className="flex items-center gap-5">
                      <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-none mb-1">{exam.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{exam.subject} • <span className="text-indigo-500">{exam.durationMinutes || 60} mins</span></p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("exams")} className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
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
          </div>}

          {activeTab === "exams" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">My Exams</h2>
                <p className="text-sm font-semibold text-slate-500">
                  Papers assigned to {user?.board || "your board"} / Class {user?.studentClass || "---"}
                </p>
              </div>

              {!user?.board || !user?.studentClass ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-600 font-semibold">
                  Add your board and class in profile details to see assigned exams.
                </div>
              ) : examLoading ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-600 font-semibold">
                  Loading assigned exams...
                </div>
              ) : assignedExams.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-600 font-semibold">
                  No exams have been assigned to your board and class yet.
                </div>
              ) : (
                <div className="grid gap-5">
                  {assignedExams.map((exam) => (
                    <div key={exam._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            {exam.type === "quiz" ? "Quiz" : "Question Paper"}
                          </span>
                          <h3 className="mt-3 text-xl font-black text-slate-900">{exam.title}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {exam.subject} • {exam.durationMinutes || 60} mins
                            {exam.dueAt ? ` • Due ${new Date(exam.dueAt).toLocaleString()}` : ""}
                          </p>
                          {exam.instructions && <p className="mt-3 text-sm text-slate-600">{exam.instructions}</p>}
                        </div>

                        {exam.type === "quiz" ? (
                          <Link to="/quiz" className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white">
                            Start Quiz
                          </Link>
                        ) : (
                          <a
                            href={`${API.defaults.baseURL?.replace("/api", "")}${exam.questionPaper?.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white"
                          >
                            Open Paper
                          </a>
                        )}
                      </div>

                      {exam.type === "paper" && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Upload answer-sheet photos
                          </label>
                          <div className="mt-3 flex flex-col gap-3 md:flex-row">
                            <input
                              type="file"
                              multiple
                              accept="image/*,.pdf"
                              onChange={(event) =>
                                setAnswerFiles({
                                  ...answerFiles,
                                  [exam._id]: Array.from(event.target.files || []),
                                })
                              }
                              className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm"
                            />
                            <button
                              onClick={() => handleAnswerUpload(exam._id)}
                              className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white"
                            >
                              Submit Answers
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "performance" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-2xl font-black text-slate-900">Performance</h2>
              <p className="mt-2 text-slate-500 font-semibold">Grades and submitted exam history will appear here after teachers review submissions.</p>
            </section>
          )}

          {activeTab === "calendar" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Class Calendar</h2>
                <p className="text-sm font-semibold text-slate-500">
                  Scheduled classes for {user?.board || "your board"} / Class {user?.studentClass || "---"}
                </p>
              </div>

              {!user?.board || !user?.studentClass ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-600 font-semibold">
                  Add your board and class in profile details to see scheduled classes.
                </div>
              ) : classSessions.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-slate-600 font-semibold">
                  No teacher classes have been scheduled yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {classSessions.map((session) => (
                    <div key={session._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            {session.status}
                          </span>
                          <h3 className="mt-3 text-xl font-black text-slate-900">{session.title}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {session.subject} • {new Date(session.startsAt).toLocaleString()}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Teacher: {session.teacherName || session.teacherEmail}
                          </p>
                        </div>
                        {session.meetingLink && (
                          <a href={session.meetingLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white">
                            Join Class
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "profile" && (
            <section className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-2xl font-black text-slate-900">Profile</h2>
              <p className="mt-2 text-slate-500 font-semibold">Use Edit Details on the dashboard to update school, board and class.</p>
            </section>
          )}
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

const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`flex w-full items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
    active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`}>{icon}</div>
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
  </button>
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
