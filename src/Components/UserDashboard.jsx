import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  LayoutDashboard, BookOpen, Trophy, User, LogOut, 
  Clock, ChevronRight, Bell, Edit3, X, School, 
  GraduationCap, Calendar, Hash, Mail, ShieldCheck,
  CreditCard, Sparkles, ExternalLink, FileText, PlayCircle, RefreshCw, ChevronDown
} from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, updateUser } from '../features/user/userSlice';
import { useAuth, useClerk, useUser } from '@clerk/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Logo from "../assets/Aurethia_logo.avif"
import API from '../api/axios';

const STUDENT_TAB_IDS = ["dashboard", "exams", "calendar", "performance", "profile"];
const PaperViewer = React.lazy(() => import("./PaperViewer"));

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tab } = useParams();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { user, loading, error } = useSelector((state) => state.user);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  const activeTab = STUDENT_TAB_IDS.includes(tab) ? tab : "dashboard";
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', school: '', board: '', studentClass: '', age: ''
  });
  const [assignedExams, setAssignedExams] = useState([]);
  const [classSessions, setClassSessions] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [answerFiles, setAnswerFiles] = useState({});
  const [classroomResources, setClassroomResources] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studentWorkspace, setStudentWorkspace] = useState({ subjects: [], teachers: [] });
  const [boards, setBoards] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [paperViewer, setPaperViewer] = useState(null);

  const subjectNames = useMemo(() => Array.from(new Set([
    ...assignedExams.map((exam) => exam.subject),
    ...classroomResources.map((resource) => resource.subject),
    ...(studentWorkspace.subjects || []),
    ...(user?.subscriptionScope?.subjects || []),
  ].filter(Boolean))).sort(), [assignedExams, classroomResources, studentWorkspace.subjects, user?.subscriptionScope?.subjects]);
  const activeSubject = selectedSubject || subjectNames[0] || "";
  const requiresProfileSetup = user?.role === "user" && !(user?.profileComplete ?? (user?.name && user?.board && user?.studentClass));
  const recentGrades = useMemo(() => submissions
    .filter((submission) => submission.status === "graded")
    .sort((a, b) => new Date(b.gradedAt || b.updatedAt) - new Date(a.gradedAt || a.updatedAt))
    .slice(0, 5), [submissions]);

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
    if (requiresProfileSetup) {
      setIsModalOpen(true);
    }
  }, [requiresProfileSetup]);

  useEffect(() => {
    API.get("/boards")
      .then((response) => setBoards(response.data.data || []))
      .catch(() => setBoards([]));
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      const effectiveBoard = user?.board || user?.subscriptionScope?.board;
      const hasSchoolClass = Boolean(user?.board && user?.studentClass);
      const hasTestSeries = ["test_series", "complete"].includes(user?.productType);
      if (!user?.email) return;

      setExamLoading(true);
      setLoadError("");
      try {
        const token = await getTokenRef.current();
        const assignmentRequests = [];
        if (hasSchoolClass) assignmentRequests.push(API.get("/exams/assignments", {
            params: {
              board: user.board,
              className: user.studentClass,
              studentEmail: user.email,
              audience: "class",
            },
          }));
        if (hasTestSeries) assignmentRequests.push(API.get("/exams/assignments", {
          params: { board: effectiveBoard, audience: "subscribers", limit: 100 },
        }));
        const [assignmentResponses, sessionResponse, resourceResponse, submissionResponse, workspaceResponse] = await Promise.all([
          Promise.all(assignmentRequests),
          hasSchoolClass ? API.get("/teachers/student-sessions", {
            params: {
              board: user.board,
              className: user.studentClass,
            },
          }) : Promise.resolve({ data: { data: [] } }),
          hasSchoolClass ? API.get("/classroom/resources", { params: { board: user.board, className: user.studentClass, limit: 100 }, headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: { data: [] } }),
          API.get("/exams/submissions", { params: { userEmail: user.email, limit: 100 }, headers: { Authorization: `Bearer ${token}` } }),
          hasSchoolClass ? API.get("/teachers/student-workspace", { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ data: { data: { subjects: [], teachers: [] } } }),
        ]);
        const scopedSubjects = user?.subscriptionScope?.subjects || [];
        const exams = assignmentResponses.flatMap((response) => response.data.data || []).filter((exam) => !scopedSubjects.length || exam.audience !== "subscribers" || scopedSubjects.includes(exam.subject));
        setAssignedExams(Array.from(new Map(exams.map((exam) => [exam._id, exam])).values()));
        setClassSessions(sessionResponse.data.data || []);
        setClassroomResources(resourceResponse.data.data || []);
        setSubmissions(submissionResponse.data.data || []);
        setStudentWorkspace(workspaceResponse.data.data || { subjects: [], teachers: [] });
      } catch (error) {
        console.error("Unable to load assigned work", error);
        setLoadError(error.response?.data?.error || "Unable to refresh student data.");
      } finally {
        setExamLoading(false);
      }
    };

    loadAssignments();
  }, [refreshKey, user?.board, user?.email, user?.productType, user?.studentClass, user?.subscriptionScope?.board, user?.subscriptionScope?.subjects]);

  if (!isClerkLoaded || (loading && !user)) {
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

  if (!user) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    try {
      await dispatch(updateUser({ getToken, clerkUser, formData })).unwrap();
      await dispatch(fetchUser({ getToken, clerkUser })).unwrap();
      setIsModalOpen(false);
      setRefreshKey((value) => value + 1);
    } catch (saveError) {
      setProfileError(typeof saveError === "string" ? saveError : "Unable to save profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const goToTab = (tabId) => {
    navigate(`/UserDashboard/${tabId}`);
  };

  const closeProfileModal = () => {
    if (!requiresProfileSetup) setIsModalOpen(false);
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
      const token = await getToken();
      await API.post(`/exams/assignments/${assignmentId}/answer-sheets`, uploadData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Answer sheets submitted");
      setAnswerFiles({ ...answerFiles, [assignmentId]: [] });
      setRefreshKey((value) => value + 1);
    } catch (error) {
      alert(error.response?.data?.error || "Unable to submit answer sheets");
    }
  };

  const openQuestionPaper = async (exam) => {
    setPaperViewer({ title: exam.title, loading: true, error: "" });
    try {
      const token = await getToken();
      const response = await API.get(`/exams/assignments/${exam._id}/paper`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const mimeType = String(response.headers["content-type"] || response.data.type || "").split(";")[0];
      if (!["application/pdf", "image/png", "image/jpeg"].includes(mimeType)) {
        throw new Error("The paper format is not supported.");
      }
      const data = mimeType === "application/pdf"
        ? new Uint8Array(await response.data.arrayBuffer())
        : undefined;
      setPaperViewer({
        title: exam.title,
        loading: false,
        error: "",
        mimeType,
        blob: response.data,
        data,
      });
    } catch (error) {
      setPaperViewer({
        title: exam.title,
        loading: false,
        error: error.response?.data?.error || error.message || "Unable to open this paper.",
      });
    }
  };

  const handleSignOut = async () => {
    sessionStorage.removeItem("filters");
    sessionStorage.removeItem("quizFilters");
    sessionStorage.removeItem("papers");
    sessionStorage.removeItem("quizData");
    await signOut();
    navigate("/");
  };

  const downloadTranscript = () => {
    if (!recentGrades.length) return;
    const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Assessment", "Subject", "Grade", "Feedback", "Graded at"],
      ...recentGrades.map((submission) => [
        submission.assignment?.title || "Submitted work",
        submission.assignment?.subject || "",
        submission.grade || `${submission.quizResult?.score || 0}/${submission.quizResult?.total || 0}`,
        submission.feedback || "",
        new Date(submission.gradedAt || submission.updatedAt).toLocaleString(),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(escapeCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(user?.name || "student").replaceAll(" ", "-").toLowerCase()}-transcript.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === "dashboard"} onClick={() => goToTab("dashboard")} />
          <SidebarItem icon={<BookOpen size={20}/>} label="My Exams" active={activeTab === "exams"} onClick={() => goToTab("exams")} />
          <SidebarItem icon={<Calendar size={20}/>} label="Calendar" active={activeTab === "calendar"} onClick={() => goToTab("calendar")} />
          <SidebarItem icon={<Trophy size={20}/>} label="Performance" active={activeTab === "performance"} onClick={() => goToTab("performance")} />
          <SidebarItem icon={<User size={20}/>} label="Profile" active={activeTab === "profile"} onClick={() => goToTab("profile")} />
        </nav>

        <div className="p-6 mt-auto">
          <button type="button" onClick={handleSignOut} className="flex items-center gap-3 w-full p-4 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all group">
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
            <button type="button" title="Refresh dashboard" onClick={() => setRefreshKey((value) => value + 1)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all">
              <RefreshCw size={20} className={examLoading ? "animate-spin" : ""} />
            </button>
            <button type="button" title="Open assigned exams" onClick={() => goToTab("exams")} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-all relative">
              <Bell size={20} />
              {assignedExams.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>}
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mt-1 inline-block">Student ID: #{String(user?._id || "NEW").slice(-6).toUpperCase()}</span>
              </div>
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=4f46e5&color=fff&bold=true`} 
                alt="Profile" className="w-11 h-11 rounded-full border-2 border-white shadow-md"
              />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-6 lg:p-8 xl:p-10">
          {loadError && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700"><span>{loadError}</span><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="rounded-lg bg-rose-600 px-4 py-2 text-xs text-white">Try again</button></div>}
          
          {/* --- PROFILE SECTION --- */}
          {activeTab === "dashboard" && <section>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-50"></div>
              
              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                    <User size={30} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black tracking-tight text-slate-900">{user?.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-500">
                        <Mail size={14} className="shrink-0 text-indigo-400" /> <span className="truncate">{user?.email}</span>
                      </div>
                      <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block"></span>
                      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600">
                        <ShieldCheck size={12} /> Verified Profile
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setProfileError(""); setIsModalOpen(true); }}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-600 active:scale-95"
                >
                  <Edit3 size={16} /> Edit Details
                </button>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <DetailBox icon={<School size={18} />} label="School" value={user?.school} color="blue" />
                <DetailBox icon={<GraduationCap size={18} />} label="Board" value={user?.board} color="indigo" />
                <DetailBox icon={<Hash size={18} />} label="Class" value={user?.studentClass} color="purple" />
                <DetailBox icon={<Calendar size={18} />} label="Age" value={user?.age} color="rose" />
              </div>
            </div>
          </section>}

          {/* --- DASHBOARD GRID --- */}
          {activeTab === "dashboard" && <><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{user?.productType?.replaceAll("_", " ") || "Student workspace"}</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Choose a subject</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Open worksheets, assigned tests and checked work for each subject.</p>
              </div>
              {user?.productType && user.productType !== "free" && <div className="flex flex-wrap gap-2">{["topical", "complete", "topical_builder"].includes(user.productType) && <Link to="/home" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-indigo-700">Open Topical Questions</Link>}{["test_series", "complete"].includes(user.productType) && <button onClick={() => goToTab("exams")} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">Open Test Series</button>}{user.productType === "topical_builder" && <Link to="/home" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-black text-white">Build a Custom PDF Test</Link>}</div>}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              {subjectNames.length === 0 ? <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-5"><div><p className="font-black text-slate-800">No subjects assigned yet</p><p className="mt-1 text-sm text-slate-500">Complete your board and class first. Subjects assigned by the admin or teacher will sync here automatically.</p></div>{(!user?.board || !user?.studentClass) && <button type="button" onClick={() => { setProfileError(""); setIsModalOpen(true); }} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white">Complete profile</button>}</div> : <div className="flex flex-wrap gap-3">{subjectNames.map((subject) => <button key={subject} onClick={() => setSelectedSubject(subject)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition sm:w-64 ${activeSubject === subject ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:bg-white"}`}><span className={`rounded-xl p-2 ${activeSubject === subject ? "bg-white/15" : "bg-white text-indigo-600"}`}><BookOpen size={20} /></span><p className="font-black">{subject}</p></button>)}</div>}
            </div>

            {activeSubject && <div className={`mt-5 grid gap-4 ${user?.features?.includes("mcq") ? "lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]" : "grid-cols-1"}`}>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="flex items-center gap-2 font-black text-slate-900"><FileText size={18} className="text-indigo-600" />Worksheets & content</h3><div className="mt-4 space-y-3">{classroomResources.filter((item) => item.subject === activeSubject).map((resource) => <div key={resource._id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{resource.title}</p><p className="text-sm text-slate-500">{resource.description || "Class resource"}</p><p className="mt-1 text-xs font-bold text-rose-600">Deadline: {new Date(resource.deadline).toLocaleString()}</p></div><a href={resource.driveUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-black text-white">Open <ExternalLink size={13} className="ml-1 inline" /></a></div></div>)}{!classroomResources.some((item) => item.subject === activeSubject) && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-medium text-slate-500">No worksheets uploaded for this subject yet.</div>}</div></div>
              {user?.features?.includes("mcq") && <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><Sparkles className="text-violet-600" /><h3 className="mt-3 text-lg font-black">Special Test for Me</h3><p className="mt-1 text-sm text-slate-600">Start a timed MCQ test using the marking scheme in the question database.</p><Link to="/quiz" className="mt-5 block rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-black text-white"><PlayCircle size={16} className="mr-2 inline" />Start test</Link></div>}
            </div>}
          </section><div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
            
            {/* Left Col: Upcoming Exams */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end mb-2 px-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Upcoming Assessments</h2>
                <button onClick={() => goToTab("calendar")} className="text-indigo-600 text-[11px] font-black uppercase tracking-widest hover:underline">View Calendar</button>
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
                    <button onClick={() => goToTab("exams")} className="bg-slate-50 text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
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
                <PlanCard planName={user?.planName} expiry={user?.planExpiry} onUpgrade={() => navigate("/pricingPage")} />
              </div>

              {/* Recent Results */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 px-2 tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" /> Recent Grades
                </h2>
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-5">
                    {recentGrades.map((submission) => <ResultItem key={submission._id} subject={submission.assignment?.subject || submission.assignment?.title || "Assessment"} score={submission.grade || `${submission.quizResult?.score || 0}/${submission.quizResult?.total || 0}`} date={new Date(submission.gradedAt || submission.updatedAt).toLocaleDateString()} />)}
                    {recentGrades.length === 0 && <p className="py-3 text-sm font-semibold text-slate-500">No graded work yet. Grades will appear after a teacher checks a submission.</p>}
                  </div>
                  <button type="button" disabled={!recentGrades.length} onClick={downloadTranscript} className="w-full py-4 bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-t enabled:hover:bg-slate-100 enabled:hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all flex items-center justify-center gap-1">
                    Download Transcripts <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </div></>}

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
                            {exam.targetStudent?.email ? "Individual " : ""}
                            {exam.type === "quiz" ? "Quiz" : "Question Paper"}
                          </span>
                          <h3 className="mt-3 text-xl font-black text-slate-900">{exam.title}</h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {exam.subject} • {exam.durationMinutes || 60} mins
                            {exam.maximumMarks ? ` • ${exam.maximumMarks} marks` : ""}
                            {exam.dueAt ? ` • Due ${new Date(exam.dueAt).toLocaleString()}` : ""}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            Created {new Date(exam.createdAt).toLocaleString()}
                          </p>
                          {exam.instructions && <p className="mt-3 text-sm text-slate-600">{exam.instructions}</p>}
                        </div>

                        {exam.type === "quiz" ? (
                          <button type="button" onClick={() => navigate("/quiz", { state: { assignment: exam } })} className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white">
                            Start Quiz
                          </button>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {exam.questionPaper && (
                              <button
                                type="button"
                                onClick={() => openQuestionPaper(exam)}
                                className="rounded-2xl bg-slate-900 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white"
                              >
                                Open Paper
                              </button>
                            )}
                            {exam.testLink && (
                              <a href={exam.testLink} target="_blank" rel="noreferrer" className="rounded-2xl bg-indigo-600 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white">
                                Open Test Link
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {exam.type === "paper" && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Upload answer-sheet photos
                          </label>
                          <p className="mt-2 text-xs font-semibold text-amber-700">Only work printed or written on paper and then scanned will be accepted. Late submissions are blocked automatically.</p>
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
                      {exam.markingSchemeLink && (
                        <a href={exam.markingSchemeLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700">
                          <ExternalLink size={15} /> Open Marking Scheme
                        </a>
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
              <p className="mt-2 text-slate-500 font-semibold">Submitted and checked work from your teachers.</p>
              <div className="mt-6 space-y-3">{submissions.map((submission) => <div key={submission._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-black">{submission.assignment?.title || "Submitted work"}</p><p className="text-sm text-slate-500">{submission.assignment?.subject} · {new Date(submission.submittedAt || submission.updatedAt).toLocaleString()}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${submission.status === "graded" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{submission.status}</span></div>{submission.status === "graded" && <div className="mt-3 rounded-lg bg-white p-3"><p className="font-black">Grade: {submission.grade || `${submission.quizResult?.score || 0}/${submission.quizResult?.total || 0}`}</p>{submission.assignment?.maximumMarks && <p className="text-xs font-bold text-slate-500">Maximum marks: {submission.assignment.maximumMarks}</p>}<p className="text-sm text-slate-600">{submission.feedback || "No additional feedback."}</p></div>}{submission.assignment?.markingSchemeLink && <a href={submission.assignment.markingSchemeLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-emerald-700"><ExternalLink size={15} />Open marking scheme</a>}</div>)}{submissions.length === 0 && <p className="mt-4 text-sm text-slate-500">No submissions yet.</p>}</div>
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
              <p className="mt-2 text-slate-500 font-semibold">Your board and class connect this account to the correct teachers, subjects, content and assessments.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><DetailBox icon={<School size={18} />} label="School" value={user?.school} color="blue" /><DetailBox icon={<GraduationCap size={18} />} label="Board" value={user?.board} color="indigo" /><DetailBox icon={<Hash size={18} />} label="Class" value={user?.studentClass} color="purple" /><DetailBox icon={<Mail size={18} />} label="Email" value={user?.email} color="rose" /></div>
              <button type="button" onClick={() => { setProfileError(""); setIsModalOpen(true); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white"><Edit3 size={16} /> Edit profile</button>
            </section>
          )}
        </div>
      </main>

      {/* --- EDIT PROFILE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeProfileModal}></div>
          
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Academic Profile</h2>
                  {requiresProfileSetup && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-600">Required</span>}
                </div>
                <p className="text-slate-500 text-sm font-medium">Select your board and class to continue.</p>
              </div>
              {!requiresProfileSetup && <button onClick={closeProfileModal} className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-full transition-all">
                <X size={20} />
              </button>}
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <PremiumInput label="Full Name" value={formData.name} icon={<User size={16}/>} onChange={(v) => setFormData({...formData, name: v})} />
              <div className="grid grid-cols-2 gap-5">
                <PremiumInput label="School (optional)" value={formData.school} icon={<School size={16}/>} onChange={(v) => setFormData({...formData, school: v})} />
                <PremiumSelect label="Board *" value={formData.board} icon={<GraduationCap size={16}/>} options={boards.map((board) => board.name)} placeholder="Select board" required onChange={(v) => setFormData({...formData, board: v})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <PremiumSelect label="Class *" value={formData.studentClass} icon={<Hash size={16}/>} options={Array.from({ length: 12 }, (_, index) => String(index + 1))} placeholder="Select class" required onChange={(v) => setFormData({...formData, studentClass: v})} />
                <PremiumInput label="Age (optional)" type="number" value={formData.age} icon={<Calendar size={16}/>} onChange={(v) => setFormData({...formData, age: v})} />
              </div>

              {profileError && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{profileError}</p>}
              <div className="flex gap-4 pt-6">
                {!requiresProfileSetup && <button
                  type="button" 
                  onClick={closeProfileModal}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Discard
                </button>}
                <button 
                  type="submit"
                  disabled={profileSaving || !formData.name || !formData.board || !formData.studentClass}
                  className="flex-[2] py-4 bg-indigo-600 rounded-2xl font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {paperViewer && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[200] bg-slate-950" />}>
          <PaperViewer
            viewer={paperViewer}
            watermark={`${user?.name || "Student"} • ${user?.email || user?.clerkId || "Aurethia"}`}
            onClose={() => setPaperViewer(null)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const PlanCard = ({ planName, expiry, onUpgrade }) => {
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
          <button type="button" onClick={onUpgrade} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-400 hover:text-white transition-all shadow-lg">
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
    <div className={`flex min-h-16 items-center gap-3 rounded-xl border p-3.5 ${themes[color]} cursor-default transition-all hover:shadow-sm`}>
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

const PremiumSelect = ({ label, value, icon, onChange, options, placeholder, required = false }) => (
  <div className="space-y-1.5 group">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest group-focus-within:text-indigo-600 transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>
      <select required={required} aria-required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full cursor-pointer appearance-none pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-slate-700">
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
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

const ResultItem = ({ subject, score, date }) => (
  <div className="flex justify-between items-center group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 rounded-full bg-emerald-400"></div>
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
