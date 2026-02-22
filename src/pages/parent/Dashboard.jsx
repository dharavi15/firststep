import { useMemo, useState } from "react";
import {
  Menu,
  FileText,
  CheckCircle2,
  ChevronRight,
  Phone,
  Coins,
  FolderOpen,
  GraduationCap,
  Check,
  ArrowLeft,
  Home,
  ListChecks,
  Calendar,
  User,
} from "lucide-react";

// Wide card component for top shortcuts
function WideCard({ icon, title, onClick }) {
  const Icon = icon;
  return (
    <button type="button" className="wideCard" onClick={onClick}>
      <div className="wideCardIcon">
        <Icon size={22} />
      </div>
      <div className="wideCardTitle">{title}</div>
    </button>
  );
}

// Quick action card component
function QuickCard({ icon, title, onClick }) {
  const Icon = icon;
  return (
    <button type="button" className="quickCard" onClick={onClick}>
      <Icon size={32} />
      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

// Clickable checklist row
function ChecklistRow({ text, onClick }) {
  return (
    <button type="button" className="checklistRow" onClick={onClick}>
      <div className="checklistLeft">
        <span className="checkCircle">
          <Check size={16} />
        </span>
        <span>{text}</span>
      </div>
      <ChevronRight size={18} />
    </button>
  );
}

// Mock parent profile for header (private)
const MOCK_PARENT = {
  id: "par_001",
  displayName: "Miss ABC",
  email: "parent@test.com",
};

// Mock private student linked to this parent
const PRIVATE_STUDENT_ID = "stu_private_001";

// Mock private data sets
const MOCK_STUDENTS = [
  {
    id: "stu_private_001",
    studentName: "Student A",
    parentName: "Miss ABC",
    classYear: "K2 / Sunflower",
    status: "In progress",
    date: "21/2/2026",
  },
  {
    id: "stu_other_002",
    studentName: "Other Student",
    parentName: "Someone Else",
    classYear: "Year 2",
    status: "Completed",
    date: "12/2/2026",
  },
];

const MOCK_COMPLETED = [
  {
    id: "c_private_001",
    studentId: "stu_private_001",
    name: "Student A",
    parent: "Miss ABC",
    classYear: "K2 / Sunflower",
    completedDate: "Pending",
  },
  {
    id: "c_other_002",
    studentId: "stu_other_002",
    name: "Other Student",
    parent: "Someone Else",
    classYear: "Year 2",
    completedDate: "4/2/2026",
  },
];

const MOCK_TUITION = [
  {
    id: "t_private_001",
    studentId: "stu_private_001",
    name: "Student A",
    parent: "Miss ABC",
    classYear: "K2 / Sunflower",
    amountDue: "Pending (2 days)",
    dueDate: "28/2/2026",
    payStatus: "Pending",
  },
  {
    id: "t_other_002",
    studentId: "stu_other_002",
    name: "Other Student",
    parent: "Someone Else",
    classYear: "Year 2",
    amountDue: "Paid",
    dueDate: "4/1/2026",
    payStatus: "Paid",
  },
];

const MOCK_DOCS = [
  {
    id: "d_private_001",
    studentId: "stu_private_001",
    name: "Student A",
    parent: "Miss ABC",
    classYear: "K2 / Sunflower",
    document: "Health Form",
    dateUploaded: "Not uploaded",
  },
  {
    id: "d_other_002",
    studentId: "stu_other_002",
    name: "Other Student",
    parent: "Someone Else",
    classYear: "Year 2",
    document: "Birth Certificate",
    dateUploaded: "4/1/2026",
  },
];

const MOCK_MANAGE = [
  {
    id: "m_private_001",
    studentId: "stu_private_001",
    name: "Student A",
    parent: "Miss ABC",
    classYear: "K2 / Sunflower",
    status: "In progress",
    contact: "Call / Email",
  },
  {
    id: "m_other_002",
    studentId: "stu_other_002",
    name: "Other Student",
    parent: "Someone Else",
    classYear: "Year 2",
    status: "Enrolled",
    contact: "Call / Email",
  },
];

const MOCK_TASKS = [
  {
    id: "task_pending",
    title: "Pending Tasks",
    status: "In progress",
    description:
      "Review any remaining onboarding tasks that require attention before full enrollment.",
    steps: ["Check missing documents", "Confirm student details", "Complete forms"],
    due: "Within 7 days",
  },
  {
    id: "task_payments",
    title: "Awaiting Payments",
    status: "Action required",
    description: "You have outstanding tuition and fees to be paid.",
    steps: ["Open Tuition Fees", "Check due date", "Proceed to payment"],
    due: "Within 2 days",
  },
  {
    id: "task_health",
    title: "Fill Health Form",
    status: "Not started",
    description: "Complete the student health form for school records.",
    steps: ["Open Documents", "Download Health Form", "Upload completed form"],
    due: "Before orientation",
  },
  {
    id: "task_tuition",
    title: "Pay Tuition & Fees",
    status: "Action required",
    description: "Pay tuition and any additional fees to finalize enrollment.",
    steps: ["Open Tuition Fees", "Select student", "Proceed to payment"],
    due: "Before due date",
  },
  {
    id: "task_orientation",
    title: "Attend Orientation",
    status: "Scheduled",
    description: "Attend the school's orientation session.",
    steps: ["Check Calendar", "Confirm time/location", "Attend session"],
    due: "On scheduled date",
  },
];

// Parent Dashboard Page
// Same behavior as Admin dashboard, but data is private for this parent only
export default function Dashboard() {
  // view controls which screen is visible
  const [view, setView] = useState("dashboard");

  // selectedTask is used only for task details screen
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter lists to private student only
  const privateStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((s) => s.id === PRIVATE_STUDENT_ID);
  }, []);

  const privateCompleted = useMemo(() => {
    return MOCK_COMPLETED.filter((r) => r.studentId === PRIVATE_STUDENT_ID);
  }, []);

  const privateTuition = useMemo(() => {
    return MOCK_TUITION.filter((t) => t.studentId === PRIVATE_STUDENT_ID);
  }, []);

  const privateDocs = useMemo(() => {
    return MOCK_DOCS.filter((d) => d.studentId === PRIVATE_STUDENT_ID);
  }, []);

  const privateManage = useMemo(() => {
    return MOCK_MANAGE.filter((m) => m.studentId === PRIVATE_STUDENT_ID);
  }, []);

  // Go back to main dashboard
  const goBack = () => {
    setView("dashboard");
    setSelectedTask(null);
  };

  // Open a normal view
  const openView = (nextView) => {
    setSelectedTask(null);
    setView(nextView);
  };

  // Open task details view
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setView("taskDetails");
  };

  // Find task by title and open details
  const onOpenTaskDetailsByTitle = (title) => {
    const task = MOCK_TASKS.find((t) => t.title === title) || null;
    openTaskDetails(task);
  };

  // Title for top bar
  const viewTitle = useMemo(() => {
    if (view === "enrollment") return "Enrollment Overview";
    if (view === "completed") return "Completed Onboarding";
    if (view === "tuition") return "Tuition Fees";
    if (view === "documents") return "Documents";
    if (view === "manage") return "Manage Student";
    if (view === "contact") return "Contact";
    if (view === "checklist") return "Onboarding Checklist";
    if (view === "taskDetails") return selectedTask?.title || "Task Details";
    return "Dashboard";
  }, [view, selectedTask]);

  // Enrollment view
  const renderEnrollment = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Student Overview (Private)</div>
        <div className="eventDetailDesc">
          This is private mock data. Later replace with Firebase.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {privateStudents.map((s) => (
            <div key={s.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoIcon">{s.studentName[0]}</span>
                <span className="profileInfoLabel">{s.studentName}</span>
              </div>
              <div className="profileInfoValue">
                {s.classYear} • {s.status} • {s.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Completed view
  const renderCompleted = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Completed Status (Private)</div>
        <div className="eventDetailDesc">
          Replace with Firebase later. For now, showing current student only.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {privateCompleted.map((r) => (
            <div key={r.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoIcon">{r.name[0]}</span>
                <span className="profileInfoLabel">{r.name}</span>
              </div>
              <div className="profileInfoValue">
                {r.classYear} • {r.completedDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Tuition view
  const renderTuition = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Tuition Fees (Private)</div>
        <div className="eventDetailDesc">
          Later: connect to Firebase payments for this student only.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {privateTuition.map((t) => (
            <div key={t.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoIcon">{t.name[0]}</span>
                <span className="profileInfoLabel">{t.name}</span>
              </div>
              <div className="profileInfoValue">
                {t.classYear} • {t.amountDue} • {t.dueDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Documents view
  const renderDocuments = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Documents (Private)</div>
        <div className="eventDetailDesc">
          Later: show documents from Firebase for this student only.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {privateDocs.map((d) => (
            <div key={d.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoIcon">{d.name[0]}</span>
                <span className="profileInfoLabel">{d.name}</span>
              </div>
              <div className="profileInfoValue">
                {d.classYear} • {d.document} • {d.dateUploaded}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Manage view (parent is read-only)
  const renderManage = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Student Info (Private)</div>
        <div className="eventDetailDesc">
          Parent can view only. Later load from Firebase.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {privateManage.map((m) => (
            <div key={m.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoIcon">{m.name[0]}</span>
                <span className="profileInfoLabel">{m.name}</span>
              </div>
              <div className="profileInfoValue">
                {m.classYear} • {m.status}
              </div>
            </div>
          ))}
        </div>

        <div className="modalActions">
          <button type="button" className="btnOutlinePrimary" onClick={goBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );

  // Contact view
  const renderContact = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Contact School (Mock)</div>
        <div className="eventDetailDesc">
          Later: connect to real email service or Firebase.
        </div>

        <div className="modalForm" style={{ marginTop: 8 }}>
          <label className="modalLabel">
            Subject
            <input className="modalInput" placeholder="Subject" />
          </label>

          <label className="modalLabel">
            Parent Name
            <input className="modalInput" placeholder={MOCK_PARENT.displayName} />
          </label>

          <label className="modalLabel">
            Email
            <input className="modalInput" placeholder={MOCK_PARENT.email} />
          </label>

          <label className="modalLabel">
            Message
            <textarea className="modalInput" placeholder="Type your message..." rows={4} />
          </label>

          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={goBack}>
              Cancel
            </button>
            <button
              type="button"
              className="btnPrimary"
              style={{ width: "auto", padding: "10px 14px" }}
              onClick={() => alert("Mock: Send message")}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Checklist list view
  const renderChecklist = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Onboarding Checklist (Private)</div>
        <div className="eventDetailDesc">
          Click a task to view details.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_TASKS.map((task) => (
            <button
              key={task.id}
              type="button"
              className="profileRowBtn"
              onClick={() => openTaskDetails(task)}
            >
              <span className="profileAvatar">{task.title[0]}</span>
              <span className="profileRowName">{task.title}</span>
              <span style={{ fontWeight: 900, color: "#111", opacity: 0.75 }}>
                {task.status}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Task details view
  const renderTaskDetails = () => {
    if (!selectedTask) {
      return (
        <div className="pagePad">
          <div className="emptyState">No task selected.</div>
          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={() => openView("checklist")}>
              Back to Checklist
            </button>
            <button type="button" className="btnPrimary" onClick={goBack}>
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="pagePad">
        <div className="eventDetailBlock">
          <div className="eventDetailTitle">{selectedTask.title}</div>
          <div className="eventDetailDate">Status: {selectedTask.status}</div>
          <div className="eventDetailNote">Due: {selectedTask.due}</div>
          <div className="eventDetailDesc">{selectedTask.description}</div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Steps</div>

            <div className="tableBody">
              {selectedTask.steps.map((s, idx) => (
                <div key={idx} className="profileInfoRow">
                  <div className="profileInfoLeft">
                    <span className="profileInfoIcon">{idx + 1}</span>
                    <span className="profileInfoLabel">{s}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={() => openView("checklist")}>
              Back to Checklist
            </button>
            <button type="button" className="btnPrimary" onClick={goBack}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render active view content
  const renderActiveView = () => {
    if (view === "enrollment") return renderEnrollment();
    if (view === "completed") return renderCompleted();
    if (view === "tuition") return renderTuition();
    if (view === "documents") return renderDocuments();
    if (view === "manage") return renderManage();
    if (view === "contact") return renderContact();
    if (view === "checklist") return renderChecklist();
    if (view === "taskDetails") return renderTaskDetails();
    return null;
  };

  // Dashboard home view
  const renderDashboardHome = () => (
    <div className="dashWrap">
      <div className="dashTopGrid">
        <WideCard icon={FileText} title="Enrollment Overview" onClick={() => openView("enrollment")} />
        <WideCard icon={CheckCircle2} title="Completed Onboarding" onClick={() => openView("completed")} />
      </div>

      <div className="dashMainGrid">
        <section className="panel">
          <h3 className="sectionTitle">Onboarding Checklist</h3>

          <div className="panelCard">
            <div className="panelTitle">Pending Tasks</div>

            <div className="checklistList">
              <ChecklistRow text="Pending Tasks" onClick={() => onOpenTaskDetailsByTitle("Pending Tasks")} />
              <ChecklistRow text="Awaiting Payments" onClick={() => onOpenTaskDetailsByTitle("Awaiting Payments")} />
              <ChecklistRow text="Fill Health Form" onClick={() => onOpenTaskDetailsByTitle("Fill Health Form")} />
              <ChecklistRow text="Pay Tuition & Fees" onClick={() => onOpenTaskDetailsByTitle("Pay Tuition & Fees")} />
              <ChecklistRow text="Attend Orientation" onClick={() => onOpenTaskDetailsByTitle("Attend Orientation")} />
            </div>

            <div className="panelFooter">
              <span className="mutedLink">Step 2 of 5</span>
              <button className="linkBtn" type="button" onClick={() => openView("checklist")}>
                View Checklist
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <h3 className="sectionTitle">Quick Actions</h3>

          <div className="quickGrid">
            <QuickCard icon={Phone} title="Contact" onClick={() => openView("contact")} />
            <QuickCard icon={Coins} title="Tuition Fees" onClick={() => openView("tuition")} />
            <QuickCard icon={FolderOpen} title="Documents" onClick={() => openView("documents")} />
            <QuickCard icon={GraduationCap} title="Manage Student" onClick={() => openView("manage")} />
          </div>
        </section>
      </div>
    </div>
  );

  // Top bar 
  const renderTopBar = () => (
    <div className="adminTopBar">
      <button
        type="button"
        className="iconBtn"
        onClick={() => alert("Mock: menu")}
        aria-label="Menu"
      >
        <Menu size={22} />
      </button>

      <h2 className="adminTopTitle">Dashboard</h2>

      <div className="adminUser">
        <span className="adminUserName">{MOCK_PARENT.displayName}</span>
        <div className="adminAvatar" />
      </div>
    </div>
  );

  // Sub view shell with back button
  const renderSubViewShell = () => (
    <div className="dashWrap">
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0" }}>
        <button type="button" className="viewBackBtn" onClick={goBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div style={{ fontWeight: 900, fontSize: 16 }}>{viewTitle}</div>
        <div style={{ flex: 1 }} />
      </div>

      {renderActiveView()}
    </div>
  );

  // Bottom nav 
  const renderBottomNav = () => (
    <div className="adminBottomNav">
      <button
        type="button"
        className={`navItem ${view === "dashboard" ? "active" : ""}`}
        onClick={goBack}
      >
        <Home className="navItemIcon" />
        <span>Dashboard</span>
      </button>

      <button
        type="button"
        className={`navItem ${view === "checklist" ? "active" : ""}`}
        onClick={() => openView("checklist")}
      >
        <ListChecks className="navItemIcon" />
        <span>Checklist</span>
      </button>

      <button
        type="button"
        className={`navItem ${view === "calendar" ? "active" : ""}`}
        onClick={() => alert("Mock: calendar later")}
      >
        <Calendar className="navItemIcon" />
        <span>Calendar</span>
      </button>

      <button
        type="button"
        className={`navItem ${view === "manage" ? "active" : ""}`}
        onClick={() => openView("manage")}
      >
        <User className="navItemIcon" />
        <span>Profile</span>
      </button>
    </div>
  );

  return (
    <div className="adminApp">
      {renderTopBar()}

      <div className="adminContent">
        {view === "dashboard" ? renderDashboardHome() : renderSubViewShell()}
      </div>

      {renderBottomNav()}
    </div>
  );
}