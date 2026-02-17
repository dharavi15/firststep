import {
  FileText,
  CheckCircle2,
  ChevronRight,
  Phone,
  Coins,
  FolderOpen,
  GraduationCap,
  Check,
} from "lucide-react";

function WideCard({ icon: Icon, title }) {
  return (
    <button type="button" className="wideCard">
      <div className="wideCardIcon">
        <Icon size={22} />
      </div>
      <div className="wideCardTitle">{title}</div>
    </button>
  );
}

function QuickCard({ icon: Icon, title }) {
  return (
    <button type="button" className="quickCard">
      <Icon size={32} />
      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

function ChecklistRow({ text }) {
  return (
    <div className="checklistRow">
      <div className="checklistLeft">
        <span className="checkCircle">
          <Check size={16} />
        </span>
        <span>{text}</span>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="dashWrap">
      <div className="dashTopGrid">
        <WideCard icon={FileText} title="Enrollment Overview" />
        <WideCard icon={CheckCircle2} title="Completed Onboarding" />
      </div>

      <div className="dashMainGrid">
        {/* Left: checklist card */}
        <section className="panel">
          <h3 className="sectionTitle">Onboarding Checklist</h3>

          <div className="panelCard">
            <div className="panelTitle">Pending Tasks</div>

            <div className="checklistList">
              <ChecklistRow text="Pending Tasks" />
              <ChecklistRow text="Awaiting Payments" />
              <ChecklistRow text="Fill Health Form" />
              <ChecklistRow text="Pay Tuition & Fees" />
              <ChecklistRow text="Attend Orientation" />
            </div>

            <div className="panelFooter">
              <span className="mutedLink">Step 2 of 5</span>
              <button className="linkBtn" type="button">
                View Checklist
              </button>
            </div>
          </div>
        </section>

        {/* Right: quick actions */}
        <section className="panel">
          <h3 className="sectionTitle">Quick Actions</h3>

          <div className="quickGrid">
            <QuickCard icon={Phone} title="Contact" />
            <QuickCard icon={Coins} title="Tuition Fees" />
            <QuickCard icon={FolderOpen} title="Documents" />
            <QuickCard icon={GraduationCap} title="Manage Student" />
          </div>
        </section>
      </div>
    </div>
  );
}
