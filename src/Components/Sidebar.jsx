import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Aurethia_logo.avif"
import { useSelector } from "react-redux";
const Sidebar = () => {
  const navigate = useNavigate();
  const navigateQuiz = () => {
    navigate("/quiz");
  }
  const navigateTopical = () => {
    navigate("/home");
  }
  const { features, role } = useSelector((state) => state.user);
  const hasQuizAccess = role === "admin" || features.includes("mcq");
  return (
    <aside className="fixed top-0 left-0 w-60 h-screen bg-indigo-700 text-white p-6 overflow-y-auto">

      <div className="mb-10 flex  items-center">
        <img src={logo} alt="Aurethia Logo" className="w-15 h-15" />
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-white">
          Aurethia
        </span>
      </div>

      {/* Past Papers */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-blue-200 mb-3 uppercase">
          Past Papers
        </h3>
        <ul className="space-y-2">
          <li onClick={navigateTopical} className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            Topical Past Papers
          </li>
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            Yearly Past Papers
          </li>
          <li
            onClick={() => {
              if (!hasQuizAccess) {
                navigate("/pricingPage");
                return;
              }
              navigateQuiz();
            }}
            className={`p-2 rounded cursor-pointer ${hasQuizAccess
                ? "hover:bg-blue-800"
                : "opacity-50 cursor-not-allowed"
              }`}
          >
            MCQ Papers {!hasQuizAccess && "🔒"}
          </li>
        </ul>
      </div>

      {/* Build & Practice */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-blue-200 mb-3 uppercase">
          Build & Practice
        </h3>
        <ul className="space-y-2">
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            Build Exam
          </li>
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            Build Question List
          </li>
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            Free Worksheet
          </li>
        </ul>
      </div>

      {/* AI Section */}
      <div>
        <h3 className="text-sm font-semibold text-blue-200 mb-3 uppercase">
          exam-mate AI
        </h3>
        <ul className="space-y-2">
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            AI Mock Exam
          </li>
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            AI Exam Prediction
          </li>
          <li className="hover:bg-blue-800 p-2 rounded cursor-pointer">
            AI Revision Assistant
          </li>
        </ul>
      </div>

    </aside>
  );
};

export default Sidebar;