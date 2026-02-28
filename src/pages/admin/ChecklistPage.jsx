/*import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

// mock up steps for tracking page (keep for now)
const STEPS = [
  { no: 1, title: "Awaiting Payment", status: "Completed", statusTone: "ok", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 2, title: "Fill Health Form", status: "Completed", statusTone: "ok", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 3, title: "Pay Tuition & Fees", status: "Pending (2 days left)", statusTone: "warn", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 4, title: "Attend Orientation", status: "Upcoming", statusTone: "neutral", dueLeft: "April 30", dueRight: "April 30" },
  { no: 5, title: "Upload Proof of Payment", status: "Upcoming", statusTone: "neutral", dueLeft: "Upcoming", dueRight: "Upcoming" },
];

// create simple avatar using emoji
function AvatarEmoji({ name, className = "studentAvatar" }) {
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒"]; // keep consistent look
    const safe = (name || "").trim();
    if (!safe) return "🧒";
    let sum = 0;
    for (let i = 0; i < safe.length; i++) sum += safe.charCodeAt(i);
    return pool[sum % pool.length];
  }, [name]);

  return <span className={className}>{emoji}</span>;
}

// show status with different color style
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
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // keep your tracking view logic (still inside same page)
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const pageSize = 8;

  async function loadStudents() {
    try {
      setLoadingStudents(true);

      const targetSchoolId = "demo-school";

      const snap = await getDocs(collection(db, "students"));

      const all = snap.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        return {
          id: docSnap.id,
          schoolIdRaw: d.schoolId,
          name: d.studentName ?? "",
          parent: d.parentName ?? "",
          email: d.parentEmail ?? "",
          year: d.year ?? null,
          enrollmentId: d.enrollmentId ?? null,

          // TEMP until enrollments connected
          status: "Pending",
          statusTone: "neutral",
        };
      });

      // Filter safely (trim + lowercase)
      const filteredBySchool = all.filter((s) => {
        const sid = String(s.schoolIdRaw ?? "").trim().toLowerCase();
        return sid === String(targetSchoolId).trim().toLowerCase();
      });

      const finalStudents = filteredBySchool.map((s) => ({
        id: s.id,
        name: s.name || "Unknown student",
        parent: s.parent || "Unknown parent",
        email: s.email || "",
        classYear: s.year ? `Year ${s.year}` : "Year ?",
        enrollmentId: s.enrollmentId,
        status: s.status,
        statusTone: s.statusTone,
      }));

      setStudents(finalStudents);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    if (!queryText) return students;

    return students.filter((s) => {
      return (
        (s.name || "").toLowerCase().includes(queryText) ||
        (s.parent || "").toLowerCase().includes(queryText) ||
        (s.classYear || "").toLowerCase().includes(queryText) ||
        (s.status || "").toLowerCase().includes(queryText)
      );
    });
  }, [q, students]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(pageCount, p + 1));
  }

  function onOpenStudent(studentId) {
    setSelectedStudentId(studentId);
  }

  function onBackToList() {
    setSelectedStudentId(null);
  }

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  function onDownloadPdf() {
    console.log("Download Current Step PDF:", selectedStudentId);
  }

  async function onDeleteStudent(studentId, studentName) {
    const ok = window.confirm(`Delete "${studentName}"?\nThis cannot be undone.`);
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "students", studentId));
      // refresh list
      await loadStudents();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed. Check console + Firestore rules.");
    }
  }

  // tracking page
  if (selectedStudent) {
    const completedCount = STEPS.filter((step) => step.statusTone === "ok").length;
    const totalCount = STEPS.length;
    const percentDone = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
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
            {STEPS.map((step) => (
              <div
                key={step.no}
                className={`ckDRow ${step.statusTone === "warn" ? "ckDRowWarn" : ""}`}
              >
                <div className="ckDTd ckDTdNo">
                  <span
                    className={
                      step.statusTone === "ok"
                        ? "ckDDot ckDDotOk"
                        : step.statusTone === "warn"
                        ? "ckDDot ckDDotWarn"
                        : "ckDDot ckDDotUp"
                    }
                  />
                  <span className="ckDNoText">{step.no}.</span>
                </div>

                <div className="ckDTd ckDTdStep">
                  <b>{step.title}</b>
                </div>

                <div className="ckDTd">
                  <StatusPill tone={step.statusTone} text={step.status} />
                </div>

                <div className="ckDTd ckDTdDueLeft">{step.dueLeft}</div>

                <div className="ckDTd ckDTdDueRight">
                  <b>{step.dueRight}</b>
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
    );
  }

  // list page
  return (
    <div className="checklistWrap">
      {/* Add Student Button 
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => navigate("/admin/students/new")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "white",
          }}
        >
          + Add Student
        </button>
      </div>

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
        <div
          className="tableHeader"
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1.5fr 1.5fr 1fr 1fr auto",
            alignItems: "center",
          }}
        >
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
          <div className="th" style={{ textAlign: "right", paddingRight: 12 }}>
            Actions
          </div>
        </div>

        <div className="tableBody">
          {loadingStudents && <div className="emptyState">Loading students...</div>}

          {!loadingStudents &&
  rows.map((row) => (
    <div
      key={row.id}
      role="button"
      tabIndex={0}
      className="tableRow"
      onClick={() => onOpenStudent(row.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenStudent(row.id);
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1.5fr 1.5fr 1fr 1fr auto",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {/* Checkbox *
      <div className="td tdCheck">
        <input type="checkbox" onClick={(e) => e.stopPropagation()} />
      </div>

      {/* Name 
      <div className="td tdName" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AvatarEmoji name={row.name} />
        <span className="studentName">{row.name}</span>
      </div>

      {/* Parent 
      <div className="td">{row.parent}</div>

      {/* Class 
      <div className="td">{row.classYear}</div>

      {/* Status *
      <div className="td tdStatus">
        <StatusPill tone={row.statusTone} text={row.status} />
      </div>

      {/* Actions 
      <div
        className="td"
        style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => navigate(`/admin/students/${row.id}/edit`)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #d0d5dd",
            background: "white",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ✏️ Edit
        </button>

        <button
          type="button"
          onClick={() => onDeleteStudent(row.id, row.name)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #f2b8b5",
            background: "#fff5f5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  ))}

          {!loadingStudents && rows.length === 0 && (
            <div className="emptyState">No students found.</div>
          )}
        </div>

        <div className="tableFooter">
          <div className="pageText">
            Page : <b>{safePage}</b> of <b>{pageCount}</b>
          </div>

          <div className="pageBtns">
            <button type="button" className="pageBtn" onClick={goPrev} disabled={safePage <= 1}>
              ‹
            </button>

            <button type="button" className="pageBtn" onClick={goNext} disabled={safePage >= pageCount}>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}*/


// src/pages/admin/CheklistPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

// mock steps (keep for now)
const STEPS = [
  { no: 1, title: "Awaiting Payment", status: "Completed", statusTone: "ok", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 2, title: "Fill Health Form", status: "Completed", statusTone: "ok", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 3, title: "Pay Tuition & Fees", status: "Pending (2 days left)", statusTone: "warn", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 4, title: "Attend Orientation", status: "Upcoming", statusTone: "neutral", dueLeft: "April 30", dueRight: "April 30" },
  { no: 5, title: "Upload Proof of Payment", status: "Upcoming", statusTone: "neutral", dueLeft: "Upcoming", dueRight: "Upcoming" },
];

function AvatarEmoji({ name, className = "studentAvatar" }) {
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒"];
    const safe = (name || "").trim();
    if (!safe) return "🧒";
    let sum = 0;
    for (let i = 0; i < safe.length; i++) sum += safe.charCodeAt(i);
    return pool[sum % pool.length];
  }, [name]);

  return <span className={className}>{emoji}</span>;
}

function StatusPill({ tone = "neutral", text }) {
  const cls =
    tone === "ok" ? "statusPill ok" : tone === "warn" ? "statusPill warn" : "statusPill neutral";
  return <span className={cls}>{text}</span>;
}

function mapOverallStatusToPill(overallStatus) {
  const s = String(overallStatus || "").trim().toLowerCase();
  if (s === "completed" || s === "done") return { text: "Completed", tone: "ok" };
  if (s === "pending" || s === "overdue" || s === "late") return { text: "Pending", tone: "warn" };
  if (s === "upcoming" || s === "inprogress" || s === "in progress") return { text: "Upcoming", tone: "neutral" };
  return { text: overallStatus ? overallStatus : "Pending", tone: "neutral" };
}

export default function CheklistPage() {
  const navigate = useNavigate();

  const [qText, setQText] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [enrollment, setEnrollment] = useState(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const pageSize = 8;
  const targetSchoolId = "demo-school";

  async function loadStudents() {
    try {
      setLoadingStudents(true);

      const snap = await getDocs(collection(db, "students"));

      const all = snap.docs.map((docSnap) => {
        const d = docSnap.data() || {};
        const yearNumber = typeof d.year === "number" ? d.year : Number(d.year ?? null);

        return {
          id: docSnap.id,
          schoolIdRaw: d.schoolId,
          name: d.studentName ?? "",
          parent: d.parentName ?? "",
          email: d.parentEmail ?? "",
          yearNumber,
          enrollmentId: d.enrollmentId ?? null,
          status: "Pending",
          statusTone: "neutral",
        };
      });

      const filteredBySchool = all.filter((s) => {
        const sid = String(s.schoolIdRaw ?? "").trim().toLowerCase();
        return sid === String(targetSchoolId).trim().toLowerCase();
      });

      setStudents(
        filteredBySchool.map((s) => ({
          id: s.id,
          name: s.name || "Unknown student",
          parent: s.parent || "Unknown parent",
          email: s.email || "",
          classYear: s.yearNumber ? `Year ${s.yearNumber}` : "Year ?",
          yearNumber: s.yearNumber || null,
          schoolId: targetSchoolId,
          enrollmentId: s.enrollmentId,
          status: s.status,
          statusTone: s.statusTone,
        }))
      );
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  // ✅ load enrollment doc using SAME id as student doc
  useEffect(() => {
    if (!selectedStudent) return;

    async function loadEnrollment() {
      try {
        setLoadingEnrollment(true);
        setEnrollment(null);

        const eRef = doc(db, "enrollments", selectedStudent.id);
        const eSnap = await getDoc(eRef);

        if (eSnap.exists()) {
          setEnrollment({ id: eSnap.id, ...eSnap.data() });
        } else {
          setEnrollment(null);
        }
      } catch (err) {
        console.error("Failed to load enrollment:", err);
        setEnrollment(null);
      } finally {
        setLoadingEnrollment(false);
      }
    }

    loadEnrollment();
  }, [selectedStudent]);

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return students;
    return students.filter((s) =>
      (s.name || "").toLowerCase().includes(t) ||
      (s.parent || "").toLowerCase().includes(t) ||
      (s.classYear || "").toLowerCase().includes(t) ||
      (s.status || "").toLowerCase().includes(t)
    );
  }, [qText, students]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(pageCount, p + 1));
  }

  function onOpenStudent(id) {
    setSelectedStudentId(id);
  }
  function onBackToList() {
    setSelectedStudentId(null);
    setEnrollment(null);
  }

  function onDownloadPdf() {
    console.log("Download Current Step PDF:", selectedStudentId);
  }

  async function onDeleteStudent(studentId, studentName) {
    const ok = window.confirm(`Delete "${studentName}"?\nThis cannot be undone.`);
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "students", studentId));
      // optional: also delete matching enrollment doc:
      // await deleteDoc(doc(db, "enrollments", studentId));
      await loadStudents();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed. Check console + Firestore rules.");
    }
  }

  // ✅ one-click: create enrollment for old student
  async function createEnrollmentForStudent() {
    if (!selectedStudent) return;

    try {
      const eRef = doc(db, "enrollments", selectedStudent.id);

      await setDoc(
        eRef,
        {
          schoolId: selectedStudent.schoolId,
          studentName: selectedStudent.name,
          parentName: selectedStudent.parent,
          parentEmail: selectedStudent.email,
          year: selectedStudent.yearNumber ?? null,

          totalSteps: 5,
          completedSteps: 0,
          progressPercent: 0,
          overallStatus: "pending",
          nextDeadline: null,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const eSnap = await getDoc(eRef);
      setEnrollment({ id: eSnap.id, ...eSnap.data() });
    } catch (err) {
      console.error("Create enrollment failed:", err);
      alert("Could not create enrollment. Check Firestore rules.");
    }
  }

  // -------------------------
  // DETAIL VIEW
  // -------------------------
  if (selectedStudent) {
    const completedCount = enrollment?.completedSteps ?? 0;
    const totalCount = enrollment?.totalSteps ?? STEPS.length;

    const percentDone =
      typeof enrollment?.progressPercent === "number"
        ? enrollment.progressPercent
        : (totalCount ? Math.round((completedCount / totalCount) * 100) : 0);

    const nextDeadlineText = enrollment?.nextDeadline ?? "N/A";
    const pill = mapOverallStatusToPill(enrollment?.overallStatus);

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

            <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {loadingEnrollment ? (
                <StatusPill tone="neutral" text="Loading enrollment..." />
              ) : enrollment ? (
                <StatusPill tone={pill.tone} text={pill.text} />
              ) : (
                <>
                  <StatusPill tone="warn" text="Enrollment not found (create it for old students)" />
                  <button
                    type="button"
                    onClick={createEnrollmentForStudent}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    + Create Enrollment
                  </button>
                </>
              )}
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
            {STEPS.map((step) => (
              <div
                key={step.no}
                className={`ckDRow ${step.statusTone === "warn" ? "ckDRowWarn" : ""}`}
              >
                <div className="ckDTd ckDTdNo">
                  <span
                    className={
                      step.statusTone === "ok"
                        ? "ckDDot ckDDotOk"
                        : step.statusTone === "warn"
                        ? "ckDDot ckDDotWarn"
                        : "ckDDot ckDDotUp"
                    }
                  />
                  <span className="ckDNoText">{step.no}.</span>
                </div>

                <div className="ckDTd ckDTdStep">
                  <b>{step.title}</b>
                </div>

                <div className="ckDTd">
                  <StatusPill tone={step.statusTone} text={step.status} />
                </div>

                <div className="ckDTd ckDTdDueLeft">{step.dueLeft}</div>

                <div className="ckDTd ckDTdDueRight">
                  <b>{step.dueRight}</b>
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
    );
  }

  // -------------------------
  // LIST VIEW
  // -------------------------
  return (
    <div className="checklistWrap">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => navigate("/admin/students/new")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: "white",
          }}
        >
          + Add Student
        </button>
      </div>

      <div className="searchCard">
        <Search className="searchIcon" size={20} />
        <input
          className="searchInput"
          value={qText}
          onChange={(e) => {
            setQText(e.target.value);
            setPage(1);
          }}
          placeholder="Search"
        />
      </div>

      <div className="tableCard">
        <div
          className="tableHeader"
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1.5fr 1.5fr 1fr 1fr auto",
            alignItems: "center",
          }}
        >
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
          <div className="th" style={{ textAlign: "right", paddingRight: 12 }}>
            Actions
          </div>
        </div>

        <div className="tableBody">
          {loadingStudents && <div className="emptyState">Loading students...</div>}

          {!loadingStudents &&
            rows.map((row) => (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                className="tableRow"
                onClick={() => onOpenStudent(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpenStudent(row.id);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1.5fr 1.5fr 1fr 1fr auto",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div className="td tdCheck">
                  <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                </div>

                <div className="td tdName" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AvatarEmoji name={row.name} />
                  <span className="studentName">{row.name}</span>
                </div>

                <div className="td">{row.parent}</div>
                <div className="td">{row.classYear}</div>

                <div className="td tdStatus">
                  <StatusPill tone={row.statusTone} text={row.status} />
                </div>

                <div
                  className="td"
                  style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/students/${row.id}/edit`)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #d0d5dd",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteStudent(row.id, row.name)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "1px solid #f2b8b5",
                      background: "#fff5f5",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}

          {!loadingStudents && rows.length === 0 && (
            <div className="emptyState">No students found.</div>
          )}
        </div>

        <div className="tableFooter">
          <div className="pageText">
            Page : <b>{safePage}</b> of <b>{pageCount}</b>
          </div>

          <div className="pageBtns">
            <button type="button" className="pageBtn" onClick={goPrev} disabled={safePage <= 1}>
              ‹
            </button>
            <button type="button" className="pageBtn" onClick={goNext} disabled={safePage >= pageCount}>
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}