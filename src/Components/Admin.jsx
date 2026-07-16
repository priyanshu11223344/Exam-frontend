import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  FileSpreadsheet,
  GraduationCap,
  Home,
  Layers,
  LayoutDashboard,
  Link as LinkIcon,
  ListChecks,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  WalletCards,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import { fetchBoards, createBoard } from "../features/board/boardSlice";
import { fetchSubjects, clearSubjects, createSubject } from "../features/subject/subjectSlice";
import { fetchTopics, createTopic } from "../features/topic/topicSlice";
import { uploadQuestions } from "../features/question/questionSlice";

const emptyRow = (base = {}) => ({
  id: Date.now() + Math.random(),
  board: base.board || "",
  subject: base.subject || "",
  topic: base.topic || "",
  subjects: base.subjects ? [...base.subjects] : [],
  topics: base.topics ? [...base.topics] : [],
  year: base.year || "",
  season: base.season || "",
  paperName: base.paperName || "",
  variant: base.variant || "1",
  questionNumber: "",
  questionPaper: "",
  markScheme: "",
  correctAnswer: "",
  explanation: "",
  specialComment: "",
});

const ADMIN_SECTION_IDS = [
  "overview",
  "content",
  "questions",
  "assignments",
  "teachers",
  "remarks",
  "students",
  "plans",
  "links",
];

const formatDate = (value) => {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const StatCard = ({ icon, label, value, tone, helper }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-slate-950">{value ?? 0}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        {React.createElement(icon, { size: 20 })}
      </div>
    </div>
    {helper && <p className="mt-3 text-sm text-slate-500">{helper}</p>}
  </div>
);

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { section } = useParams();
  const fileInputRef = useRef(null);
  const { boards = [] } = useSelector((state) => state.boards);
  const { subjects = [] } = useSelector((state) => state.subjects);

  const activeSection = ADMIN_SECTION_IDS.includes(section) ? section : "overview";
  const [questionMode, setQuestionMode] = useState("manual");
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [rows, setRows] = useState([emptyRow()]);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [tempData, setTempData] = useState({ name: "", link: "", boardId: "" });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentSubjects, setAssignmentSubjects] = useState([]);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [teacherData, setTeacherData] = useState({ teachers: [], assignments: [] });
  const [teacherRemarks, setTeacherRemarks] = useState([]);
  const [teacherSaving, setTeacherSaving] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    teacherId: "",
    teacherEmail: "",
    teacherName: "",
    board: "",
    classes: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    type: "quiz",
    board: "",
    className: "",
    subject: "",
    dueAt: "",
    durationMinutes: "60",
    instructions: "",
    year: "",
    season: "",
    paperName: "",
    variant: "1",
  });

  const counts = summary?.counts || {};
  const recentQuestions = summary?.recentQuestions || [];
  const recentUsers = summary?.recentUsers || [];
  const contentMap = summary?.contentMap || [];
  const plans = summary?.plans || [];
  const activePlans = plans.filter((plan) => plan.isActive);
  const currentYear = new Date().getFullYear();
  const fallbackYearOptions = useMemo(
    () => Array.from({ length: currentYear - 2009 }, (_, index) => String(currentYear - index)),
    [currentYear]
  );

  const assignmentClassOptions = useMemo(() => {
    const classes = new Set();

    teacherData.assignments
      .filter((entry) => !assignmentForm.board || entry.board === assignmentForm.board)
      .forEach((entry) => {
        (entry.classes || []).forEach((classEntry) => {
          const className = typeof classEntry === "string" ? classEntry : classEntry?.className;
          if (className) classes.add(String(className));
        });
      });

    recentUsers
      .filter((user) => !assignmentForm.board || !user.board || user.board === assignmentForm.board)
      .forEach((user) => {
        if (user.studentClass) classes.add(String(user.studentClass));
      });

    return Array.from(classes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [assignmentForm.board, recentUsers, teacherData.assignments]);

  const assignmentSubjectOptions = useMemo(() => {
    const subjectsById = new Map();
    const addSubject = (subject) => {
      const name = typeof subject === "string" ? subject : subject?.name;
      const id = typeof subject === "string" ? subject : subject?._id || name;
      if (name) subjectsById.set(id, { _id: id, name });
    };

    assignmentSubjects.forEach(addSubject);
    contentMap
      .find((board) => board.name === assignmentForm.board)
      ?.subjects?.forEach(addSubject);

    teacherData.assignments
      .filter((entry) => !assignmentForm.board || entry.board === assignmentForm.board)
      .forEach((entry) => {
        (entry.classes || []).forEach((classEntry) => {
          const className = typeof classEntry === "string" ? classEntry : classEntry?.className;
          if (assignmentForm.className && String(className) !== String(assignmentForm.className)) return;
          (classEntry?.subjects || []).forEach(addSubject);
        });
      });

    return Array.from(subjectsById.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [assignmentForm.board, assignmentForm.className, assignmentSubjects, contentMap, teacherData.assignments]);

  const assignmentYearOptions = useMemo(() => {
    const years = new Set();
    recentQuestions.forEach((question) => {
      const boardName = question.topic?.subject?.board?.name || question.board;
      const subjectName = question.topic?.subject?.name || question.subject;
      if (assignmentForm.board && boardName && boardName !== assignmentForm.board) return;
      if (assignmentForm.subject && subjectName && subjectName !== assignmentForm.subject) return;
      if (question.year) years.add(String(question.year));
    });

    const values = Array.from(years).sort((a, b) => Number(b) - Number(a));
    return values.length ? values : fallbackYearOptions;
  }, [assignmentForm.board, assignmentForm.subject, fallbackYearOptions, recentQuestions]);

  const loadTeachers = useCallback(async () => {
    try {
      const [teacherRes, remarksRes] = await Promise.all([
        API.get("/admin/teachers"),
        API.get("/admin/teacher-remarks"),
      ]);
      setTeacherData(teacherRes.data.data || { teachers: [], assignments: [] });
      setTeacherRemarks(remarksRes.data.data || []);
    } catch (error) {
      console.warn("Unable to load teacher data", error);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const [dashboardRes] = await Promise.all([
        API.get("/admin/dashboard-summary"),
        dispatch(fetchBoards()),
      ]);
      setSummary(dashboardRes.data.data);
      loadTeachers();
    } catch (error) {
      setSummaryError(error.response?.data?.error || "Unable to load admin dashboard");
    } finally {
      setSummaryLoading(false);
    }
  }, [dispatch, loadTeachers]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleAssignmentBoardChange = async (boardName) => {
    setAssignmentForm((current) => ({
      ...current,
      board: boardName,
      className: "",
      subject: "",
      year: "",
      paperName: "",
    }));
    setAssignmentSubjects([]);

    const selectedBoard = boards.find((board) => board.name === boardName);
    if (!selectedBoard) return;

    try {
      const fetchedSubjects = await dispatch(fetchSubjects(selectedBoard._id)).unwrap();
      setAssignmentSubjects(fetchedSubjects || []);
    } catch (error) {
      console.warn("Unable to load assignment subjects", error);
    }
  };

  const handleAssignmentClassChange = (className) => {
    const matchingAssignment = teacherData.assignments.find(
      (entry) =>
        (!assignmentForm.board || entry.board === assignmentForm.board) &&
        (entry.classes || []).some((classEntry) => {
          const savedClass = typeof classEntry === "string" ? classEntry : classEntry?.className;
          return String(savedClass) === String(className);
        })
    );
    const classEntry = matchingAssignment?.classes?.find((entry) => {
      const savedClass = typeof entry === "string" ? entry : entry?.className;
      return String(savedClass) === String(className);
    });
    const defaultSubject = classEntry?.subjects?.[0] || "";

    setAssignmentForm((current) => ({
      ...current,
      className,
      subject: defaultSubject,
      year: "",
    }));
  };

  const updateRow = async (id, field, value) => {
    if (field === "board") {
      const selectedBoard = boards.find((board) => board.name === value);
      const fetchedSubjects = selectedBoard
        ? await dispatch(fetchSubjects(selectedBoard._id)).unwrap()
        : [];

      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? {
                ...row,
                board: value,
                subject: "",
                topic: "",
                subjects: fetchedSubjects,
                topics: [],
              }
            : row
        )
      );
      return;
    }

    if (field === "subject") {
      const currentRow = rows.find((row) => row.id === id);
      const selectedSubject = currentRow?.subjects.find((subject) => subject.name === value);
      const fetchedTopics = selectedSubject
        ? await dispatch(fetchTopics(selectedSubject._id)).unwrap()
        : [];

      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? {
                ...row,
                subject: value,
                topic: "",
                topics: fetchedTopics,
              }
            : row
        )
      );
      return;
    }

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows((prevRows) => [...prevRows, emptyRow(lastRow)]);
  };

  const deleteRow = (id) => {
    if (rows.length > 1) setRows((prevRows) => prevRows.filter((row) => row.id !== id));
  };

  const handleManualUpload = async () => {
    const cleanedRows = rows.map((row) => {
      const cleanRow = { ...row };
      delete cleanRow.id;
      delete cleanRow.subjects;
      delete cleanRow.topics;
      return cleanRow;
    });

    for (const row of cleanedRows) {
      if (
        !row.board ||
        !row.subject ||
        !row.topic ||
        !row.year ||
        !row.paperName ||
        !row.questionNumber ||
        !row.questionPaper
      ) {
        alert("Please fill board, subject, topic, year, paper, question number and at least one question paper link.");
        return;
      }
    }

    try {
      const result = await dispatch(uploadQuestions(cleanedRows)).unwrap();
      alert(result?.message || "Questions uploaded successfully");
      setRows([emptyRow()]);
      loadDashboard();
    } catch (error) {
      alert(error?.error || error?.message || "Upload failed");
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files?.[0]) setFile(event.target.files[0]);
  };

  const handleUploadExcel = async () => {
    if (!file) {
      alert("Select an .xlsx file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setFileLoading(true);

    try {
      const response = await API.post("/admin/upload-excel", formData);
      alert(`${response.data.inserted} inserted, ${response.data.skipped} skipped, ${response.data.updated} updated`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.error || "Upload failed. Please check the spreadsheet format.");
    } finally {
      setFileLoading(false);
    }
  };

  const handleAddData = async () => {
    try {
      if (!tempData.name.trim()) {
        alert("Name is required");
        return;
      }

      if (activeModal === "board") {
        await dispatch(createBoard({ name: tempData.name.trim() })).unwrap();
      }

      if (activeModal === "subject") {
        if (!tempData.link) {
          alert("Select a board first");
          return;
        }
        await dispatch(createSubject({ name: tempData.name.trim(), boardId: tempData.link })).unwrap();
      }

      if (activeModal === "topic") {
        if (!tempData.link) {
          alert("Select a subject first");
          return;
        }
        await dispatch(createTopic({ name: tempData.name.trim(), subjectId: tempData.link })).unwrap();
      }

      setActiveModal(null);
      setTempData({ name: "", link: "", boardId: "" });
      loadDashboard();
    } catch (error) {
      alert(error?.error || error?.message || "Something went wrong");
    }
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();

    if (
      !assignmentForm.title ||
      !assignmentForm.type ||
      !assignmentForm.board ||
      !assignmentForm.className ||
      !assignmentForm.subject
    ) {
      alert("Title, type, board, class and subject are required.");
      return;
    }

    if (assignmentForm.type === "paper" && !assignmentFile) {
      alert("Upload a question paper for paper assignments.");
      return;
    }

    const formData = new FormData();
    Object.entries(assignmentForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (assignmentFile) {
      formData.append("questionPaper", assignmentFile);
    }

    setAssignmentSaving(true);
    try {
      await API.post("/exams/assignments", formData);
      alert("Exam assignment published");
      setAssignmentForm({
        title: "",
        type: "quiz",
        board: "",
        className: "",
        subject: "",
        dueAt: "",
        durationMinutes: "60",
        instructions: "",
        year: "",
        season: "",
        paperName: "",
        variant: "1",
      });
      setAssignmentFile(null);
    } catch (error) {
      alert(error.response?.data?.error || "Unable to publish assignment");
    } finally {
      setAssignmentSaving(false);
    }
  };

  const handleTeacherAssign = async (event) => {
    event.preventDefault();

    if ((!teacherForm.teacherId && !teacherForm.teacherEmail) || !teacherForm.board || !teacherForm.classes) {
      alert("Select or enter a teacher, board and at least one class.");
      return;
    }

    setTeacherSaving(true);
    try {
      await API.post("/admin/teachers/assign", {
        ...teacherForm,
        classes: teacherForm.classes
          .split(",")
          .map((className) => className.trim())
          .filter(Boolean),
      });
      setTeacherForm({ teacherId: "", teacherEmail: "", teacherName: "", board: "", classes: "" });
      await loadTeachers();
      await loadDashboard();
      alert("Teacher assignment saved");
    } catch (error) {
      alert(error.response?.data?.error || "Unable to assign teacher");
    } finally {
      setTeacherSaving(false);
    }
  };

  const saveSuperadminNote = async (sessionId, superadminNote) => {
    try {
      await API.put(`/admin/teacher-remarks/${sessionId}`, { superadminNote });
      await loadTeachers();
    } catch (error) {
      alert(error.response?.data?.error || "Unable to save note");
    }
  };

  const sections = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "content", label: "Content Map", icon: Boxes },
    { id: "questions", label: "Question Bank", icon: FileQuestion },
    { id: "assignments", label: "Assignments", icon: BookOpen },
    { id: "teachers", label: "Teachers", icon: GraduationCap },
    { id: "remarks", label: "Teacher Remarks", icon: MessageSquareText },
    { id: "students", label: "Students", icon: Users },
    { id: "plans", label: "Plans", icon: WalletCards },
    { id: "links", label: "App Links", icon: LinkIcon },
  ];

  const goToSection = (sectionId) => {
    navigate(`/admin/${sectionId}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aurethia</p>
                <h1 className="text-lg font-black">Admin Console</h1>
              </div>
            </div>
          </div>

          <nav className="p-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(section.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in as admin</p>
                <h2 className="text-2xl font-black">Operations Dashboard</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={loadDashboard}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw size={16} /> Refresh
                </button>
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  <Home size={16} /> Student App
                </Link>
                <Link
                  to="/UserDashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <GraduationCap size={16} /> Student Dashboard
                </Link>
                <Link
                  to="/TeacherDashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold text-white hover:bg-violet-700"
                >
                  <GraduationCap size={16} /> Teacher Dashboard
                </Link>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => goToSection(section.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                      activeSection === section.id
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <Icon size={16} /> {section.label}
                  </button>
                );
              })}
            </div>
          </header>

          <div className="p-4 md:p-8">
            {summaryError && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                <AlertCircle size={18} />
                {summaryError}
              </div>
            )}

            {summaryLoading && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
                <Loader2 size={18} className="animate-spin" />
                Loading admin data
              </div>
            )}

            {activeSection === "overview" && (
              <section className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={Boxes} label="Boards" value={counts.boards} tone="bg-blue-50 text-blue-700" helper={`${counts.subjects || 0} subjects linked`} />
                  <StatCard icon={Layers} label="Topics" value={counts.topics} tone="bg-emerald-50 text-emerald-700" helper={`${counts.paperNames || 0} paper labels`} />
                  <StatCard icon={FileQuestion} label="Questions" value={counts.questions} tone="bg-amber-50 text-amber-700" helper={`${counts.mcqQuestions || 0} MCQ enabled`} />
                  <StatCard icon={Users} label="Students" value={counts.users} tone="bg-rose-50 text-rose-700" helper={`${counts.paidUsers || 0} paid users`} />
                  <StatCard icon={GraduationCap} label="Teachers" value={counts.teachers} tone="bg-violet-50 text-violet-700" helper={`${teacherData.assignments.length || 0} class assignments`} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 p-4">
                      <div>
                        <h3 className="font-black">Recent Questions</h3>
                        <p className="text-sm text-slate-500">Newest content flowing into practice and quiz views</p>
                      </div>
                      <button onClick={() => goToSection("questions")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                        Manage
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {recentQuestions.length === 0 && <p className="p-4 text-sm text-slate-500">No questions found yet.</p>}
                      {recentQuestions.map((question) => (
                        <div key={question._id} className="grid gap-2 p-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <p className="font-bold text-slate-900">
                              {question.topic?.subject?.board?.name || "Board"} / {question.topic?.subject?.name || "Subject"} / {question.topic?.name || question.topicName || "Topic"}
                            </p>
                            <p className="text-sm text-slate-500">
                              {question.year} {question.season}, Paper {question.paperName?.name || "N/A"}, Variant {question.variant}, Q{question.questionNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            {question.isMCQ ? <CheckCircle2 size={16} className="text-emerald-600" /> : <ListChecks size={16} />}
                            {formatDate(question.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-black">System Health</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm font-semibold text-slate-600">Pending files</span>
                        <span className="font-black text-amber-700">{counts.pendingFiles || 0}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm font-semibold text-slate-600">Failed files</span>
                        <span className="font-black text-rose-700">{counts.failedFiles || 0}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm font-semibold text-slate-600">Active plans</span>
                        <span className="font-black text-emerald-700">{counts.activePlans || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "content" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black">Content Map</h3>
                    <p className="text-sm text-slate-500">Boards, subjects, topics and their links into the question bank</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveModal("board")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white"><Plus size={16} /> Board</button>
                    <button onClick={() => setActiveModal("subject")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><Plus size={16} /> Subject</button>
                    <button onClick={() => setActiveModal("topic")} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white"><Plus size={16} /> Topic</button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {contentMap.map((board) => (
                    <div key={board._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-black">{board.name}</h4>
                          <p className="text-sm text-slate-500">{board.subjectCount} subjects linked</p>
                        </div>
                        <button onClick={() => goToSection("questions")} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                          Add Questions
                        </button>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {board.subjects.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">No subjects under this board yet.</p>}
                        {board.subjects.map((subject) => (
                          <div key={subject._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                            <div>
                              <p className="font-bold">{subject.name}</p>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{subject.topicCount} topics</p>
                            </div>
                            <ChevronRight size={18} className="text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "questions" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black">Question Bank</h3>
                    <p className="text-sm text-slate-500">Create resource rows that power practice papers and MCQ workflows</p>
                  </div>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <button onClick={() => setQuestionMode("manual")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${questionMode === "manual" ? "bg-slate-950 text-white" : "text-slate-600"}`}><ListChecks size={16} /> Manual</button>
                    <button onClick={() => setQuestionMode("excel")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold ${questionMode === "excel" ? "bg-slate-950 text-white" : "text-slate-600"}`}><FileSpreadsheet size={16} /> Excel</button>
                  </div>
                </div>

                {questionMode === "manual" && (
                  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1180px] text-left">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="p-3">Category</th>
                            <th className="p-3">Paper Details</th>
                            <th className="p-3">Question & Scheme</th>
                            <th className="p-3">Analysis</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((row) => (
                            <tr key={row.id} className="align-top">
                              <td className="space-y-2 p-3">
                                <select value={row.board} onChange={(e) => updateRow(row.id, "board", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm">
                                  <option value="">Select Board</option>
                                  {boards.map((board) => <option key={board._id} value={board.name}>{board.name}</option>)}
                                </select>
                                <select value={row.subject} onChange={(e) => updateRow(row.id, "subject", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm">
                                  <option value="">Select Subject</option>
                                  {row.subjects.map((subject) => <option key={subject._id} value={subject.name}>{subject.name}</option>)}
                                </select>
                                <select value={row.topic} onChange={(e) => updateRow(row.id, "topic", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm">
                                  <option value="">Select Topic</option>
                                  {row.topics.map((topic) => <option key={topic._id} value={topic.name}>{topic.name}</option>)}
                                </select>
                              </td>
                              <td className="space-y-2 p-3">
                                <input type="number" placeholder="Year" value={row.year} onChange={(e) => updateRow(row.id, "year", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" />
                                <select value={row.season} onChange={(e) => updateRow(row.id, "season", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm">
                                  <option value="">Season</option>
                                  <option value="Summer">Summer</option>
                                  <option value="Winter">Winter</option>
                                  <option value="Spring">Spring</option>
                                  <option value="Fall">Fall</option>
                                </select>
                                <div className="grid grid-cols-[1fr_72px] gap-2">
                                  <select value={row.paperName} onChange={(e) => updateRow(row.id, "paperName", e.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm">
                                    <option value="">Paper</option>
                                    {["1", "2", "1(core)", "2(extended)", "3", "4", "5", "6"].map((paper) => <option key={paper} value={paper}>{paper}</option>)}
                                  </select>
                                  <select value={row.variant} onChange={(e) => updateRow(row.id, "variant", e.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm">
                                    <option value="1">V1</option>
                                    <option value="2">V2</option>
                                    <option value="3">V3</option>
                                  </select>
                                </div>
                              </td>
                              <td className="space-y-2 p-3">
                                <input type="number" placeholder="Q#" value={row.questionNumber} onChange={(e) => updateRow(row.id, "questionNumber", e.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-bold" />
                                <textarea placeholder="Question paper Drive link(s), | or new line" value={row.questionPaper} onChange={(e) => updateRow(row.id, "questionPaper", e.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                                <textarea placeholder="Mark scheme Drive link(s), | or new line" value={row.markScheme} onChange={(e) => updateRow(row.id, "markScheme", e.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                              </td>
                              <td className="space-y-2 p-3">
                                <input type="text" placeholder="Correct Answer" value={row.correctAnswer} onChange={(e) => updateRow(row.id, "correctAnswer", e.target.value)} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm" />
                                <textarea placeholder="Explanation link" value={row.explanation} onChange={(e) => updateRow(row.id, "explanation", e.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                                <textarea placeholder="Admin comment link" value={row.specialComment} onChange={(e) => updateRow(row.id, "specialComment", e.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                              </td>
                              <td className="p-3 text-center">
                                <button onClick={() => deleteRow(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete row">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                      <button onClick={addRow} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                        <Plus size={18} /> Add Row
                      </button>
                      <button onClick={handleManualUpload} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-black text-white">
                        <Upload size={18} /> Upload All Data
                      </button>
                    </div>
                  </div>
                )}

                {questionMode === "excel" && (
                  <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        const droppedFile = event.dataTransfer.files?.[0];
                        if (droppedFile?.name.endsWith(".xlsx")) setFile(droppedFile);
                        else alert("Please upload an .xlsx file");
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition ${
                        isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-400"
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
                      <FileSpreadsheet size={36} className="text-emerald-600" />
                      <p className="mt-3 font-black">{file ? file.name : "Drop Excel file here"}</p>
                      <p className="mt-1 text-sm text-slate-500">Use .xlsx imports for large question batches</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 md:flex-row">
                      <button disabled={!file || fileLoading} onClick={handleUploadExcel} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-500">
                        {fileLoading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        Confirm Upload
                      </button>
                      <button onClick={() => setFile(null)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeSection === "assignments" && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-xl font-black">Exam Assignments</h3>
                  <p className="text-sm text-slate-500">Publish quizzes or custom question papers to students by board and class</p>
                </div>

                <form onSubmit={handleAssignmentSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Title</span>
                      <input
                        value={assignmentForm.title}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, title: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                        placeholder="Physics mock test"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Type</span>
                      <select
                        value={assignmentForm.type}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, type: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <option value="quiz">Quiz from question bank</option>
                        <option value="paper">Custom question paper</option>
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Duration</span>
                      <input
                        type="number"
                        value={assignmentForm.durationMinutes}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, durationMinutes: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                        placeholder="60"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Board</span>
                      <select
                        value={assignmentForm.board}
                        onChange={(event) => handleAssignmentBoardChange(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <option value="">Select Board</option>
                        {boards.map((board) => (
                          <option key={board._id} value={board.name}>{board.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Class</span>
                      <select
                        value={assignmentForm.className}
                        onChange={(event) => handleAssignmentClassChange(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <option value="">Select Class</option>
                        {assignmentClassOptions.map((className) => (
                          <option key={className} value={className}>Grade {className}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Subject</span>
                      <select
                        value={assignmentForm.subject}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, subject: event.target.value, year: "" })}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <option value="">Select Subject</option>
                        {assignmentSubjectOptions.map((subject) => (
                          <option key={subject._id || subject.name} value={subject.name}>{subject.name}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Due date</span>
                      <input
                        type="datetime-local"
                        value={assignmentForm.dueAt}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, dueAt: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      />
                    </label>

                    {assignmentForm.type === "quiz" ? (
                      <>
                        <label className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Year</span>
                          <select
                            value={assignmentForm.year}
                            onChange={(event) => setAssignmentForm({ ...assignmentForm, year: event.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                          >
                            <option value="">Select Year</option>
                            {assignmentYearOptions.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Season</span>
                          <select
                            value={assignmentForm.season}
                            onChange={(event) => setAssignmentForm({ ...assignmentForm, season: event.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                          >
                            <option value="">Select Season</option>
                            <option value="Summer">Summer</option>
                            <option value="Winter">Winter</option>
                            <option value="Spring">Spring</option>
                            <option value="Fall">Fall</option>
                          </select>
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Paper</span>
                          <input
                            value={assignmentForm.paperName}
                            onChange={(event) => setAssignmentForm({ ...assignmentForm, paperName: event.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                            placeholder="1(core)"
                          />
                        </label>
                        <label className="space-y-1">
                          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Variant</span>
                          <select
                            value={assignmentForm.variant}
                            onChange={(event) => setAssignmentForm({ ...assignmentForm, variant: event.target.value })}
                            className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                          >
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                          </select>
                        </label>
                      </>
                    ) : (
                      <label className="space-y-1 lg:col-span-2">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Question Paper</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)}
                          className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                        />
                      </label>
                    )}

                    <label className="space-y-1 lg:col-span-3">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Instructions</span>
                      <textarea
                        value={assignmentForm.instructions}
                        onChange={(event) => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })}
                        className="h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm"
                        placeholder="Write any rules, time limit notes, or submission instructions."
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="submit"
                      disabled={assignmentSaving}
                      className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300"
                    >
                      {assignmentSaving ? "Publishing..." : "Publish Assignment"}
                    </button>
                  </div>
                </form>
              </section>
            )}

        {activeSection === "teachers" && (
          <section className="space-y-6">
            <div>
              <h3 className="text-xl font-black">Teachers</h3>
                  <p className="text-sm text-slate-500">Assign teachers to boards and classes. Teachers can publish papers, schedule classes and manage students in those classes.</p>
                </div>

                <form onSubmit={handleTeacherAssign} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-5">
                    <label className="space-y-1 lg:col-span-2">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Existing User</span>
                      <select
                        value={teacherForm.teacherId}
                        onChange={(event) => {
                          const selected = recentUsers.find((user) => user._id === event.target.value);
                          setTeacherForm({
                            ...teacherForm,
                            teacherId: event.target.value,
                            teacherEmail: selected?.email || teacherForm.teacherEmail,
                            teacherName: selected?.name || teacherForm.teacherName,
                          });
                        }}
                        className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <option value="">Select user or enter email below</option>
                        {recentUsers.map((user) => (
                          <option key={user._id} value={user._id}>{user.name || "User"} - {user.email}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Teacher Email</span>
                      <input value={teacherForm.teacherEmail} onChange={(event) => setTeacherForm({ ...teacherForm, teacherEmail: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Teacher Name</span>
                      <input value={teacherForm.teacherName} onChange={(event) => setTeacherForm({ ...teacherForm, teacherName: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Board</span>
                      <select value={teacherForm.board} onChange={(event) => setTeacherForm({ ...teacherForm, board: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm">
                        <option value="">Select Board</option>
                        {boards.map((board) => <option key={board._id} value={board.name}>{board.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1 lg:col-span-4">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Classes</span>
                      <input value={teacherForm.classes} onChange={(event) => setTeacherForm({ ...teacherForm, classes: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="10, 11, 12" />
                    </label>
                    <button disabled={teacherSaving} className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">
                      {teacherSaving ? "Saving..." : "Assign Teacher"}
                    </button>
                  </div>
                </form>

                <div className="grid gap-4 xl:grid-cols-2">
                  {teacherData.assignments.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No teachers assigned yet.</div>
                  )}
                  {teacherData.assignments.map((assignment) => {
                    const assignedClasses = Array.isArray(assignment.classes) ? assignment.classes : [];
                    const teacherEmail = assignment.teacherEmail || assignment.teacher?.email || "No email saved";

                    return (
                    <div key={assignment._id || `${teacherEmail}-${assignment.board}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-black">{assignment.teacherName || assignment.teacher?.name || "Teacher"}</h4>
                          <p className="text-sm font-semibold text-slate-500">{teacherEmail}</p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{assignment.board || "Board not set"}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {assignedClasses.length === 0 && (
                          <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                            No classes saved
                          </span>
                        )}
                        {assignedClasses.map((entry, index) => (
                          <span key={entry.className || index} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                            Grade {entry.className || entry}
                          </span>
                        ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </section>
            )}

            {activeSection === "remarks" && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-xl font-black">Teacher Remarks</h3>
                  <p className="text-sm text-slate-500">Every scheduled class is logged here for teacher and superadmin review.</p>
                </div>

                <div className="grid gap-4">
                  {teacherRemarks.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">No scheduled classes have been logged yet.</div>
                  )}
                  {teacherRemarks.map((session) => (
                    <div key={session._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h4 className="font-black">{session.title}</h4>
                          <p className="text-sm font-semibold text-slate-500">
                            {session.teacherName || session.teacher?.name || "Teacher"} - {session.board} Grade {session.className} - {session.subject}
                          </p>
                          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{new Date(session.startsAt).toLocaleString()}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{session.status}</span>
                      </div>
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Teacher taught</p>
                          <p className="mt-2 text-sm text-slate-700">{session.teacherRemark || "No remark added yet."}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Issues / follow-ups</p>
                          <p className="mt-2 text-sm text-slate-700">{session.teacherIssues || "No issues logged."}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 md:flex-row">
                        <input
                          defaultValue={session.superadminNote || ""}
                          placeholder="Superadmin note for this class"
                          className="flex-1 rounded-lg border border-slate-200 p-3 text-sm"
                          onBlur={(event) => {
                            if (event.target.value !== (session.superadminNote || "")) {
                              saveSuperadminNote(session._id, event.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "students" && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-xl font-black">Students</h3>
                  <p className="text-sm text-slate-500">Recent learners, profile details and subscription status</p>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">School</th>
                          <th className="p-3">Class</th>
                          <th className="p-3">Plan</th>
                          <th className="p-3">Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentUsers.length === 0 && (
                          <tr><td className="p-4 text-sm text-slate-500" colSpan="5">No users found.</td></tr>
                        )}
                        {recentUsers.map((user) => (
                          <tr key={user._id}>
                            <td className="p-3">
                              <p className="font-bold">{user.name || "Student"}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </td>
                            <td className="p-3 text-sm text-slate-600">{user.school || "Not set"}</td>
                            <td className="p-3 text-sm text-slate-600">{user.studentClass || "Not set"}</td>
                            <td className="p-3">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{user.planName || "Free"}</span>
                            </td>
                            <td className="p-3 text-sm text-slate-600">{formatDate(user.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "plans" && (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-black">Plans & Access</h3>
                    <p className="text-sm text-slate-500">Subscription plans and feature gates used by the pricing and quiz screens</p>
                  </div>
                  <Link to="/pricingPage" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-bold text-white">
                    Open Pricing <ChevronRight size={16} />
                  </Link>
                </div>
                <div className="grid gap-4 xl:grid-cols-3">
                  {activePlans.map((plan) => (
                    <div key={plan._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-black">{plan.name}</h4>
                          <p className="text-sm text-slate-500">{plan.features?.length || 0} features</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Active</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {plan.durations?.map((duration) => (
                          <div key={duration._id || duration.label} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                            <span className="font-bold">{duration.label}</span>
                            <span className="font-black">Rs {duration.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {plan.features?.map((feature) => (
                          <span key={feature} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{feature}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "links" && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-xl font-black">Connected App Links</h3>
                  <p className="text-sm text-slate-500">Fast jumps between admin work and the user-facing flows it affects</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    { to: "/home", icon: Home, title: "Practice Home", text: "Verify board, subject, topic and paper filters." },
                    { to: "/quiz", icon: BarChart3, title: "Quiz", text: "Check MCQ feature access and quiz question output." },
                    { to: "/UserDashboard", icon: GraduationCap, title: "Student Dashboard", text: "Review profile, plan and learning overview." },
                    { to: "/TeacherDashboard", icon: GraduationCap, title: "Teacher Dashboard", text: "Open the teacher workspace for class, paper and remark workflows." },
                    { to: "/pricingPage", icon: WalletCards, title: "Pricing", text: "Inspect plans, durations and feature gates." },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.to} to={item.to} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <Icon size={24} className="text-blue-700" />
                        <h4 className="mt-4 font-black">{item.title}</h4>
                        <p className="mt-2 text-sm text-slate-500">{item.text}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Content setup</p>
                <h3 className="text-xl font-black capitalize">Add {activeModal}</h3>
              </div>
              <Settings size={20} className="text-slate-400" />
            </div>

            <input
              type="text"
              placeholder={`${activeModal} name`}
              value={tempData.name}
              onChange={(event) => setTempData({ ...tempData, name: event.target.value })}
              className="mb-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
            />

            {activeModal === "subject" && (
              <select value={tempData.link} onChange={(event) => setTempData({ ...tempData, link: event.target.value })} className="mb-3 w-full rounded-lg border border-slate-200 p-3 text-sm">
                <option value="">Select Board</option>
                {boards.map((board) => <option key={board._id} value={board._id}>{board.name}</option>)}
              </select>
            )}

            {activeModal === "topic" && (
              <>
                <select
                  value={tempData.boardId}
                  onChange={(event) => {
                    const boardId = event.target.value;
                    setTempData({ ...tempData, boardId, link: "" });
                    dispatch(clearSubjects());
                    if (boardId) dispatch(fetchSubjects(boardId));
                  }}
                  className="mb-3 w-full rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => <option key={board._id} value={board._id}>{board.name}</option>)}
                </select>
                <select value={tempData.link} onChange={(event) => setTempData({ ...tempData, link: event.target.value })} className="mb-3 w-full rounded-lg border border-slate-200 p-3 text-sm">
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name}</option>)}
                </select>
              </>
            )}

            <div className="mt-5 flex gap-2">
              <button onClick={() => setActiveModal(null)} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Cancel</button>
              <button onClick={handleAddData} className="flex-1 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
