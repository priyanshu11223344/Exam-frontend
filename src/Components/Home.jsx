// Home.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SearchForm from './SearchForm.jsx';
import ResourceCard from './ResourceCard.jsx';
import Navbar from './Navbar.jsx';
const Home = () => {
  const { papers, loading } = useSelector(state => state.papers);
  const [hasSearched, setHasSearched] = useState(false);
  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);
  const { topics = [] } = useSelector((state) => state.topics);
  // const board_name=boards[0].name ||"";
  // const subject_name=subjects[0].name||"";
  // const topic_name=topics[0].name||"";
  // console.log({
  //   "board is":boards[0].name,
  //   "subject is":subjects[0].name,
  //   "topic is":topics[0].name
  // })
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
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
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">
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
        <ResourceCard resource={papers} board={boards[0].name} subject={subjects[0].name} topic={topics[0].name}></ResourceCard>

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
    <button className="fixed bottom-8 right-8 bg-indigo-600 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <i className="fas fa-question text-xl"></i>
      </button>
  </main>
  );
};

export default Home;
