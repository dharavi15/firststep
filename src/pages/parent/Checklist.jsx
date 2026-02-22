// src/pages/parent/Checklist.jsx
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Menu, Home, ListChecks, CalendarDays, User } from "lucide-react";

// mock up: private student for logged-in parent
// later you can replace this with Firebase user + student query
const PRIVATE_STUDENT = {
  id: "s-ethan",
  name: "Ethan Parker",
  parent: "Daniel Parker",
  email: "daniel@gmail.com",
  classYear: "Year 1",
};

// mock up steps (same logic as admin)
const STEPS = [
  {
    no: 1,
    title: "Awaiting Payment",
    status: "Completed",
    statusTone: "ok",
    dueLeft: "Due 25 Feb",
    dueRight: "25 Feb",
  },
  {
    no: 2,
    title: "Fill Health Form",
    status: "Completed",
    statusTone: "ok",
    dueLeft: "Due 25 Feb",
    dueRight: "25 Feb",
  },
  {
    no: 3,
    title: "Pay Tuition & Fees",
    status: "Pending (2 days left)",
    statusTone: "warn",
    dueLeft: "Due 25 Feb",
    dueRight: "25 Feb",
  },
  {
    no: 4,
    title: "Attend Orientation",
    status: "Upcoming",
    statusTone: "neutral",
    dueLeft: "April 30",
    dueRight: "April 30",
  },
  {
    no: 5,
    title: "Upload Proof of Payment",
    status: "Upcoming",
    statusTone: "neutral",
    dueLeft: "Upcoming",
    dueRight: "Upcoming",
  },
];

function AvatarInitial({ name, className = "ckDAvatar" }) {
  const initials = useMemo(() => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  }, [name]);

  return <span className={className}>{initials || "P"}</span>;
}

function StatusPill({ tone = "neutral", text }) {
  const cls =
    tone === "ok"
      ? "statusPill ok"
      : tone === "warn"
      ? "statusPill warn"
      : "statusPill neutral";

  return <span className={cls}>{text}</span>;
}

export default function Checklist() {
  const student = PRIVATE_STUDENT;

  const completedCount = useMemo(() => {
    return STEPS.filter((s) => s.statusTone === "ok").length;
  }, []);

  const totalCount = STEPS.length;

  const percentDone = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((completedCount / totalCount) * 100);
  }, [completedCount, totalCount]);

  const nextDeadlineText = "25 February 2026";

  function onDownloadPdf() {
    console.log("Parent download PDF for student:", student.id);
  }

  return (
    <div className="adminApp">
      <div className="adminTopBar">
        <button type="button" className="iconBtn" onClick={() => console.log("Menu")}>
          <Menu size={22} />
        </button>

        <h1 className="adminTopTitle">Checklist</h1>

        <div className="adminUser">
          <span className="adminUserName">Miss ABC</span>
          <div className="adminAvatar" />
        </div>
      </div>

      <div className="adminContent">
        <div className="ckDWrap">
          <div className="ckDHeader">
            <AvatarInitial name={student.name} className="ckDAvatar" />

            <div className="ckDHeaderText">
              <div className="ckDTitleSmall">Onboarding Checklist for</div>

              <div className="ckDNameRow">
                <div className="ckDName">{student.name}</div>
                <div className="ckDYear">({student.classYear})</div>
              </div>

              <div className="ckDMeta">
                <div className="ckDParent">{student.parent}</div>
                <div className="ckDEmail">{student.email}</div>
              </div>
            </div>
          </div>

          <div className="ckDProgressCard">
            <div className="ckDProgressTop">
              <div className="ckDProgressLabel">Enrollment Progress</div>

              <div className="ckDProgressRight">
                <span className="ckDProgressPercent">{percentDone}%</span>
                <span className="ckDProgressCompletedText">Completed</span>
              </div>
            </div>

            <div className="ckDBar">
              <div className="ckDFill" style={{ width: `${percentDone}%` }} />
            </div>

            <div className="ckDProgressBottom">
              <div>
                <span className="ckDBadge">
                  {completedCount} of {totalCount}
                </span>
                <span className="ckDMuted">Steps completed</span>
              </div>

              <div>
                <span className="ckDMuted">Next Deadline:</span>
                <b className="ckDDeadlineBold">{nextDeadlineText}</b>
              </div>
            </div>
          </div>

          <div className="ckDTableCard">
            <div className="ckDTableHeader">
              <div className="ckDTh ckDThNo">#</div>
              <div className="ckDTh">Step</div>
              <div className="ckDTh">Status</div>
              <div className="ckDTh">Deadline</div>
              <div className="ckDTh">Deadline</div>
            </div>

            <div className="ckDTableBody">
              {STEPS.map((s) => (
                <div
                  key={s.no}
                  className={`ckDRow ${s.statusTone === "warn" ? "ckDRowWarn" : ""}`}
                >
                  <div className="ckDTd ckDTdNo">
                    <span
                      className={
                        s.statusTone === "ok"
                          ? "ckDDot ckDDotOk"
                          : s.statusTone === "warn"
                          ? "ckDDot ckDDotWarn"
                          : "ckDDot ckDDotUp"
                      }
                    />
                    <span className="ckDNoText">{s.no}.</span>
                  </div>

                  <div className="ckDTd ckDTdStep">
                    <b>{s.title}</b>
                  </div>

                  <div className="ckDTd">
                    <StatusPill tone={s.statusTone} text={s.status} />
                  </div>

                  <div className="ckDTd ckDTdDueLeft">{s.dueLeft}</div>

                  <div className="ckDTd ckDTdDueRight">
                    <b>{s.dueRight}</b>
                  </div>
                </div>
              ))}
            </div>

            <div className="ckDBottomBar">
              <div className="ckDLegend">
                <span className="ckDLegendItem">
                  <span className="ckDMuted">Status:</span> <b>On Track</b>
                </span>

                <span className="ckDLegendItem">
                  <span className="ckDDot ckDDotWarn" />
                  <span className="ckDMuted">Pending</span>
                </span>

                <span className="ckDLegendItem">
                  <span className="ckDDot ckDDotUp" />
                  <span className="ckDMuted">Upcoming</span>
                </span>
              </div>

              <button type="button" className="ckDDownloadBtn" onClick={onDownloadPdf}>
                Download Current Step PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="adminBottomNav">
        <NavLink to="/parent/dashboard" className="navItem">
          <Home className="navItemIcon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/parent/checklist" className="navItem">
          <ListChecks className="navItemIcon" />
          <span>Checklist</span>
        </NavLink>

        <NavLink to="/parent/calendar" className="navItem">
          <CalendarDays className="navItemIcon" />
          <span>Calendar</span>
        </NavLink>

        <NavLink to="/parent/profile" className="navItem">
          <User className="navItemIcon" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}