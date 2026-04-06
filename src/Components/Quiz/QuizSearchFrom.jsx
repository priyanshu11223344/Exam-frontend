import React, { useEffect, useRef, useState, memo } from "react";

const MultiDropdown = memo(
  ({ label, field, options, disabled, filters, dispatch, setFilter, openDropdown, setOpenDropdown }) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target)
        ) {
          if (openDropdown === field) {
            setOpenDropdown(null);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown, field, setOpenDropdown]);

    const toggleMultiSelect = (value) => {
      const stringValue = String(value);
      const current = (filters[field] || []).map(String);

      const updated = current.includes(stringValue)
        ? current.filter((v) => v !== stringValue)
        : [...current, stringValue];

      dispatch(setFilter({ name: field, value: updated }));
    };

    return (
      <div className="relative" ref={wrapperRef}>
        <label className="block mb-1">{label}</label>

        <div
          onClick={() =>
            !disabled &&
            setOpenDropdown(openDropdown === field ? null : field)
          }
          className={`w-full border rounded-xl px-4 py-2 bg-white flex justify-between items-center cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="text-sm">
            {filters[field]?.length
              ? `${filters[field].length} selected`
              : `Select ${label}`}
          </span>
          <span>▾</span>
        </div>

        {openDropdown === field && (
          <div className="absolute z-30 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto p-3 space-y-2">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filters[field] || []).includes(
                    String(opt.value)
                  )}
                  onChange={() => toggleMultiSelect(opt.value)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }
);

import { useDispatch, useSelector } from "react-redux";
import { fetchBoards } from "../../features/board/boardSlice";
import { fetchSubjects, clearSubjects } from "../../features/subject/subjectSlice";
import { fetchTopics, clearTopics } from "../../features/topic/topicSlice";
import { fetchQuizzes } from "../../features/quiz/quizSlice";
import { fetchPaperNames } from "../../features/paperName/paperNameSlice";
import { years } from "../../constants";
import {
  setQuizFilter,
  resetQuizAfterBoard,
  resetQuizAfterSubject,
} from "../../features/filter/quizFilterSlice";

const QuizSearchForm = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.quizFilters);
  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);
  const { paperNames = [] } = useSelector((state) => state.paperName);

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  // Paper Numbers
  const allowedPaperNumbers = ["1", "2", "1(core)", "2(extended)"];

const paperNumbers = [
  ...new Set(
    paperNames
      .map((p) => p.name?.trim())
      .filter((name) => allowedPaperNumbers.includes(name))
  ),
];

  const filteredPaperNames = paperNames.filter(
    (p) => p.name === filters.paperNumber
  );

  const variants = [1, 2, 3];

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "boardId") {
      dispatch(clearSubjects());
      dispatch(clearTopics());
      dispatch(fetchSubjects(value));
  
      // 🔥 IMPORTANT: STORE VALUE
      dispatch(setQuizFilter({ name: "boardId", value }));
  
      return;
    }
  
    if (name === "subjectId") {
      dispatch(clearTopics());
      dispatch(fetchTopics(value));
      dispatch(fetchPaperNames(value));
  
      // 🔥 IMPORTANT: STORE VALUE
      dispatch(setQuizFilter({ name: "subjectId", value }));
  
      return;
    }
  
    if (name === "paperNumber") {
      dispatch(setQuizFilter({ name: "paperNumber", value }));
      dispatch(setQuizFilter({ name: "variant", value: [] }));
      return;
    }
  
    if (name === "variant") {
      dispatch(setQuizFilter({ name: "variant", value: [Number(value)] }));
      return;
    }
  
    dispatch(setQuizFilter({ name, value }));
  };

  const handleSearch = () => {
    console.log("Filters before API:", filters); // DEBUG
    dispatch(fetchQuizzes(filters));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
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
        {/* <MultiDropdown
          label="Topic"
          field="topicIds"
          
          options={topics.map((t) => ({
            value: String(t._id),
            label: t.name,
          }))}
          filters={filters}
          dispatch={dispatch}
          setFilter={setQuizFilter}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        /> */}

        {/* Year */}
        <MultiDropdown
          label="Year"
          field="years"
          options={years.map((y) => ({
            value: String(y),
            label: y,
          }))}
          filters={filters}
          dispatch={dispatch}
          setFilter={setQuizFilter}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

        {/* Season */}
        <MultiDropdown
          label="Season"
          field="seasons"
          options={[
            { value: "Summer", label: "Summer" },
            { value: "Winter", label: "Winter" },
            { value: "Spring", label: "Spring" },
          ]}
          filters={filters}
          dispatch={dispatch}
          setFilter={setQuizFilter}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

        {/* ✅ Paper Number MULTI */}
        <MultiDropdown
          label="Paper Number"
          field="paperNumber"
          disabled={!filters.subjectId}
          options={paperNumbers.map((num) => ({
            value: String(num),
            label: num,
          }))}
          filters={filters}
          dispatch={dispatch}
          setFilter={setQuizFilter}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

        {/* ✅ Variant MULTI */}
        <MultiDropdown
          label="Paper Variant"
          field="variant"
          options={variants.map((v) => ({
            value: String(v),
            label: `Variant ${v}`,
          }))}
          filters={filters}
          dispatch={dispatch}
          setFilter={setQuizFilter}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />

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

export default QuizSearchForm;