import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  User, 
  LogOut, 
  Clock, 
  ChevronRight,
  Bell
} from 'lucide-react';

const UserDashboard = () => {
  // Mock Data (In a real app, these would come from an API)
  const stats = [
    { label: "Exams Taken", value: "12", color: "text-blue-600" },
    { label: "Avg. Score", value: "85%", color: "text-green-600" },
    { label: "Pending", value: "2", color: "text-orange-500" },
  ];

  const upcomingExams = [
    { id: 1, title: "Advanced Mathematics", time: "Today, 04:00 PM", duration: "60 mins" },
    { id: 2, title: "Operating Systems", time: "Tomorrow, 10:00 AM", duration: "90 mins" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-indigo-900 text-white hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-800 flex items-center gap-2">
          <BookOpen className="text-indigo-400" />
          <span>ExamApp</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarItem icon={<BookOpen size={20}/>} label="My Exams" />
          <SidebarItem icon={<Trophy size={20}/>} label="Results" />
          <SidebarItem icon={<User size={20}/>} label="Profile" />
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <button className="flex items-center gap-2 text-indigo-300 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Alex!</h1>
            <p className="text-sm text-gray-500">Here's what's happening with your exams today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">Alex Johnson</p>
                <p className="text-xs text-gray-500">Student ID: #9921</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Alex+Johnson&background=4f46e5&color=fff" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Exams Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Upcoming Exams</h2>
                <button className="text-indigo-600 text-sm font-semibold hover:underline">View All</button>
              </div>
              
              <div className="grid gap-4">
                {upcomingExams.map(exam => (
                  <div key={exam.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-500">{exam.time} • {exam.duration}</p>
                      </div>
                    </div>
                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                      Start Test
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Performance (Side Card) */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Recent Results</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 space-y-4">
                  <ResultItem subject="Physics 101" score="92/100" date="2 days ago" />
                  <ResultItem subject="Data Structures" score="78/100" date="1 week ago" />
                  <ResultItem subject="UI/UX Design" score="88/100" date="2 weeks ago" />
                </div>
                <button className="w-full py-3 bg-gray-50 text-sm font-medium text-gray-600 border-t hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                  Download All Transcripts <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Sub-Components ---

const SidebarItem = ({ icon, label, active = false }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-900/50' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
);

const ResultItem = ({ subject, score, date }) => (
  <div className="flex justify-between items-center group cursor-pointer">
    <div>
      <p className="font-semibold text-gray-800">{subject}</p>
      <p className="text-xs text-gray-400">{date}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-bold text-indigo-600">{score}</p>
      <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Passed</p>
    </div>
  </div>
);

export default UserDashboard;