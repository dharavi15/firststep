import { useMemo, useState } from "react";
import {
  ClipboardList,
  CreditCard,
  PhoneCall,
  Coins,
  FileText,
  Newspaper,
} from "lucide-react";

import EnrollmentOverview from "./EnrollmentOverview";
import PaymentsOverview from "./PaymentsOverview";
import TuitionFees from "./TuitionFees";
import Documents from "./Documents";
import NewsEvents from "./NewsEvents";
import Contact from "./Contact";

// This button is used for the top shortcuts
function WideCard({ title, icon: Icon, onClick }) {
  return (
    <button type="button" className="wideCard" onClick={onClick}>
      <span className="wideCardIcon" aria-hidden="true">
        {Icon ? <Icon size={26} /> : null}
      </span>
      <div className="wideCardTitle">{title}</div>
    </button>
  );
}

// This button is used for quick actions
function QuickCard({ title, icon: Icon, onClick }) {
  return (
    <button type="button" className="quickCard" onClick={onClick}>
      <span className="quickCardIcon" aria-hidden="true">
        {Icon ? <Icon size={28} /> : null}
      </span>
      <div className="quickCardTitle">{title}</div>
    </button>
  );
}

// Text - Stepper style
function ChecklistTextRow({ index, text }) {
  const match = String(text).match(/^Step\s*(\d+)\s*:\s*(.*)$/i);
  const stepNo = match ? match[1] : String(index + 1);
  const stepText = match ? match[2] : text;

  return (
    <div className="pendingStep">
      <div className="pendingStepLeft">
        <div className="pendingStepDot" aria-hidden="true" />
        <div className="pendingStepLine" aria-hidden="true" />
      </div>

      <div className="pendingStepBody">
        <div className="pendingStepHeader">
          <span className="pendingStepBadge">STEP {stepNo}</span>
        </div>
        <div className="pendingStepText">{stepText}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // view controls which screen is visible
  const [view, setView] = useState("dashboard");

  // Go back to main dashboard
  const goBack = () => {
    setView("dashboard");
  };

  // Open a normal view
  const openView = (nextView) => {
    setView(nextView);
  };

  // Title for each view 
  const viewTitle = useMemo(() => {
    if (view === "dashboard") return "Dashboard";
    return "";
  }, [view]);

  // Admin view
  const onboardingSteps = useMemo(
    () => [
      "Step 1: Providing Information to Prospective Parents",
      "Step 2: Making Your Application",
      "Step 3: Submission of application and time frame",
      "Step 4: Admission Interview",
      "Step 5: Offer of Entry and Acceptance",
      "Step 6: Registration",
      "Step 7: Information to registered students and parents",
      "Step 8: Orientation",
    ],
    []
  );

  const renderEnrollment = () => (
    <div className="pagePad">
      <EnrollmentOverview />
    </div>
  );

  const renderPayments = () => (
    <div className="pagePad">
      <PaymentsOverview />
    </div>
  );

  const renderTuition = () => (
    <div className="pagePad">
      <TuitionFees />
    </div>
  );

  const renderDocuments = () => (
    <div className="pagePad">
      <Documents />
    </div>
  );

  const renderNews = () => (
    <div className="pagePad">
      <NewsEvents />
    </div>
  );

  const renderContact = () => (
    <div className="pagePad">
      <Contact />
    </div>
  );

  const renderChecklist = () => (
    <div className="pagePad">
      <div className="eventDetailBlock">
        <div className="eventDetailTitle">Student Onboarding Process</div>
        <div className="eventDetailDesc">Admin view (text only)</div>

        <div className="tableBody tableBodySpaced">
          {onboardingSteps.map((step) => (
            <div key={step} className="profileRowBtn profileRowBtnStatic">
              <span className="profileRowName">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // This decides which screen to render
  const renderActiveView = () => {
    if (view === "enrollment") return renderEnrollment();
    if (view === "payments") return renderPayments();
    if (view === "tuition") return renderTuition();
    if (view === "documents") return renderDocuments();
    if (view === "news") return renderNews();
    if (view === "contact") return renderContact();
    if (view === "checklist") return renderChecklist();
    return null;
  };

  // Dashboard home
  const renderDashboardHome = () => (
    <div className="dashWrap">
      <div className="dashTopGrid">
        <WideCard
          title="Enrollment Overview"
          icon={ClipboardList}
          onClick={() => openView("enrollment")}
        />
        <WideCard
          title="Payments Overview"
          icon={CreditCard}
          onClick={() => openView("payments")}
        />
      </div>

      <div className="dashMainGrid">
        <section className="panel">
          <h3 className="sectionTitle">Student Onboarding Process</h3>

          <div className="panelCard">
            <div className="panelTitle">Application Progress</div>

            <div className="pendingStepsWrap">
              {onboardingSteps.map((step, idx) => (
                <ChecklistTextRow key={step} index={idx} text={step} />
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <h3 className="sectionTitle">Quick Actions</h3>

          <div className="quickGrid">
            <QuickCard
              title="Contact"
              icon={PhoneCall}
              onClick={() => openView("contact")}
            />
            <QuickCard
              title="Tuition Fees"
              icon={Coins}
              onClick={() => openView("tuition")}
            />
            <QuickCard
              title="Documents"
              icon={FileText}
              onClick={() => openView("documents")}
            />
            <QuickCard
              title="News & Events"
              icon={Newspaper}
              onClick={() => openView("news")}
            />
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