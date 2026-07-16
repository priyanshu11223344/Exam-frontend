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
} from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import Logo from "../assets/Aurethia_logo.avif";
import SearchableSelect from "./SearchableSelect";

const TEACHER_TAB_IDS = ["overview", "papers", "calendar", "remarks"];

const initialSession = {
  title: "",
  board: "",
  className: "",
  subject: "",
  startsAt: "",
  endsAt: "",
  meetingLink: "",
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
};

const emptyQuestionRow = () => ({
  id: Date.now() + Math.random(),
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
  const { signOut } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = TEACHER_TAB_IDS.includes(tab) ? tab : "overview";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState({ assignment: null, students: [], sessions: [] });
  const [sessionForm, setSessionForm] = useState(initialSession);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [questionRows, setQuestionRows] = useState([emptyQuestionRow()]);
  const [remarks, setRemarks] = useState({});
  const [error, setError] = useState("");

  const teacherEmail = clerkUser?.primaryEmailAddress?.emailAddress || "";
  const teacherName = clerkUser?.fullName || clerkUser?.firstName || "Teacher";
  const assignment = context.assignment;
  const assignedClasses = assignment?.classes || [];

  const classOptions = useMemo(() => {
    return assignedClasses.map((entry) => ({
      className: entry.className,
      subjects: entry.subjects?.length ? entry.subjects : ["General"],
    }));
  }, [assignedClasses]);

  const assignmentSubjectOptions = useMemo(() => {
    const selectedClass = classOptions.find(
      (entry) => String(entry.className) === String(assignmentForm.className)
    );
    const subjects = selectedClass?.subjects?.length
      ? selectedClass.subjects
      : classOptions.flatMap((entry) => entry.subjects || []);
    return Array.from(new Set(subjects.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [assignmentForm.className, classOptions]);

  const assignmentStudentOptions = useMemo(() => {
    return (context.students || [])
      .filter((student) => !assignmentForm.className || String(student.studentClass || "") === String(assignmentForm.className))
      .sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""));
  }, [assignmentForm.className, context.students]);

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

  const applyClassToForm = (className, setter) => {
    const selected = classOptions.find((entry) => entry.className === className);
    setter((current) => ({
      ...current,
      className,
      board: assignment?.board || "",
      subject: selected?.subjects?.[0] || current.subject || "General",
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

    if (assignmentForm.type === "paper" && !assignmentFile) {
      alert("Upload a question paper first.");
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
      await API.post("/exams/assignments", formData);
      setAssignmentForm(initialAssignment);
      setAssignmentFile(null);
      alert("Question paper published to students.");
    } catch (err) {
      alert(err.response?.data?.error || "Unable to publish question paper");
    } finally {
      setSaving(false);
    }
  };

  const updateQuestionRow = (id, field, value) => {
    setQuestionRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addQuestionRow = () => {
    setQuestionRows((currentRows) => [...currentRows, emptyQuestionRow()]);
  };

  const deleteQuestionRow = (id) => {
    setQuestionRows((currentRows) =>
      currentRows.length > 1 ? currentRows.filter((row) => row.id !== id) : currentRows
    );
  };

  const uploadQuestionBankRows = async (event) => {
    event.preventDefault();

    const cleanedRows = questionRows.map(({ id, ...row }) => ({
      ...row,
      board: assignment?.board || "",
    }));

    for (const row of cleanedRows) {
      if (
        !row.subject ||
        !row.topic ||
        !row.year ||
        !row.paperName ||
        !row.questionNumber ||
        !row.questionPaper
      ) {
        alert("Fill subject, topic, year, paper, question number and at least one question paper link.");
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
    { id: "papers", label: "Question Papers", icon: FileQuestion },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "remarks", label: "Teacher Remarks", icon: MessageSquareText },
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
      <aside className="hidden w-72 flex-col bg-slate-950 p-5 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <img src={Logo} alt="Aurethia" className="h-11 w-11 rounded-lg object-contain" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Aurethia</p>
            <h1 className="text-lg font-black">Teacher Console</h1>
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold ${
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
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/10"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="flex-1">
        <header className="border-b border-slate-200 bg-white px-5 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Signed in as teacher</p>
              <h2 className="text-2xl font-black">{teacherName}</h2>
              <p className="text-sm font-semibold text-slate-500">{teacherEmail}</p>
            </div>
            <button
              onClick={loadTeacher}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
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

        <div className="p-5 md:p-8">
          {error && <div className="mb-5 rounded-lg bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

          {!assignment && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              No classes have been assigned to this teacher yet. A superadmin can assign board/classes from the Admin Console.
            </div>
          )}

          {activeTab === "overview" && (
            <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <School className="text-indigo-600" />
                  <div>
                    <h3 className="font-black">Assigned Board</h3>
                    <p className="text-slate-500 font-semibold">{assignment?.board || "Not assigned"}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {assignedClasses.map((entry) => (
                    <div key={entry.className} className="rounded-lg bg-slate-50 p-3">
                      <p className="font-black">Grade {entry.className}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        {(entry.subjects || []).join(", ") || "All subjects"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 font-black"><Users size={18} /> Students In Your Classes</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                      <tr>
                        <th className="p-3">Student</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">School</th>
                        <th className="p-3">Plan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {context.students.length === 0 && (
                        <tr><td colSpan="4" className="p-4 text-slate-500">No students found in assigned classes yet.</td></tr>
                      )}
                      {context.students.map((student) => (
                        <tr key={student._id}>
                          <td className="p-3">
                            <p className="font-bold">{student.name || "Student"}</p>
                            <p className="text-slate-500">{student.email}</p>
                          </td>
                          <td className="p-3">{student.studentClass || "-"}</td>
                          <td className="p-3">{student.school || "-"}</td>
                          <td className="p-3">{student.planName || "Free"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "papers" && (
            <section className="space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-black">Upload To Question Bank</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add questions to the main system for your assigned board. Drive links can be separated with | or a new line.
                </p>

                <form onSubmit={uploadQuestionBankRows} className="mt-5 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1180px] text-left">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="p-3">Category</th>
                          <th className="p-3">Paper Details</th>
                          <th className="p-3">Question & Scheme</th>
                          <th className="p-3">Analysis</th>
                          <th className="p-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {questionRows.map((row) => (
                          <tr key={row.id} className="align-top">
                            <td className="space-y-2 p-3">
                              <input value={assignment?.board || ""} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm font-bold text-slate-500" />
                              <input placeholder="Subject" value={row.subject} onChange={(event) => updateQuestionRow(row.id, "subject", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" />
                              <input placeholder="Topic" value={row.topic} onChange={(event) => updateQuestionRow(row.id, "topic", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" />
                            </td>
                            <td className="space-y-2 p-3">
                              <input type="number" placeholder="Year" value={row.year} onChange={(event) => updateQuestionRow(row.id, "year", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" />
                              <SearchableSelect
                                value={row.season}
                                onChange={(value) => updateQuestionRow(row.id, "season", value)}
                                placeholder="Season"
                                options={["Summer", "Winter", "Spring", "Fall"].map((season) => [season, season])}
                              />
                              <div className="grid grid-cols-[1fr_72px] gap-2">
                                <SearchableSelect
                                  value={row.paperName}
                                  onChange={(value) => updateQuestionRow(row.id, "paperName", value)}
                                  placeholder="Paper"
                                  options={["1", "2", "1(core)", "2(extended)", "3", "4", "5", "6"].map((paper) => [paper, paper])}
                                />
                                <SearchableSelect
                                  value={row.variant}
                                  onChange={(value) => updateQuestionRow(row.id, "variant", value)}
                                  options={[["1", "V1"], ["2", "V2"], ["3", "V3"]]}
                                />
                              </div>
                            </td>
                            <td className="space-y-2 p-3">
                              <input type="number" placeholder="Q#" value={row.questionNumber} onChange={(event) => updateQuestionRow(row.id, "questionNumber", event.target.value)} className="w-full rounded-lg border border-slate-200 p-2 text-sm font-bold" />
                              <textarea placeholder="Question paper Drive link(s), | or new line" value={row.questionPaper} onChange={(event) => updateQuestionRow(row.id, "questionPaper", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                              <textarea placeholder="Mark scheme Drive link(s), | or new line" value={row.markScheme} onChange={(event) => updateQuestionRow(row.id, "markScheme", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                            </td>
                            <td className="space-y-2 p-3">
                              <input placeholder="Correct Answer" value={row.correctAnswer} onChange={(event) => updateQuestionRow(row.id, "correctAnswer", event.target.value)} className="w-full rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm" />
                              <textarea placeholder="Explanation link" value={row.explanation} onChange={(event) => updateQuestionRow(row.id, "explanation", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
                              <textarea placeholder="Admin comment link" value={row.specialComment} onChange={(event) => updateQuestionRow(row.id, "specialComment", event.target.value)} className="h-20 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm" />
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

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-black">Publish Assignment To Students</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Publish a custom question paper or quiz to students in one of your assigned classes.
                </p>

                <form onSubmit={publishAssignment} className="mt-5 grid gap-4 lg:grid-cols-3">
                  <Input label="Title" value={assignmentForm.title} onChange={(value) => setAssignmentForm({ ...assignmentForm, title: value })} />
                  <Select label="Type" value={assignmentForm.type} onChange={(value) => setAssignmentForm({ ...assignmentForm, type: value })} options={[["paper", "Custom paper"], ["quiz", "Quiz"]]} />
                  <Input label="Duration minutes" type="number" value={assignmentForm.durationMinutes} onChange={(value) => setAssignmentForm({ ...assignmentForm, durationMinutes: value })} />
                  <Select
                    label="Class"
                    value={assignmentForm.className}
                    onChange={(value) => applyClassToForm(value, setAssignmentForm)}
                    options={classOptions.map((entry) => [entry.className, `Grade ${entry.className}`])}
                  />
                  <Input label="Board" value={assignmentForm.board} onChange={(value) => setAssignmentForm({ ...assignmentForm, board: value })} />
                  <Select
                    label="Subject"
                    value={assignmentForm.subject}
                    onChange={(value) => setAssignmentForm({ ...assignmentForm, subject: value })}
                    options={assignmentSubjectOptions.map((subject) => [subject, subject])}
                  />
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
                    <label className="space-y-1 lg:col-span-2">
                      <span className="text-xs font-black uppercase tracking-wide text-slate-500">Question paper file</span>
                      <input type="file" accept=".pdf,image/*" onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                    </label>
                  )}
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
                    label="Class"
                    value={sessionForm.className}
                    onChange={(value) => applyClassToForm(value, setSessionForm)}
                    options={classOptions.map((entry) => [entry.className, `Grade ${entry.className}`])}
                  />
                  <Input label="Board" value={sessionForm.board} onChange={(value) => setSessionForm({ ...sessionForm, board: value })} />
                  <Input label="Subject" value={sessionForm.subject} onChange={(value) => setSessionForm({ ...sessionForm, subject: value })} />
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

export default TeacherDashboard;
