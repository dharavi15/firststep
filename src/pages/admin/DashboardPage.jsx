import { useMemo, useState } from "react";
import {
  FileText,
  CheckCircle2,
  ChevronRight,
  Phone,
  Coins,
  FolderOpen,
  GraduationCap,
  Check,
  ArrowLeft,
} from "lucide-react";

// UI Components 

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

function QuickCard({ icon, title, onClick }) {
  const Icon = icon;
  return (
    <button type="button" className="quickCard" onClick={onClick}>
      <Icon size={32} />
      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

// use <button> here so the whole row is clickable.
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

// MOCK Data 

const MOCK_STUDENTS = [
  {
    id: "stu_001",
    studentName: "Emma Johnson",
    parentName: "Michael Johnson",
    classYear: "Year 1",
    status: "Completed",
    date: "14/2/2026",
  },
  {
    id: "stu_002",
    studentName: "Liam Carter",
    parentName: "Sarah Carter",
    classYear: "Year 2",
    status: "Pending",
    date: "12/2/2026",
  },
  {
    id: "stu_003",
    studentName: "Alex Miller",
    parentName: "John Miller",
    classYear: "Year 3",
    status: "Completed",
    date: "10/2/2026",
  },
];

const MOCK_COMPLETED = [
  {
    id: "c_001",
    name: "Ethan Parker",
    parent: "Daniel Parker",
    classYear: "Year 1",
    completedDate: "5/2/2026",
  },
  {
    id: "c_002",
    name: "Lucas Reed",
    parent: "Matthew Reed",
    classYear: "Year 2",
    completedDate: "4/2/2026",
  },
  {
    id: "c_003",
    name: "Oliver Bennett",
    parent: "Christopher Bennett",
    classYear: "Year 3",
    completedDate: "3/2/2026",
  },
];

const MOCK_TUITION = [
  {
    id: "t_001",
    name: "Ethan Parker",
    parent: "Daniel Parker",
    classYear: "Year 1",
    amountDue: "20,000.00 THB",
    dueDate: "5/1/2026",
    payStatus: "Unpaid",
  },
  {
    id: "t_002",
    name: "Lucas Reed",
    parent: "Lucas Reed",
    classYear: "Year 2",
    amountDue: "Pending (2 days)",
    dueDate: "4/1/2026",
    payStatus: "Pending",
  },
  {
    id: "t_003",
    name: "Mia Thompson",
    parent: "Sarah Thompson",
    classYear: "Year 3",
    amountDue: "Paid",
    dueDate: "3/1/2026",
    payStatus: "Paid",
  },
];

const MOCK_DOCS = [
  {
    id: "d_001",
    name: "Ethan Parker",
    parent: "Daniel Parker",
    classYear: "Year 1",
    document: "Proof of Payment",
    dateUploaded: "5/1/2026",
  },
  {
    id: "d_002",
    name: "Lucas Reed",
    parent: "Lucas Reed",
    classYear: "Year 2",
    document: "Birth Certificate",
    dateUploaded: "4/1/2026",
  },
  {
    id: "d_003",
    name: "Mia Thompson",
    parent: "Sarah Thompson",
    classYear: "Year 3",
    document: "Custody Document",
    dateUploaded: "3/1/2026",
  },
];

const MOCK_MANAGE = [
  {
    id: "m_001",
    name: "Ethan Parker",
    parent: "Daniel Parker",
    classYear: "Year 1",
    status: "Enrolled",
    contact: "Call / Email",
  },
  {
    id: "m_002",
    name: "Lucas Reed",
    parent: "Lucas Reed",
    classYear: "Year 2",
    status: "Pending",
    contact: "Call / Email",
  },
  {
    id: "m_003",
    name: "Mia Thompson",
    parent: "Sarah Thompson",
    classYear: "Year 3",
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
    description: "Some students have outstanding tuition and fees to be paid.",
    steps: ["Open Tuition Fees", "Find overdue items", "Send reminder / contact parent"],
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

// Main Page 

export default function DashboardPage() {
  // view controls "which screen is visible"
  const [view, setView] = useState("dashboard");

  // selectedTask holds task data for the details screen - used only when view "taskDetails"
  const [selectedTask, setSelectedTask] = useState(null);

  // go back to main dashboard
  const goBack = () => {
    setView("dashboard");
    setSelectedTask(null);
  };

  // Open a normal view (enrollment, completed, contact, etc.)
  const openView = (nextView) => {
    setSelectedTask(null);
    setView(nextView);
  };

  // Open task details view and remember which task
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setView("taskDetails");
  };

  // Find task by title (for pending list rows)
  const onOpenTaskDetailsByTitle = (title) => {
    const task = MOCK_TASKS.find((t) => t.title === title) || null;
    openTaskDetails(task);
  };

  // title for each view (top of the section)
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

  // Renders for each view 

  const renderEnrollment = () => (
    <div className="pagePad">
      {/* Simple mock list (replace with Firebase later) */}
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Students Overview (Mock)</div>
        <div className="eventDetailDesc">
          This is mock data for now. Later you can replace with Firebase.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_STUDENTS.map((s) => (
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

  const renderCompleted = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Completed List (Mock)</div>
        <div className="eventDetailDesc">
          Replace with Firebase later. For now, just showing mock rows.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_COMPLETED.map((r) => (
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

  const renderTuition = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Tuition Fees (Mock)</div>
        <div className="eventDetailDesc">
          Later: connect to Firebase payments collection.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_TUITION.map((t) => (
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

  const renderDocuments = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Documents (Mock)</div>
        <div className="eventDetailDesc">
          Later: show uploaded documents from Firebase storage/collection.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_DOCS.map((d) => (
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

  const renderManage = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Manage Student (Mock)</div>
        <div className="eventDetailDesc">
          Later: CRUD students with Firebase. For now: mock list.
        </div>

        <div className="tableBody" style={{ marginTop: 10 }}>
          {MOCK_MANAGE.map((m) => (
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
          {/* reuse existing button styles */}
          <button type="button" className="btnOutlinePrimary" onClick={goBack}>
            Back
          </button>
          <button
            type="button"
            className="btnPrimary"
            style={{ width: "auto", padding: "10px 14px" }}
            onClick={() => alert("Mock: Add Student")}
          >
            Add Student
          </button>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Contact (Mock)</div>
        <div className="eventDetailDesc">
          Later: connect to email service or Firebase.
        </div>

        <div className="modalForm" style={{ marginTop: 8 }}>
          <label className="modalLabel">
            Subject
            <input className="modalInput" placeholder="Subject" />
          </label>

          <label className="modalLabel">
            Name
            <input className="modalInput" placeholder="Your name" />
          </label>

          <label className="modalLabel">
            Email
            <input className="modalInput" placeholder="your@email.com" />
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

  const renderChecklist = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Onboarding Checklist (Mock)</div>
        <div className="eventDetailDesc">
          Click a task to view details. (Still in the same file)
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

  const renderTaskDetails = () => {
    if (!selectedTask) {
      return (
        <div className="pagePad">
          <div className="emptyState">No task selected.</div>
          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={openView.bind(null, "checklist")}>
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

  // This renders the correct view content  
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

  // Dashboard (Home Screen) 

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
              {/* Each row opens a details screen */}
              <ChecklistRow text="Pending Tasks" onClick={() => onOpenTaskDetailsByTitle("Pending Tasks")} />
              <ChecklistRow text="Awaiting Payments" onClick={() => onOpenTaskDetailsByTitle("Awaiting Payments")} />
              <ChecklistRow text="Fill Health Form" onClick={() => onOpenTaskDetailsByTitle("Fill Health Form")} />
              <ChecklistRow text="Pay Tuition & Fees" onClick={() => onOpenTaskDetailsByTitle("Pay Tuition & Fees")} />
              <ChecklistRow text="Attend Orientation" onClick={() => onOpenTaskDetailsByTitle("Attend Orientation")} />
            </div>

            <div className="panelFooter">
              <span className="mutedLink">Step 2 of 5</span>

              {/* This opens the checklist list screen */}
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

  // Final Render  

  return (
    <div>
      {/* If view is dashboard, show normal dashboard UI */}
      {view === "dashboard" ? (
        renderDashboardHome()
      ) : (
        <div className="dashWrap">
          {/* Top header bar for the "sub-pages" */}
          <div className="viewTopBar">
            <button type="button" className="viewBackBtn" onClick={goBack}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>

            <div className="viewTitle">{viewTitle}</div>

            {/* Right side spacer (keeps title centered nicely) */}
            <div className="viewRightSpace" />
          </div>

          {/* Active view content */}
          {renderActiveView()}
        </div>
      )}
    </div>
  );
}