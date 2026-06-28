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
  Upload,
  Users,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/react";
import API from "../api/axios";
import Logo from "../assets/Aurethia_logo.avif";

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
  dueAt: "",
  durationMinutes: "60",
  instructions: "",
};

const TeacherDashboard = () => {
  const { signOut } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [context, setContext] = useState({ assignment: null, students: [], sessions: [] });
  const [sessionForm, setSessionForm] = useState(initialSession);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [assignmentFile, setAssignmentFile] = useState(null);
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
      setActiveTab("calendar");
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
                onClick={() => setActiveTab(tab.id)}
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
                onClick={() => setActiveTab(tab.id)}
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
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-black">Add Question Paper</h3>
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
                <Input label="Subject" value={assignmentForm.subject} onChange={(value) => setAssignmentForm({ ...assignmentForm, subject: value })} />
                <Input label="Due date" type="datetime-local" value={assignmentForm.dueAt} onChange={(value) => setAssignmentForm({ ...assignmentForm, dueAt: value })} />
                <label className="space-y-1 lg:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Question paper file</span>
                  <input type="file" accept=".pdf,image/*" onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 p-3 text-sm" />
                </label>
                <label className="space-y-1 lg:col-span-3">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">Instructions</span>
                  <textarea value={assignmentForm.instructions} onChange={(event) => setAssignmentForm({ ...assignmentForm, instructions: event.target.value })} className="h-24 w-full rounded-lg border border-slate-200 p-3 text-sm" />
                </label>
                <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-black text-white disabled:bg-slate-300">
                  <Upload size={16} /> {saving ? "Publishing..." : "Publish"}
                </button>
              </form>
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

const Select = ({ label, value, onChange, options }) => (
  <label className="space-y-1">
    <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-200 p-3 text-sm">
      <option value="">Select</option>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>{optionLabel}</option>
      ))}
    </select>
  </label>
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
