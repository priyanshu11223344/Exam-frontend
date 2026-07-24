import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  FileQuestion,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCw,
  School,
  Trash2,
  Upload,
  Users,
  FolderOpen,
  MessageCircle,
  ExternalLink,
  X,
  ClipboardCheck,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import Logo from "../assets/Aurethia_logo.avif";
import SearchableSelect from "./SearchableSelect";

const TEACHER_TAB_IDS = ["overview", "papers", "calendar", "remarks", "submissions"];

const initialSession = {
  title: "",
  board: "",
  className: "",
  subject: "",
  startsAt: "",
  endsAt: "",
  meetingLink: "",
  topicTaught: "",
  specificComments: "",
  studentFeedback: "",
};

const initialAssignment = {
  title: "",
  type: "paper",
  board: "",
  className: "",
  subject: "",
  targetStudentEmail: "",
  dueAt: "",
  durationMinutes: "60",
  instructions: "",
  year: "",
  season: "",
  paperName: "",
  variant: "1",
  testLink: "",
  maximumMarks: "",
  markingSchemeLink: "",
};

const emptyQuestionRow = (board = "") => ({
  id: Date.now() + Math.random(),
  board,
  subject: "",
  topic: "",
  year: "",
  season: "",
  paperName: "",
  variant: "1",
  questionNumber: "",
  questionPaper: "",
  markScheme: "",
  correctAnswer: "",
  explanation: "",
  specialComment: "",
});

const TeacherDashboard = () => {
  const { signOut, getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = TEACHER_TAB_IDS.includes(tab) ? tab : "overview";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState({ assignment: null, assignments: [], students: [], sessions: [] });
  const [sessionForm, setSessionForm] = useState(initialSession);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [questionRows, setQuestionRows] = useState([emptyQuestionRow()]);
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState("");
  const [workspaceKey, setWorkspaceKey] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState("students");
  const [classroomResources, setClassroomResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ title: "", description: "", driveUrl: "", deadline: "" });
  const [studentComment, setStudentComment] = useState({ studentId: "", comment: "" });
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [gradeDrafts, setGradeDrafts] = useState({});

  const teacherEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";
  const teacherName = clerkUser?.fullName || clerkUser?.firstName || "Teacher";
  const assignment = context.assignment;
  const teacherAssignments = useMemo(
    () => context.assignments?.length ? context.assignments : (assignment ? [assignment] : []),
    [assignment, context.assignments]
  );
  const boardOptions = useMemo(
    () => [...new Set(teacherAssignments.map((entry) => entry.board).filter(Boolean))].sort(),
    [teacherAssignments]
  );

  const classOptions = useMemo(() => {
    return teacherAssignments.flatMap((teacherAssignment) =>
      (teacherAssignment.classes || []).map((entry) => ({
        board: teacherAssignment.board,
        className: entry.className,
        subjects: entry.subjects?.length ? entry.subjects : ["General"],
      }))
    );
  }, [teacherAssignments]);

  const workspaces = useMemo(() => classOptions.flatMap((entry) =>
    entry.subjects.map((subject) => ({
      key: `${entry.board}::${entry.className}::${subject}`,
      board: entry.board,
      className: entry.className,
      subject,
    }))
  ), [classOptions]);
  const selectedWorkspace = workspaces.find((item) => item.key === workspaceKey) || workspaces[0];

  const assignmentSubjectOptions = useMemo(() => {
    const selectedClass = classOptions.find(
      (entry) =>
        entry.board === assignmentForm.board &&
        String(entry.className) === String(assignmentForm.className)
    );
    return [...new Set((selectedClass?.subjects || []).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [assignmentForm.board, assignmentForm.className, classOptions]);

  const assignmentClassOptions = useMemo(
    () => classOptions.filter((entry) => entry.board === assignmentForm.board),
    [assignmentForm.board, classOptions]
  );

  const sessionSubjectOptions = useMemo(() => {
    return classOptions.find(
      (entry) =>
        entry.board === sessionForm.board &&
        String(entry.className) === String(sessionForm.className)
    )?.subjects || [];
  }, [sessionForm.board, sessionForm.className, classOptions]);

  const sessionClassOptions = useMemo(
    () => classOptions.filter((entry) => entry.board === sessionForm.board),
    [classOptions, sessionForm.board]
  );

  const questionSubjectsForBoard = (board) => [...new Set(
    classOptions
      .filter((entry) => entry.board === board)
      .flatMap((entry) => entry.subjects || [])
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));

  const assignmentStudentOptions = useMemo(() => {
    return (context.students || [])
      .filter((student) => !assignmentForm.board || student.board === assignmentForm.board)
      .filter((student) => !assignmentForm.className || String(student.studentClass || "") === String(assignmentForm.className))
      .sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""));
  }, [assignmentForm.board, assignmentForm.className, context.students]);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2009 }, (_, index) => String(currentYear - index));
  }, []);

  const loadTeacher = async () => {
    if (!teacherEmail) return;

    setLoading(true);
    setError("");
    try {
      const response = await API.get("/teachers/me", {
        params: { email: teacherEmail },
        headers: {
          "X-Local-User-Email": teacherEmail,
          "X-Local-User-Name": teacherName,
          "X-Local-User-Role": "teacher",
        },
      });
      setContext(response.data.data);
      const token = await getToken();
      const submissionResponse = await API.get("/classroom/submissions", { params: { teacherEmail, limit: 100 }, headers: { Authorization: `Bearer ${token}` } });
      setTeacherSubmissions(submissionResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load teacher dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && teacherEmail) {
      loadTeacher();
    }
  }, [isLoaded, teacherEmail]);

  useEffect(() => {
    if (!workspaceKey && workspaces[0]) setWorkspaceKey(workspaces[0].key);
  }, [workspaceKey, workspaces]);

  useEffect(() => {
    const loadResources = async () => {
      if (!selectedWorkspace || !teacherEmail) return;
      const token = await getToken();
      const response = await API.get("/classroom/resources", { params: {
        teacherEmail,
        board: selectedWorkspace.board,
        className: selectedWorkspace.className,
        subject: selectedWorkspace.subject,
      }, headers: { Authorization: `Bearer ${token}` }});
      setClassroomResources(response.data.data || []);
    };
    loadResources().catch((err) => setError(err.response?.data?.error || "Unable to load class content"));
  }, [selectedWorkspace?.key, teacherEmail]);

  const publishResource = async (event) => {
    event.preventDefault();
    if (!selectedWorkspace) return;
    setSaving(true);
    try {
      const token = await getToken();
      await API.post("/classroom/resources", {
        ...resourceForm,
        teacherEmail,
        teacherName,
        board: selectedWorkspace.board,
        className: selectedWorkspace.className,
        subject: selectedWorkspace.subject,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setResourceForm({ title: "", description: "", driveUrl: "", deadline: "" });
      const response = await API.get("/classroom/resources", { params: {
        teacherEmail, board: selectedWorkspace.board, className: selectedWorkspace.className, subject: selectedWorkspace.subject,
      }, headers: { Authorization: `Bearer ${token}` }});
      setClassroomResources(response.data.data || []);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to add class content");
    } finally {
      setSaving(false);
    }
  };

  const saveStudentComment = async (student) => {
    if (!studentComment.comment.trim() || studentComment.studentId !== student._id) return;
    try {
      const token = await getToken();
      await API.post("/classroom/student-notes", {
        teacherEmail,
        studentId: student._id,
        board: selectedWorkspace.board,
        className: selectedWorkspace.className,
        subject: selectedWorkspace.subject,
        comment: studentComment.comment,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStudentComment({ studentId: "", comment: "" });
      alert("Student comment saved");
    } catch (err) {
      alert(err.response?.data?.error || "Unable to save comment");
    }
  };

  const gradeSubmission = async (submission) => {
    const draft = gradeDrafts[submission._id] || {};
    try {
      const token = await getToken();
      await API.put(`/classroom/submissions/${submission._id}/grade`, { teacherEmail, grade: draft.grade, feedback: draft.feedback }, { headers: { Authorization: `Bearer ${token}` } });
      await loadTeacher();
      setGradeDrafts((current) => ({ ...current, [submission._id]: {} }));
    } catch (err) {
      alert(err.response?.data?.error || "Unable to grade submission");
    }
  };

  const openLessonForDate = (dateValue) => {
    if (!selectedWorkspace) return;
    setSessionForm({
      ...initialSession,
      board: selectedWorkspace.board,
      className: selectedWorkspace.className,
      subject: selectedWorkspace.subject,
      startsAt: `${dateValue}T09:00`,
      title: `${selectedWorkspace.subject} lesson`,
    });
    setLessonModalOpen(true);
  };

  const applyClassToForm = (className, setter) => {
    setter((current) => ({
      ...current,
      className,
      subject:
        classOptions.find(
          (entry) => entry.board === current.board && String(entry.className) === String(className)
        )?.subjects?.[0] || "",
      ...(Object.prototype.hasOwnProperty.call(current, "targetStudentEmail") ? { targetStudentEmail: "" } : {}),
    }));
  };

  const applyBoardToForm = (board, setter) => {
    setter((current) => ({
      ...current,
      board,
      className: "",
      subject: "",
      ...(Object.prototype.hasOwnProperty.call(current, "targetStudentEmail") ? { targetStudentEmail: "" } : {}),
    }));
  };

  const createSession = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await API.post("/teachers/sessions", {
        ...sessionForm,
        teacherEmail,
        teacherName,
      });
      setSessionForm(initialSession);
      setLessonModalOpen(false);
      await loadTeacher();
      navigate("/TeacherDashboard/calendar");
    } catch (err) {
      alert(err.response?.data?.error || "Unable to schedule class");
    } finally {
      setSaving(false);
    }
  };

  const publishAssignment = async (event) => {
    event.preventDefault();

    if (!assignmentForm.board || !assignmentForm.className || !assignmentForm.subject) {
      alert("Select a board, class and subject.");
      return;
    }
    if (!assignmentForm.maximumMarks || Number(assignmentForm.maximumMarks) <= 0) {
      alert("Enter maximum marks greater than zero.");
      return;
    }
    if (assignmentForm.type === "paper" && !assignmentFile && !assignmentForm.testLink.trim()) {
      alert("Upload a question paper file or enter a test link.");
      return;
    }

    const formData = new FormData();
    Object.entries(assignmentForm).forEach(([key, value]) => formData.append(key, value));
    const targetStudent = assignmentStudentOptions.find(
      (student) => student.email === assignmentForm.targetStudentEmail
    );
    if (targetStudent) {
      formData.set("targetStudentId", targetStudent._id);
      formData.set("targetStudentName", targetStudent.name || "Student");
    }
    formData.append("createdByRole", "teacher");
    formData.append("createdByEmail", teacherEmail);
    if (assignmentFile) formData.append("questionPaper", assignmentFile);

    setSaving(true);
    try {
      const token = await getToken();
      await API.post("/exams/assignments", formData, { headers: { Authorization: `Bearer ${token}` } });
      setAssignmentForm(initialAssignment);
      setAssignmentFile(null);
      alert("Test published to students.");
    } catch (err) {
      alert(err.response?.data?.error || "Unable to publish test");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionRow = (id, field, value) => {
    setQuestionRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const updateQuestionBoard = (id, board) => {
    setQuestionRows((currentRows) =>
      currentRows.map((row) => row.id === id ? { ...row, board, subject: "" } : row)
    );
  };

  const addQuestionRow = () => {
    setQuestionRows((currentRows) => [...currentRows, emptyQuestionRow(currentRows.at(-1)?.board || "")]);
  };

  const deleteQuestionRow = (id) => {
    setQuestionRows((currentRows) =>
      currentRows.length > 1 ? currentRows.filter((row) => row.id !== id) : currentRows
    );
  };

  const uploadQuestionBankRows = async (event) => {
    event.preventDefault();

    const cleanedRows = questionRows.map((row) => {
      const cleanedRow = { ...row };
      delete cleanedRow.id;
      return cleanedRow;
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
        alert("Select board and subject, then fill topic, year, paper, question number and at least one question paper link.");
        return;
      }
    }

    setSaving(true);
    try {
      const response = await API.post("/teachers/upload-questions", {
        teacherEmail,
        teacherName,
        questions: cleanedRows,
      });
      const { inserted = 0, updated = 0, skipped = 0 } = response.data || {};
      setQuestionRows([emptyQuestionRow()]);
      alert(`${inserted} inserted, ${updated} updated, ${skipped} skipped`);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to upload questions");
    } finally {
      setSaving(false);
    }
  };

  const saveRemark = async (session) => {
    const draft = remarks[session._id] || {};
    try {
      await API.put(`/teachers/sessions/${session._id}/remarks`, {
        teacherRemark: draft.teacherRemark ?? session.teacherRemark,
        teacherIssues: draft.teacherIssues ?? session.teacherIssues,
        status: "completed",
      });
      await loadTeacher();
    } catch (err) {
      alert(err.response?.data?.error || "Unable to save remark");
    }
  };

  const tabs = [
    { id: "overview", label: "Classes", icon: LayoutDashboard },
    { id: "papers", label: "Add New Test", icon: FileQuestion },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "remarks", label: "Teacher Remarks", icon: MessageSquareText },
    { id: "submissions", label: "Student Work", icon: ClipboardCheck },
  ];

  const goToTab = (tabId) => {
    navigate(`/TeacherDashboard/${tabId}`);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 text-slate-500 font-semibold">
        Loading teacher workspace...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 p-4 text-white lg:flex">
        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Aurethia" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Aurethia</p>
              <h1 className="text-base font-black leading-tight">Teacher Console</h1>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${
                  active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => signOut()}
          className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-8 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Signed in as teacher</p>
              <h2 className="text-3xl font-black tracking-tight">{teacherName}</h2>
              <p className="text-sm font-semibold text-slate-500">{teacherEmail}</p>
            </div>
            <button
              onClick={loadTeacher}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => goToTab(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-bold ${
                  activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mx-auto max-w-[1680px] p-5 md:p-8 lg:p-10">
          {error && <div className="mb-5 rounded-lg bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

          {!assignment && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              No classes have been assigned to this teacher yet. A superadmin can assign board/classes from the Admin Console.
            </div>
          )}

          {activeTab === "overview" && (
            <section className="space-y-5">
              <div>
                <div className="flex items-center gap-2"><School className="text-indigo-600" /><h3 className="text-xl font-black">Your Classes</h3></div>
                <p className="mt-1 text-sm font-semibold text-slate-500">Choose a grade and subject workspace.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {workspaces.map((item) => (
                    <button key={item.key} onClick={() => setWorkspaceKey(item.key)} className={`rounded-xl border p-5 text-left shadow-sm transition ${selectedWorkspace?.key === item.key ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-200 bg-white hover:border-indigo-300"}`}>
                      <p className={`text-xs font-black uppercase tracking-widest ${selectedWorkspace?.key === item.key ? "text-indigo-100" : "text-slate-400"}`}>Grade {item.className}</p>
                      <p className="mt-2 text-lg font-black">{item.subject}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedWorkspace && <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex gap-2 border-b border-slate-100 pb-4">
                    <button onClick={() => setWorkspaceTab("students")} className={`rounded-lg px-4 py-2 text-sm font-black ${workspaceTab === "students" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}><Users size={16} className="mr-2 inline" />Students</button>
                    <button onClick={() => setWorkspaceTab("content")} className={`rounded-lg px-4 py-2 text-sm font-black ${workspaceTab === "content" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}><FolderOpen size={16} className="mr-2 inline" />Class Content</button>
                  </div>

                  {workspaceTab === "students" && <div className="mt-4 space-y-3">
                    {context.students.filter((student) => String(student.studentClass) === String(selectedWorkspace.className)).map((student) => (
                      <div key={student._id} className="rounded-lg border border-slate-100 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-black">{student.name || "Student"}</p><p className="text-sm text-slate-500">{student.email}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">Grade {student.studentClass}</span></div>
                        {studentComment.studentId === student._id ? <div className="mt-3 flex gap-2"><input autoFocus value={studentComment.comment} onChange={(event) => setStudentComment({ studentId: student._id, comment: event.target.value })} placeholder="Add a specific comment" className="min-w-0 flex-1 rounded-lg border border-slate-200 p-3 text-sm" /><button onClick={() => saveStudentComment(student)} className="rounded-lg bg-emerald-600 px-4 text-sm font-black text-white">Save</button></div> : <button onClick={() => setStudentComment({ studentId: student._id, comment: "" })} className="mt-3 text-sm font-bold text-indigo-600"><MessageCircle size={15} className="mr-1 inline" />Add comment</button>}
                      </div>
                    ))}
                  </div>}

                  {workspaceTab === "content" && <div className="mt-4 space-y-5">
                    <form onSubmit={publishResource} className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-2">
                      <Input label="Content title" value={resourceForm.title} onChange={(title) => setResourceForm({ ...resourceForm, title })} />
                      <Input label="Deadline" type="datetime-local" value={resourceForm.deadline} onChange={(deadline) => setResourceForm({ ...resourceForm, deadline })} />
                      <label className="space-y-1 md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Google Drive or resource link</span><input type="url" required value={resourceForm.driveUrl} onChange={(event) => setResourceForm({ ...resourceForm, driveUrl: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="https://drive.google.com/..." /></label>
                      <label className="space-y-1 md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Instructions</span><textarea value={resourceForm.description} onChange={(event) => setResourceForm({ ...resourceForm, description: event.target.value })} className="h-20 w-full rounded-lg border border-slate-200 p-3 text-sm" /></label>
                      <button disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-black text-white md:col-span-2">+ Add Content</button>
                    </form>
                    {classroomResources.map((resource) => <a key={resource._id} href={resource.driveUrl} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-100 p-4 hover:border-indigo-200"><p className="font-black">{resource.title}</p><p className="text-sm text-slate-500">Due {new Date(resource.deadline).toLocaleString()}</p><ExternalLink size={15} className="mt-2 text-indigo-600" /></a>)}
                  </div>}
                </div>

                <WorkspaceCalendar sessions={context.sessions.filter((session) => String(session.className) === String(selectedWorkspace.className) && session.subject === selectedWorkspace.subject)} onSelectDate={openLessonForDate} />
              </div>}
            </section>
          )}

          {lessonModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={createSession} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase text-indigo-600">Grade {sessionForm.className} · {sessionForm.subject}</p><h3 className="text-xl font-black">Lesson details</h3></div><button type="button" onClick={() => setLessonModalOpen(false)}><X /></button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Input label="Lesson title" value={sessionForm.title} onChange={(title) => setSessionForm({ ...sessionForm, title })} /><Input label="Date and time" type="datetime-local" value={sessionForm.startsAt} onChange={(startsAt) => setSessionForm({ ...sessionForm, startsAt })} /><Input label="Topic taught" value={sessionForm.topicTaught} onChange={(topicTaught) => setSessionForm({ ...sessionForm, topicTaught })} /><label className="space-y-1 md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Specific comments</span><textarea value={sessionForm.specificComments} onChange={(event) => setSessionForm({ ...sessionForm, specificComments: event.target.value })} className="h-20 w-full rounded-lg border border-slate-200 p-3 text-sm" /></label><label className="space-y-1 md:col-span-2"><span className="text-xs font-black uppercase text-slate-500">Feedback on students</span><textarea value={sessionForm.studentFeedback} onChange={(event) => setSessionForm({ ...sessionForm, studentFeedback: event.target.value })} className="h-20 w-full rounded-lg border border-slate-200 p-3 text-sm" /></label><button disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-3 font-black text-white md:col-span-2">Save lesson</button></div></form></div>}

          {activeTab === "papers" && (
            <section className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-lg font-black">Upload To Question Bank</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Add questions to the main system for your assigned board. Drive links can be separated with | or a new line.
                    </p>
                  </div>
                </div>

                <form onSubmit={uploadQuestionBankRows} className="mt-5 space-y-4">
                  <div className="overflow-x-auto rounded-lg border border-slate-100">
                    <table className="w-full min-w-[1280px] table-fixed text-left">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="w-[25%] p-3">Category</th>
                          <th className="w-[18%] p-3">Paper Details</th>
                          <th className="w-[27%] p-3">Question & Scheme</th>
                          <th className="w-[25%] p-3">Analysis</th>
                          <th className="w-[5%] p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {questionRows.map((row) => (
                          <tr key={row.id} className="align-top">
                            <td className="space-y-2 p-3">
                              <SearchableSelect
                                value={row.board}
                                onChange={(value) => updateQuestionBoard(row.id, value)}
                                placeholder="Board"
                                size="compact"
                                options={boardOptions.map((board) => [board, board])}
                              />
                              <SearchableSelect
                                value={row.subject}
                                onChange={(value) => updateQuestionRow(row.id, "subject", value)}
                                placeholder={row.board ? "Subject" : "Select board first"}
                                size="compact"
                                disabled={!row.board}
                                options={questionSubjectsForBoard(row.board).map((subject) => [subject, subject])}
                              />
                              <input placeholder="Topic" value={row.topic} onChange={(event) => updateQuestionRow(row.id, "topic", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400" />
                            </td>
                            <td className="space-y-2 p-3">
                              <input type="number" placeholder="Year" value={row.year} onChange={(event) => updateQuestionRow(row.id, "year", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" />
                              <SearchableSelect
                                value={row.season}
                                onChange={(value) => updateQuestionRow(row.id, "season", value)}
                                placeholder="Season"
                                size="compact"
                                options={["Summer", "Winter", "Spring", "Fall"].map((season) => [season, season])}
                              />
                              <div className="grid grid-cols-[1fr_72px] gap-2">
                                <SearchableSelect
                                  value={row.paperName}
                                  onChange={(value) => updateQuestionRow(row.id, "paperName", value)}
                                  placeholder="Paper"
                                  size="compact"
                                  options={["1", "2", "1(core)", "2(extended)", "3", "4", "5", "6"].map((paper) => [paper, paper])}
                                />
                                <SearchableSelect
                                  value={row.variant}
                                  onChange={(value) => updateQuestionRow(row.id, "variant", value)}
                                  size="compact"
                                  options={[["1", "V1"], ["2", "V2"], ["3", "V3"]]}
                                />
                              </div>
                            </td>
                            <td className="space-y-2 p-3">
                              <input type="number" placeholder="Q#" value={row.questionNumber} onChange={(event) => updateQuestionRow(row.id, "questionNumber", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-bold" />
                              <textarea placeholder="Question paper Drive link(s), | or new line" value={row.questionPaper} onChange={(event) => updateQuestionRow(row.id, "questionPaper", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400" />
                              <textarea placeholder="Mark scheme Drive link(s), | or new line" value={row.markScheme} onChange={(event) => updateQuestionRow(row.id, "markScheme", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400" />
                            </td>
                            <td className="space-y-2 p-3">
                              <input placeholder="Correct Answer" value={row.correctAnswer} onChange={(event) => updateQuestionRow(row.id, "correctAnswer", event.target.value)} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm" />
                              <textarea placeholder="Explanation link" value={row.explanation} onChange={(event) => updateQuestionRow(row.id, "explanation", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400" />
                              <textarea placeholder="Admin comment link" value={row.specialComment} onChange={(event) => updateQuestionRow(row.id, "specialComment", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-400" />
                            </td>
                            <td className="p-3 text-center">
                              <button type="button" onClick={() => deleteQuestionRow(row.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete row">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                    <button type="button" onClick={addQuestionRow} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                      <Plus size={18} /> Add Row
                    </button>
                    <button disabled={saving || !assignment} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:bg-slate-300">
                      <Upload size={16} /> {saving ? "Uploading..." : "Upload To System"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-black">Add New Test</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Create and assign a test using a question-paper file or an external test link.
                </p>

                <form onSubmit={publishAssignment} className="mt-5 grid gap-4 lg:grid-cols-3">
                  <Input label="Title" value={assignmentForm.title} onChange={(value) => setAssignmentForm({ ...assignmentForm, title: value })} />
                  <Select label="Type" value={assignmentForm.type} onChange={(value) => setAssignmentForm({ ...assignmentForm, type: value })} options={[["paper", "Custom paper"], ["quiz", "Quiz"]]} />
                  <Input label="Duration minutes" type="number" value={assignmentForm.durationMinutes} onChange={(value) => setAssignmentForm({ ...assignmentForm, durationMinutes: value })} />
                  <Select
                    label="Board"
                    value={assignmentForm.board}
                    onChange={(value) => applyBoardToForm(value, setAssignmentForm)}
                    options={boardOptions.map((board) => [board, board])}
                  />
                  <Select
                    label="Class"
                    value={assignmentForm.className}
                    onChange={(value) => applyClassToForm(value, setAssignmentForm)}
                    options={assignmentClassOptions.map((entry) => [entry.className, `Grade ${entry.className}`])}
                  />
                  <Select
                    label="Subject Name"
                    value={assignmentForm.subject}
                    onChange={(value) => setAssignmentForm({ ...assignmentForm, subject: value })}
                    emptyLabel={assignmentForm.board ? "Select subject" : "Select board first"}
                    options={assignmentSubjectOptions.map((subject) => [subject, subject])}
                  />
                  <Input label="Maximum marks" type="number" value={assignmentForm.maximumMarks} onChange={(value) => setAssignmentForm({ ...assignmentForm, maximumMarks: value })} />
                  <Select
                    label="Assign To"
                    value={assignmentForm.targetStudentEmail}
                    onChange={(value) => setAssignmentForm({ ...assignmentForm, targetStudentEmail: value })}
                    emptyLabel="Entire Class"
                    options={[
                      ...assignmentStudentOptions.map((student) => [
                        student.email,
                        `${student.name || "Student"} - ${student.email}`,
                      ]),
                    ]}
                  />
                  <Input label="Due date" type="datetime-local" value={assignmentForm.dueAt} onChange={(value) => setAssignmentForm({ ...assignmentForm, dueAt: value })} />
                  {assignmentForm.type === "quiz" ? (
                    <>
                      <Select
                        label="Year"
                        value={assignmentForm.year}
                        onChange={(value) => setAssignmentForm({ ...assignmentForm, year: value })}
                        options={yearOptions.map((year) => [year, year])}
                      />
                      <Select
                        label="Season"
                        value={assignmentForm.season}
                        onChange={(value) => setAssignmentForm({ ...assignmentForm, season: value })}
                        options={[["Summer", "Summer"], ["Winter", "Winter"], ["Spring", "Spring"], ["Fall", "Fall"]]}
                      />
                      <Select
                        label="Paper"
                        value={assignmentForm.paperName}
                        onChange={(value) => setAssignmentForm({ ...assignmentForm, paperName: value })}
                        options={["1", "2", "1(core)", "2(extended)", "3", "4", "5", "6"].map((paper) => [paper, paper])}
                      />
                      <Select
                        label="Variant"
                        value={assignmentForm.variant}
                        onChange={(value) => setAssignmentForm({ ...assignmentForm, variant: value })}
                        options={[["1", "1"], ["2", "2"], ["3", "3"]]}
                      />
                    </>
                  ) : (
                    <>
                      <label className="space-y-1">
                        <span className="text-xs font-black uppercase tracking-wide text-slate-500">Question paper file</span>
                        <input type="file" accept=".pdf,image/*" onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                      </label>
                      <Input label="Test link" type="url" value={assignmentForm.testLink} onChange={(value) => setAssignmentForm({ ...assignmentForm, testLink: value })} />
                    </>
                  )}
                  <label className="space-y-1 lg:col-span-2">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500">Marking scheme link</span>
                    <input type="url" value={assignmentForm.markingSchemeLink} onChange={(event) => setAssignmentForm({ ...assignmentForm, markingSchemeLink: event.target.value })} className="w-full rounded-lg border border-slate-200 p-3 text-sm" placeholder="https://..." />
                    <span className="block text-xs font-semibold text-amber-700">Students can access this only after submitting the test.</span>
                  </label>
                  <div className="flex items-end rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-500">
                    Creation date and time are recorded automatically when published.
                  </div>
                  <label className="space-y-1 lg:col-span-3">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500">Instructions</span>
                    <textarea value={assignmentForm.instructions} onChange={(event) => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })} className="h-24 w-full rounded-lg border border-slate-200 p-3 text-sm" />
                  </label>
                  <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">
                    <Upload size={16} /> {saving ? "Publishing..." : "Publish"}
                  </button>
                </form>
              </div>
            </section>
          )}

          {activeTab === "calendar" && (
            <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
              <form onSubmit={createSession} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-black">Schedule Class</h3>
                <div className="mt-4 grid gap-4">
                  <Input label="Class title" value={sessionForm.title} onChange={(value) => setSessionForm({ ...sessionForm, title: value })} />
                  <Select
                    label="Board"
                    value={sessionForm.board}
                    onChange={(value) => applyBoardToForm(value, setSessionForm)}
                    options={boardOptions.map((board) => [board, board])}
                  />
                  <Select
                    label="Class"
                    value={sessionForm.className}
                    onChange={(value) => applyClassToForm(value, setSessionForm)}
                    options={sessionClassOptions.map((entry) => [entry.className, `Grade ${entry.className}`])}
                  />
                  <Select
                    label="Subject Name"
                    value={sessionForm.subject}
                    onChange={(value) => setSessionForm({ ...sessionForm, subject: value })}
                    emptyLabel={sessionForm.board ? "Select subject" : "Select board first"}
                    options={sessionSubjectOptions.map((subject) => [subject, subject])}
                  />
                  <Input label="Starts at" type="datetime-local" value={sessionForm.startsAt} onChange={(value) => setSessionForm({ ...sessionForm, startsAt: value })} />
                  <Input label="Ends at" type="datetime-local" value={sessionForm.endsAt} onChange={(value) => setSessionForm({ ...sessionForm, endsAt: value })} />
                  <Input label="Meeting link" value={sessionForm.meetingLink} onChange={(value) => setSessionForm({ ...sessionForm, meetingLink: value })} />
                  <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">
                    <Plus size={16} /> {saving ? "Scheduling..." : "Schedule Class"}
                  </button>
                </div>
              </form>

              <SessionList sessions={context.sessions} />
            </section>
          )}

          {activeTab === "remarks" && (
            <section className="space-y-4">
              <h3 className="font-black">Teacher Remarks</h3>
              {context.sessions.length === 0 && <p className="rounded-xl bg-white p-5 text-slate-500">Schedule classes to start logging remarks.</p>}
              {context.sessions.map((session) => {
                const draft = remarks[session._id] || {};
                return (
                  <div key={session._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="font-black">{session.title}</h4>
                        <p className="text-sm font-semibold text-slate-500">
                          Grade {session.className} - {session.subject} - {new Date(session.startsAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{session.status}</span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <textarea
                        placeholder="What was taught in this class?"
                        value={draft.teacherRemark ?? session.teacherRemark ?? ""}
                        onChange={(event) => setRemarks({ ...remarks, [session._id]: { ...draft, teacherRemark: event.target.value } })}
                        className="h-24 rounded-lg border border-slate-200 p-3 text-sm"
                      />
                      <textarea
                        placeholder="Problems, absences, concerns, or follow-ups"
                        value={draft.teacherIssues ?? session.teacherIssues ?? ""}
                        onChange={(event) => setRemarks({ ...remarks, [session._id]: { ...draft, teacherIssues: event.target.value } })}
                        className="h-20 rounded-lg border border-slate-200 p-3 text-sm"
                      />
                      {session.superadminNote && (
                        <div className="rounded-lg bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">
                          Superadmin note: {session.superadminNote}
                        </div>
                      )}
                      <button onClick={() => saveRemark(session)} className="w-fit rounded-lg bg-emerald-600 px-5 py-3 text-sm font-black text-white">
                        Save Remark
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {activeTab === "submissions" && <section className="space-y-4">
            <div><h3 className="text-xl font-black">Student Submissions</h3><p className="text-sm text-slate-500">Review uploaded answer sheets and return grades and feedback.</p></div>
            {teacherSubmissions.map((submission) => {
              const draft = gradeDrafts[submission._id] || {};
              return <div key={submission._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-black">{submission.assignmentDetails?.title || "Assignment"}</p><p className="text-sm text-slate-500">{submission.userName || submission.userEmail} · {submission.assignmentDetails?.subject}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${submission.status === "graded" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{submission.status}</span></div>
                <div className="mt-3 flex flex-wrap gap-2">{(submission.answerSheets || []).map((file) => <a key={file.url || file.path} href={file.url || `${API.defaults.baseURL?.replace("/api", "")}${file.path}`} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-indigo-600">Open {file.originalName || "answer sheet"}</a>)}</div>
                <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_auto]"><input value={draft.grade ?? submission.grade ?? ""} onChange={(event) => setGradeDrafts({ ...gradeDrafts, [submission._id]: { ...draft, grade: event.target.value } })} placeholder="Grade / score" className="rounded-lg border border-slate-200 p-3 text-sm" /><input value={draft.feedback ?? submission.feedback ?? ""} onChange={(event) => setGradeDrafts({ ...gradeDrafts, [submission._id]: { ...draft, feedback: event.target.value } })} placeholder="Feedback for the student" className="rounded-lg border border-slate-200 p-3 text-sm" /><button onClick={() => gradeSubmission(submission)} className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-black text-white">Return checked work</button></div>
              </div>;
            })}
            {teacherSubmissions.length === 0 && <div className="rounded-xl bg-white p-6 text-slate-500">No work has been submitted yet.</div>}
          </section>}
        </div>
      </main>
    </div>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <label className="space-y-1">
    <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
  </label>
);

const Select = ({ label, value, onChange, options, emptyLabel = "Select" }) => (
  <SearchableSelect
    label={label}
    value={value}
    onChange={onChange}
    placeholder={emptyLabel}
    emptyOption={["", emptyLabel]}
    options={options}
  />
);

const SessionList = ({ sessions }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="flex items-center gap-2 font-black"><CalendarDays size={18} /> Calendar</h3>
    <div className="mt-4 space-y-3">
      {sessions.length === 0 && <p className="text-sm font-semibold text-slate-500">No classes scheduled yet.</p>}
      {sessions.map((session) => (
        <div key={session._id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="font-black">{session.title}</p>
          <p className="text-sm font-semibold text-slate-500">
            Grade {session.className} - {session.subject}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
            {new Date(session.startsAt).toLocaleString()}
          </p>
          {session.meetingLink && <a href={session.meetingLink} className="mt-2 block text-sm font-bold text-blue-600" target="_blank" rel="noreferrer">Open meeting link</a>}
        </div>
      ))}
    </div>
  </div>
);

const WorkspaceCalendar = ({ sessions, onSelectDate }) => {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const dateKey = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const sessionDates = new Set(sessions.map((session) => new Date(session.startsAt).toLocaleDateString("en-CA")));

  return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 font-black"><CalendarDays size={18} />Calendar</h3><p className="text-sm text-slate-500">Click a date to record a lesson.</p></div><div className="flex gap-2"><button onClick={() => setCursor(new Date(year, month - 1, 1))} className="rounded-lg border px-3 py-2">‹</button><button onClick={() => setCursor(new Date(year, month + 1, 1))} className="rounded-lg border px-3 py-2">›</button></div></div>
    <p className="mt-4 text-center font-black">{cursor.toLocaleString("en", { month: "long", year: "numeric" })}</p>
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <span key={day}>{day}</span>)}</div>
    <div className="mt-2 grid grid-cols-7 gap-1">{cells.map((day, index) => day ? <button key={dateKey(day)} onClick={() => onSelectDate(dateKey(day))} className={`relative aspect-square rounded-lg text-sm font-bold hover:bg-indigo-50 ${sessionDates.has(dateKey(day)) ? "bg-indigo-600 text-white" : "bg-slate-50"}`}>{day}{sessionDates.has(dateKey(day)) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white" />}</button> : <span key={`empty-${index}`} />)}</div>
  </div>;
};

export default TeacherDashboard;
