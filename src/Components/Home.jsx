// Home.jsx
import React, { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from './SearchForm.jsx';
import ResourceCard from './ResourceCard.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import { setPapers } from '../features/paper/paperSlice.js';
import { fetchSubjects } from "../features/subject/subjectSlice";
import { fetchTopics } from "../features/topic/topicSlice";
import { fetchPaperNames } from "../features/paperName/paperNameSlice";

const Home = () => {
  const { papers, loading } = useSelector(state => state.papers);
  const [hasSearched, setHasSearched] = useState(false);
  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);
  const { topics = [] } = useSelector((state) => state.topics);
  const filters = useSelector((state) => state.filters);
  const selectedBoard = boards.find(b => b._id === filters.boardId);
const selectedSubject = subjects.find(s => s._id === filters.subjectId);
  // const board_name=boards[0].name ||"";
  // const subject_name=subjects[0].name||"";
  // const topic_name=topics[0].name||"";
  // console.log({
  //   "board is":boards[0].name,
  //   "subject is":subjects[0].name,
  //   "topic is":topics[0].name
  // })
  const dispatch=useDispatch();
  useEffect(()=>{
    const savedPapers=sessionStorage.getItem("papers");
    if(savedPapers){
      dispatch(setPapers(JSON.parse(savedPapers)));
    }
  },[])
  useEffect(() => {
    // 🔹 If board exists → fetch subjects
    if (filters.boardId) {
      dispatch(fetchSubjects(filters.boardId));
    }
  
    // 🔹 If subject exists → fetch topics + paperNames
    if (filters.subjectId) {
      dispatch(fetchTopics(filters.subjectId));
      dispatch(fetchPaperNames(filters.subjectId));
    }
  }, [filters.boardId, filters.subjectId]);
  return (
    <div className="flex">
   <Sidebar/>

  <div className="ml-64 w-full h-screen overflow-y-auto bg-blue-50 px-4 sm:px-6 lg:px-8">
     
    <Navbar/>
    {/* Hero Header */}
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Level Up Your <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Exam Game</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
        Access thousands of past papers, mark schemes, and detailed explanations from major exam boards.
      </p>
    </div>

    {/* Search Form Section */}
    <div className="mb-16">
      <SearchForm onSearchSuccess={() => setHasSearched(true)} />
    </div>

    {/* Results Section */}
    <div className="space-y-8 bg-blue-100 border-2 border-blue-800 rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl px-2  font-bold text-slate-800">
          {hasSearched ? 'Search Results' : 'Featured Resources'}
        </h2>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{papers.length} resources found</span>
          <div className="h-4 w-[1px] bg-slate-300"></div>
          <button className="flex items-center gap-1 hover:text-indigo-600 font-medium transition-colors">
            Sort by Recent <i className="fas fa-chevron-down text-[10px]"></i>
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

      ) : papers.length > 0 ? (

        // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        //   {/* {papers.map(res => (
        //     <ResourceCard key={res._id} resource={res} />
        //   ))} */}
        //    <ResourceCard  resource={papers} />
        // </div>
        <ResourceCard 
  resource={papers} 
  board={selectedBoard?.name || ""} 
  subject={selectedSubject?.name || ""} 
  topic={topics[0]?.name || ""}
/>
        

      ) : hasSearched ? (

        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-slate-300 mb-4 text-5xl">
            <i className="fas fa-search-minus"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No matching papers found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Try adjusting your filters or search for a different subject or topic to find available resources.
          </p>
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
          {/* Show nothing until first search */}
        </div>

      )}
    </div>
    {/* Footer */}
<footer className="mt-24 bg-slate-100 border-t border-slate-200">
  <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 text-sm text-slate-700">
    
    <div>
      <h3 className="font-semibold mb-2">Smarter Exam Revision with Topical Past Papers</h3>
      <p>
        Topical Past Papers help students focus their revision by instantly filtering
        questions by topic — such as Algebra, Trigonometry, or Geometry. This targeted
        approach makes study sessions more efficient and personalized.
      </p>

      <h3 className="font-semibold mt-6 mb-2">Personalized Study Tools</h3>
      <p>
        With one click, users can save questions, build custom lists, and return to them
        anytime. This makes it easy to track progress and revisit weak areas for focused
        improvement.
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">Flexible Filtering Options</h3>
      <p>
        Users can refine their practice by paper type, exam year, and season. Whether
        preparing for mock exams or building skills gradually, the platform supports
        both ordered and randomized question modes.
      </p>

      <h3 className="font-semibold mt-6 mb-2">Designed for Both Students and Teachers</h3>
      <p>
        While students use topical filtering to master specific concepts, teachers can
        gather ready-made materials for quizzes, assignments, and class discussions —
        saving time and boosting classroom impact.
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">Clean Display for Better Focus</h3>
      <p>
        All questions are displayed directly on the site with clear, distraction-free
        formatting. Students can easily switch between official mark schemes and
        AI-generated solutions for a deeper understanding.
      </p>
    </div>

  </div>

  <div className="border-t border-slate-200 py-4 px-6 flex justify-between items-center text-sm text-slate-600">
    <span>2026 © Aurethia</span>
    <div className="flex gap-6">
      <a href="#" className="hover:text-indigo-600">T&C</a>
      <a href="#" className="hover:text-indigo-600">Blogs</a>
    </div>
  </div>
</footer>
    <button className="fixed bottom-8 right-8 bg-indigo-600 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <i className="fas fa-question text-xl"></i>
      </button>
     </div>
  </div>
  );
};

export default Home;
