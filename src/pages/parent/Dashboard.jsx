/*import { useMemo, useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  Phone,
  Coins,
  FileText,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const MOCK_USER = {
  studentName: "Ethan Parker",
  progressPercent: 40,
};

// Icon must be a React component from lucide-react
// This card is used for the top shortcut section
function WideCard({ title, Icon, onClick }) {
  return (
    <button type="button" className="wideCard" onClick={onClick}>
      <div className="wideCardIcon">
        {Icon ? <Icon size={20} /> : null}
      </div>

      <div className="wideCardTitle">{title}</div>
    </button>
  );
}

// Icon must be a React component from lucide-react
// This card is used for quick action buttons
function QuickCard({ title, Icon, onClick }) {
  return (
    <button type="button" className="quickCard" onClick={onClick}>
      <div className="quickCardIcon">
        {Icon ? <Icon size={22} /> : null}
      </div>

      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

// This row is used inside the checklist section
function ChecklistRow({ text, onClick }) {
  return (
    <button type="button" className="checklistRow" onClick={onClick}>
      <div className="checklistLeft">
        <span className="checkCircle">
          <CheckCircle2 size={16} />
        </span>

        <span>{text}</span>
      </div>

      <span className="checklistRight">
        Open <ChevronRight size={16} />
      </span>
    </button>
  );
}

export default function ParentDashboard() {
  const [view, setView] = useState("dashboard");

  const openView = (nextView) => setView(nextView);
  const goBack = () => setView("dashboard");

  const viewTitle = useMemo(() => {
    if (view === "enrollment") return "Enrollment Overview";
    if (view === "completed") return "Completed Onboarding";
    if (view === "contact") return "Contact";
    if (view === "tuition") return "Tuition Fees";
    if (view === "documents") return "Documents";
    if (view === "manage") return "Manage Student";
    if (view === "checklist") return "Onboarding Checklist";
    return "Dashboard";
  }, [view]);

  const renderSimplePage = (heading, desc) => {
    return (
      <div className="pagePad">
        <div className="eventDetailBlock">
          <div className="eventDetailTitle">{heading}</div>
          <div className="eventDetailDesc">{desc}</div>

          <div className="emptyState">
            Student {MOCK_USER.studentName} progress {MOCK_USER.progressPercent} percent
          </div>

          <div className="modalActions">
            <button type="button" className="btnOutlinePrimary" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardHome = () => {
    return (
      <div className="dashWrap">
        <div className="dashTopGrid">
          <WideCard
            title="Enrollment Overview"
            Icon={ClipboardList}
            onClick={() => openView("enrollment")}
          />

          <WideCard
            title="Completed Onboarding"
            Icon={CheckCircle2}
            onClick={() => openView("completed")}
          />
        </div>

        <div className="dashMainGrid">
          <section>
            <h3 className="sectionTitle">Onboarding Checklist</h3>

            <div className="panelCard">
              <div className="panelTitle">Pending Tasks</div>

              <div className="checklistList">
                <ChecklistRow text="Pending Tasks" onClick={() => openView("checklist")} />
                <ChecklistRow text="Awaiting Payments" onClick={() => openView("checklist")} />
                <ChecklistRow text="Fill Health Form" onClick={() => openView("checklist")} />
                <ChecklistRow text="Pay Tuition and Fees" onClick={() => openView("checklist")} />
                <ChecklistRow text="Attend Orientation" onClick={() => openView("checklist")} />
              </div>

              <div className="panelFooter">
                <span className="mutedLink">Step 2 of 5</span>

                <button className="linkBtn" type="button" onClick={() => openView("checklist")}>
                  View Checklist
                </button>
              </div>
            </div>
          </section>

          <section>
            <h3 className="sectionTitle">Quick Actions</h3>

            <div className="quickGrid">
              <QuickCard title="Contact" Icon={Phone} onClick={() => openView("contact")} />
              <QuickCard title="Tuition Fees" Icon={Coins} onClick={() => openView("tuition")} />
              <QuickCard title="Documents" Icon={FileText} onClick={() => openView("documents")} />
              <QuickCard title="Manage Student" Icon={GraduationCap} onClick={() => openView("manage")} />
            </div>
          </section>
        </div>
      </div>
    );
  };

  if (view === "dashboard") {
    return renderDashboardHome();
  }

  return (
    <div className="dashWrap">
      <div className="viewTopBar">
        <button type="button" className="viewBackBtn" onClick={goBack}>
          Back
        </button>

        <div className="viewTitle">{viewTitle}</div>
        <div className="viewRightSpace" />
      </div>

      {view === "enrollment" && renderSimplePage("Enrollment Overview", "Mock page for now")}
      {view === "completed" && renderSimplePage("Completed Onboarding", "Mock page for now")}
      {view === "contact" && renderSimplePage("Contact School", "Mock page for now")}
      {view === "tuition" && renderSimplePage("Tuition Fees", "Mock page for now")}
      {view === "documents" && renderSimplePage("Documents", "Mock page for now")}
      {view === "manage" && renderSimplePage("Manage Student", "Mock page for now")}
      {view === "checklist" && renderSimplePage("Onboarding Checklist", "Mock page for now")}
    </div>
  );
}*/