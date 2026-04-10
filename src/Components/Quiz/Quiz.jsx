// Quiz.jsx
import React, { useState ,useEffect} from 'react';
import { useSelector,useDispatch } from 'react-redux';
import SearchForm from '../SearchForm.jsx'; // Reusing your existing search logic
import QuizCard from './QuizCard.jsx';     // Assuming you'll create a specific card for Quizzes
import Navbar from '../Navbar.jsx';
import Sidebar from '../Sidebar.jsx';
import QuizSearchForm from './QuizSearchFrom.jsx';
import { setQuizData } from '../../features/quiz/quizSlice.js';
import { fetchSubjects } from '../../features/subject/subjectSlice.js';
const Quiz = () => {
  // Replace 'papers' with your quiz state slice
  const { quizzes = [], loading } = useSelector(state => state.quizzes || {});
  const { subjects = [] } = useSelector((state) => state.subjects);
  console.log(quizzes);
  const filters = useSelector((state) => state.quizFilters);
  const [hasSearched, setHasSearched] = useState(false);
  const dispatch=useDispatch();
  useEffect(()=>{
    const savedQuiz=sessionStorage.getItem("quizData");
    if(savedQuiz){
      dispatch(setQuizData(JSON.parse(savedQuiz)))
      setHasSearched(true);
    }
  },[]);
  useEffect(()=>{
    if(filters.boardId){
      dispatch(fetchSubjects(filters.boardId));
    }
  },[filters.boardId]);
  const selectedSubject=subjects.find(
    (s)=>s._id===filters.subjectId
  );
  useEffect(() => {
    const checkAccess = async () => {
      try {
        await API.get("/feature/mcq");
      } catch {
        toast.error("Upgrade required");
        navigate("/pricingPage");
      }
    };
  
    checkAccess();
  }, []);
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full h-screen overflow-y-auto bg-amber-50 px-4 sm:px-6 lg:px-8">
        <Navbar />

        {/* Hero Header - Quiz Focused */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Test Your <span className="text-orange-600 underline decoration-orange-200 underline-offset-8">Knowledge</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Challenge yourself with topical quizzes. Select your board and subject below to generate a custom practice session.
          </p>
        </div>

        {/* Reusing SearchForm - You can pass different props if needed */}
        <div className="mb-16">
          <QuizSearchForm 
            onSearchSuccess={() => setHasSearched(true)} 
            placeholder="Search for a quiz topic..." 
          />
        </div>

        {/* Quiz Results Section */}
        <div className="space-y-8 bg-orange-100 border-2 border-orange-800 rounded-2xl p-6">
          <div className="flex items-center justify-between border-b border-orange-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {hasSearched ? 'Available Quizzes' : 'Recommended Challenges'}
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>{quizzes.length} Quizzes found</span>
              <div className="h-4 w-[1px] bg-slate-300"></div>
              <button className="flex items-center gap-1 hover:text-orange-600 font-medium transition-colors">
                Most Popular <i className="fas fa-chevron-down text-[10px]"></i>
              </button>
            </div>
          </div>
          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-slate-100"></div>
              ))}
            </div>
          ) : quizzes.length > 0 ? (
             <QuizCard  resource={quizzes} subject={selectedSubject?.name || ""} />
          ) : hasSearched ? (
            /* No Quizzes Found State */
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <div className="text-orange-300 mb-4 text-5xl">
                <i className="fas fa-vial-circle-check"></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No quizzes found for this topic</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Try a different subject or check back later for newly added interactive quizzes.
              </p>
            </div>
          ) : (
            /* Initial State - Before Search */
            <div className="text-center py-12">
               <p className="text-orange-800 font-medium italic">Select a subject above to begin your practice run!</p>
            </div>
          )}
        </div>
        {/* Quiz Specific Footer Info */}
        <footer className="mt-24 bg-slate-100 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 text-sm text-slate-700">
            <div>
              <h3 className="font-semibold mb-2 text-orange-700">How the Quiz Mode Works</h3>
              <p>
                Our quizzes are generated from real past paper questions. You'll get instant feedback 
                on your answers and a performance breakdown at the end of each session.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-orange-700">Track Your Progress</h3>
              <p>
                Every completed quiz is saved to your dashboard. Re-take quizzes to improve your 
                score and master difficult concepts.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 py-4 px-6 flex justify-between items-center text-sm text-slate-600">
            <span>2026 © Aurethia Quiz</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-600">Leaderboard</a>
              <a href="#" className="hover:text-orange-600">Help Center</a>
            </div>
          </div>
        </footer>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 bg-orange-600 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <i className="fas fa-lightning-bolt text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default Quiz;