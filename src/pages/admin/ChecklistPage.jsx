import { useMemo, useState } from "react";
import { Search } from "lucide-react";

// mock up student data
// can change to DB or API later
const STUDENTS = [
  {
    id: "s-ethan",
    name: "Ethan Parker",
    parent: "Daniel Parker",
    email: "daniel@gmail.com",
    classYear: "Year 1",
    status: "Pending (2 days left)",
    statusTone: "warn",
  },
  {
    id: "s-lucas",
    name: "Lucas Reed",
    parent: "Lucas Reed",
    email: "lucas@gmail.com",
    classYear: "Year 2",
    status: "Completed",
    statusTone: "ok",
  },
  {
    id: "s-mia",
    name: "Mia Thompson",
    parent: "Sarah Thompson",
    email: "sarah@gmail.com",
    classYear: "Year 3",
    status: "Pending (7 days left)",
    statusTone: "warn",
  },
  {
    id: "s-ava",
    name: "Ava Collins",
    parent: "Emily Collins",
    email: "emily@gmail.com",
    classYear: "Year 4",
    status: "Pending",
    statusTone: "neutral",
  },
  {
    id: "s-sophia",
    name: "Sophia Martinez",
    parent: "Laura Martinez",
    email: "laura@gmail.com",
    classYear: "Year 5",
    status: "Completed",
    statusTone: "ok",
  },
];

// mock up steps for tracking page
// statusTone uses your existing StatusPill CSS: ok / warn / neutral
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

// create simple avatar using emoji
// this avoids using real image for now
function AvatarEmoji({ name, className = "studentAvatar" }) {
  // choose emoji based on name
  // same name will always get same emoji
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];
    let sum = 0;

    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    return pool[sum % pool.length];
  }, [name]);

  return <span className={className}>{emoji}</span>;
}

// show status with different color style
// tone controls which CSS class is used
function StatusPill({ tone = "neutral", text }) {
  const cls =
    tone === "ok"
      ? "statusPill ok"
      : tone === "warn"
      ? "statusPill warn"
      : "statusPill neutral";

  return <span className={cls}>{text}</span>;
}

export default function ChecklistPage() {
  // q = search text for list page
  const [q, setQ] = useState("");

  // page = current page number for list page
  const [page, setPage] = useState(1);

  // selectedStudentId controls which view we show
  // null means list page
  // not null means tracking page
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // how many students per page
  const pageSize = 8;

  // filter students based on search text
  // useMemo makes it recalculate only when q changes
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return STUDENTS;

    return STUDENTS.filter((s) => {
      return (
        s.name.toLowerCase().includes(query) ||
        s.parent.toLowerCase().includes(query) ||
        s.classYear.toLowerCase().includes(query) ||
        s.status.toLowerCase().includes(query)
      );
    });
  }, [q]);

  // calculate how many pages we need
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  // make sure current page does not go over total pages
  const safePage = Math.min(page, pageCount);

  // get only students for current page
  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  // go to previous page
  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  // go to next page
  function goNext() {
    setPage((p) => Math.min(pageCount, p + 1));
  }

  // open tracking page for the selected student
  function onOpenStudent(studentId) {
    setSelectedStudentId(studentId);
  }

  // go back to list page
  function onBackToList() {
    setSelectedStudentId(null);
  }

  // find selected student info
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return STUDENTS.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId]);

  // download pdf (mock)
  function onDownloadPdf() {
    console.log("Download Current Step PDF:", selectedStudentId);
  }

  // show tracking page if we have selected student
  if (selectedStudent) {
    // calculate progress from steps
    const completedCount = STEPS.filter((s) => s.statusTone === "ok").length;
    const totalCount = STEPS.length;
    const percentDone = totalCount
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

    // next deadline mock text
    const nextDeadlineText = "25 February 2026";

    return (
      <div className="ckDWrap">
        <div className="ckDHeader">
          <AvatarEmoji name={selectedStudent.name} className="ckDAvatar" />

          <div className="ckDHeaderText">
            <div className="ckDTitleSmall">Onboarding Checklist for</div>

            <div className="ckDNameRow">
              <div className="ckDName">{selectedStudent.name}</div>
              <div className="ckDYear">({selectedStudent.classYear})</div>
            </div>

            <div className="ckDMeta">
              <div className="ckDParent">{selectedStudent.parent}</div>
              <div className="ckDEmail">{selectedStudent.email}</div>
            </div>
          </div>

          <button type="button" className="ckDBackBtn" onClick={onBackToList}>
            Back to list
          </button>
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
            <div className="ckDStepsDone">
              <span className="ckDBadge">
                {completedCount} of {totalCount}
              </span>
              <span className="ckDMuted">Steps completed</span>
            </div>

            <div className="ckDDeadline">
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
                className={`ckDRow ${
                  s.statusTone === "warn" ? "ckDRowWarn" : ""
                }`}
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

            <button
              type="button"
              className="ckDDownloadBtn"
              onClick={onDownloadPdf}
            >
              Download Current Step PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  // list page (default view)
  return (
    <div className="checklistWrap">
      <div className="searchCard">
        <Search className="searchIcon" size={20} />
        <input
          className="searchInput"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search"
        />
      </div>

      <div className="tableCard">
        <div className="tableHeader">
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
        </div>

        <div className="tableBody">
          {rows.map((s) => (
            <button
              key={s.id}
              type="button"
              className="tableRow"
              onClick={() => onOpenStudent(s.id)}
            >
              <div className="td tdCheck">
                <input type="checkbox" onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="td tdName">
                <AvatarEmoji name={s.name} />
                <span className="studentName">{s.name}</span>
              </div>

              <div className="td">{s.parent}</div>

              <div className="td">{s.classYear}</div>

              <div className="td tdStatus">
                <StatusPill tone={s.statusTone} text={s.status} />
              </div>
            </button>
          ))}

          {rows.length === 0 && <div className="emptyState">No students found.</div>}
        </div>

        <div className="tableFooter">
          <div className="pageText">
            Page : <b>{safePage}</b> of <b>{pageCount}</b>
          </div>

          <div className="pageBtns">
            <button
              type="button"
              className="pageBtn"
              onClick={goPrev}
              disabled={safePage <= 1}
            >
              ‹
            </button>

            <button
              type="button"
              className="pageBtn"
              onClick={goNext}
              disabled={safePage >= pageCount}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}