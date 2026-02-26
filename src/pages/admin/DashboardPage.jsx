import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { getStudentsForAdmin } from "../../services/studentService";

// This button is used for the top shortcuts
function WideCard({ title, onClick }) {
  return (
    <button type="button" className="wideCard" onClick={onClick}>
      <div className="wideCardTitle">{title}</div>
    </button>
  );
}

// This button is used for quick actions
function QuickCard({ title, onClick }) {
  return (
    <button type="button" className="quickCard" onClick={onClick}>
      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

// This row is used for checklist items
function ChecklistRow({ text, onClick }) {
  return (
    <button type="button" className="checklistRow" onClick={onClick}>
      <div className="checklistLeft">
        <span>{text}</span>
      </div>
      <span>Open</span>
    </button>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  // view controls which screen is visible
  const [view, setView] = useState("dashboard");

  // selectedTaskTitle is used for the task details screen
  const [selectedTaskTitle, setSelectedTaskTitle] = useState("");

  // students is loaded from Firestore
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    let alive = true;

    const schoolId = user?.schoolId;

    // Do not load until we have schoolId
    if (!schoolId) {
      setStudents([]);
      setStudentsError("");
      setLoadingStudents(false);

      return () => {
        alive = false;
      };
    }

    const loadStudents = async () => {
      setLoadingStudents(true);
      setStudentsError("");

      try {
        const rows = await getStudentsForAdmin({ schoolId });

        // Debug logs (keep for now)
        console.log("DashboardPage: schoolId used =", schoolId);
        console.log(
          "DashboardPage: students count =",
          Array.isArray(rows) ? rows.length : 0
        );
        console.log(
          "DashboardPage: first =",
          Array.isArray(rows) ? rows[0] : null
        );

        if (alive) {
          setStudents(Array.isArray(rows) ? rows : []);
        }
      } catch (error) {
        if (alive) {
          setStudents([]);
          setStudentsError(error?.message || "Cannot load students");
        }
      } finally {
        // Do not return inside finally (eslint no-unsafe-finally)
        if (alive) {
          setLoadingStudents(false);
        }
      }
    };

    loadStudents();

    return () => {
      alive = false;
    };
  }, [user?.schoolId]);

  // Go back to main dashboard
  const goBack = () => {
    setView("dashboard");
    setSelectedTaskTitle("");
  };

  // Open a normal view
  const openView = (nextView) => {
    setSelectedTaskTitle("");
    setView(nextView);
  };

  // Open task details view
  const openTaskDetails = (title) => {
    setSelectedTaskTitle(title);
    setView("taskDetails");
  };

  // Title for each view
  const viewTitle = useMemo(() => {
    if (view === "enrollment") return "Enrollment Overview";
    if (view === "completed") return "Completed Onboarding";
    if (view === "tuition") return "Tuition Fees";
    if (view === "documents") return "Documents";
    if (view === "manage") return "Manage Student";
    if (view === "contact") return "Contact";
    if (view === "checklist") return "Onboarding Checklist";
    if (view === "taskDetails") return selectedTaskTitle || "Task Details";
    return "Dashboard";
  }, [view, selectedTaskTitle]);

  // Render a list of students from Firestore
  const renderStudentsList = () => {
    if (!user?.schoolId) {
      return <div className="emptyState">No schoolId found for this user</div>;
    }

    if (loadingStudents) {
      return <div className="emptyState">Loading students</div>;
    }

    if (studentsError) {
      return <div className="emptyState">{studentsError}</div>;
    }

    if (!students.length) {
      return <div className="emptyState">No students found</div>;
    }

    return (
      <div className="tableBody tableBodySpaced">
        {students.map((s) => {
          const name = s.studentName || s.name || "No name";

          const yearValue =
            typeof s.year === "number"
              ? s.year
              : typeof s.grade === "number"
              ? s.grade
              : null;

          const yearText = yearValue ? `Year ${yearValue}` : "No grade";

          const statusText = s.status || s.overallStatus || "pending";

          return (
            <div key={s.id} className="profileInfoRow">
              <div className="profileInfoLeft">
                <span className="profileInfoLabel">{name}</span>
              </div>

              <div className="profileInfoValue">
                <span className="studentMeta">{yearText}</span>
                <span className="studentMeta">{statusText}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderEnrollment = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Students Overview</div>
        <div className="eventDetailDesc">This list is loaded from Firestore</div>
        {renderStudentsList()}
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Completed Onboarding</div>
        <div className="eventDetailDesc">Connect a completed collection later</div>
        <div className="emptyState">No data yet</div>
      </div>
    </div>
  );

  const renderTuition = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Tuition Fees</div>
        <div className="eventDetailDesc">Connect a payments collection later</div>
        <div className="emptyState">No data yet</div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Documents</div>
        <div className="eventDetailDesc">Connect a documents collection later</div>
        <div className="emptyState">No data yet</div>
      </div>
    </div>
  );

  const renderManage = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Manage Student</div>
        <div className="eventDetailDesc">This list is loaded from Firestore</div>

        {renderStudentsList()}

        <div className="modalActions">
          <button type="button" className="btnOutlinePrimary" onClick={goBack}>
            Back
          </button>

          <button
            type="button"
            className="btnPrimary btnPrimaryAuto"
            onClick={() => alert("Add student later")}
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
        <div className="eventDetailTitle">Contact</div>
        <div className="eventDetailDesc">Connect a real contact feature later</div>

        <div className="modalForm modalFormSpaced">
          <label className="modalLabel">
            Subject
            <input className="modalInput" placeholder="Subject" />
          </label>

          <label className="modalLabel">
            Name
            <input className="modalInput" placeholder="Name" />
          </label>

          <label className="modalLabel">
            Email
            <input className="modalInput" placeholder="Email" />
          </label>

          <label className="modalLabel">
            Message
            <textarea className="modalInput" placeholder="Message" rows={4} />
          </label>

          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={goBack}>
              Cancel
            </button>

            <button
              type="button"
              className="btnPrimary btnPrimaryAuto"
              onClick={() => alert("Send later")}
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
        <div className="eventDetailTitle">Onboarding Checklist</div>
        <div className="eventDetailDesc">Click a task to view details</div>

        <div className="tableBody tableBodySpaced">
          <button
            type="button"
            className="profileRowBtn"
            onClick={() => openTaskDetails("Pending Tasks")}
          >
            <span className="profileRowName">Pending Tasks</span>
          </button>

          <button
            type="button"
            className="profileRowBtn"
            onClick={() => openTaskDetails("Awaiting Payments")}
          >
            <span className="profileRowName">Awaiting Payments</span>
          </button>

          <button
            type="button"
            className="profileRowBtn"
            onClick={() => openTaskDetails("Fill Health Form")}
          >
            <span className="profileRowName">Fill Health Form</span>
          </button>

          <button
            type="button"
            className="profileRowBtn"
            onClick={() => openTaskDetails("Pay Tuition and Fees")}
          >
            <span className="profileRowName">Pay Tuition and Fees</span>
          </button>

          <button
            type="button"
            className="profileRowBtn"
            onClick={() => openTaskDetails("Attend Orientation")}
          >
            <span className="profileRowName">Attend Orientation</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTaskDetails = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">
          {selectedTaskTitle || "Task Details"}
        </div>
        <div className="eventDetailDesc">This screen can show real task data later</div>

        <div className="modalActions">
          <button
            type="button"
            className="btnOutlinePrimary"
            onClick={() => openView("checklist")}
          >
            Back to Checklist
          </button>

          <button type="button" className="btnPrimary" onClick={goBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // This decides which screen to render
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

  const renderDashboardHome = () => (
    <div className="dashWrap">
      <div className="dashTopGrid">
        <WideCard title="Enrollment Overview" onClick={() => openView("enrollment")} />
        <WideCard title="Completed Onboarding" onClick={() => openView("completed")} />
      </div>

      <div className="dashMainGrid">
        <section className="panel">
          <h3 className="sectionTitle">Onboarding Checklist</h3>

          <div className="panelCard">
            <div className="panelTitle">Pending Tasks</div>

            <div className="checklistList">
              <ChecklistRow text="Pending Tasks" onClick={() => openTaskDetails("Pending Tasks")} />
              <ChecklistRow text="Awaiting Payments" onClick={() => openTaskDetails("Awaiting Payments")} />
              <ChecklistRow text="Fill Health Form" onClick={() => openTaskDetails("Fill Health Form")} />
              <ChecklistRow text="Pay Tuition and Fees" onClick={() => openTaskDetails("Pay Tuition and Fees")} />
              <ChecklistRow text="Attend Orientation" onClick={() => openTaskDetails("Attend Orientation")} />
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
            <QuickCard title="Contact" onClick={() => openView("contact")} />
            <QuickCard title="Tuition Fees" onClick={() => openView("tuition")} />
            <QuickCard title="Documents" onClick={() => openView("documents")} />
            <QuickCard title="Manage Student" onClick={() => openView("manage")} />
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div>
      {view === "dashboard" ? (
        renderDashboardHome()
      ) : (
        <div className="dashWrap">
          <div className="viewTopBar">
            <button type="button" className="viewBackBtn" onClick={goBack}>
              <span>Back</span>
            </button>

            <div className="viewTitle">{viewTitle}</div>
            <div className="viewRightSpace" />
          </div>

          {renderActiveView()}
        </div>
      )}
    </div>
  );
}