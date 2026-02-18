import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchBoards } from "../features/board/boardSlice";
import { fetchSubjects, clearSubjects } from "../features/subject/subjectSlice";
import { fetchTopics, clearTopics } from "../features/topic/topicSlice";
import { fetchPapers } from "../features/paper/paperSlice";
import { years } from "../constants";
import {
  setFilter,
  resetAfterBoard,
  resetAfterSubject,
} from "../features/filter/filterSlice";

const SearchForm = () => {
  const dispatch = useDispatch();

  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);
  const { topics = [] } = useSelector((state) => state.topics);
  const filters = useSelector((state) => state.filters);

  // Load boards on mount
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Board changed
    if (name === "boardId") {
      dispatch(clearSubjects());
      dispatch(clearTopics());
      dispatch(fetchSubjects(value));
      dispatch(resetAfterBoard(value));
      return;
    }

    // Subject changed
    if (name === "subjectId") {
      dispatch(clearTopics());
      dispatch(fetchTopics(value));
      dispatch(resetAfterSubject(value));
      return;
    }

    // Normal fields
    dispatch(setFilter({ name, value }));
  };

  const handleSearch = () => {
    if (!filters.topicId) {
      alert("Please select a topic first");
      return;
    }
  
    dispatch(fetchPapers(filters));
    onSearchSuccess?.(); // optional chaining
  };
  

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">
        Find Past Papers & Resources
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Board */}
        <div>
          <label>Exam Board</label>
          <select
            name="boardId"
            value={filters.boardId}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Select Board</option>
            {boards.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label>Subject</label>
          <select
            name="subjectId"
            value={filters.subjectId}
            onChange={handleChange}
            disabled={!filters.boardId}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div>
          <label>Topic</label>
          <select
            name="topicId"
            value={filters.topicId}
            onChange={handleChange}
            disabled={!filters.subjectId}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Select Topic</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label>Year</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Any Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Season */}
        <div>
          <label>Season</label>
          <select
            name="season"
            value={filters.season}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-2"
          >
            <option value="">Any Season</option>
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
          </select>
        </div>

        {/* Paper Number */}
        <div>
          <label>Paper Number</label>
          <input
            type="number"
            name="paperNumber"
            value={filters.paperNumber}
            onChange={handleChange}
            placeholder="e.g. 1"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        {/* Variant */}
        <div>
          <label>Variant</label>
          <input
            type="number"
            name="variant"
            value={filters.variant}
            onChange={handleChange}
            placeholder="e.g. 2"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-indigo-600 text-white py-2 rounded-xl"
          >
            Search Resources
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
