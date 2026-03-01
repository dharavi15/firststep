import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";

// Step template
const STEP_TEMPLATE = [
  { no: 1, title: "Awaiting Payment", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 2, title: "Fill Health Form", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 3, title: "Pay Tuition & Fees", dueLeft: "Due 25 Feb", dueRight: "25 Feb" },
  { no: 4, title: "Attend Orientation", dueLeft: "April 30", dueRight: "April 30" },
  { no: 5, title: "Upload Proof of Payment", dueLeft: "Upcoming", dueRight: "Upcoming" },
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

// Pill UI
function StatusPill({ tone = "neutral", text }) {
  const cls =
    tone === "ok"
      ? "statusPill ok"
      : tone === "warn"
      ? "statusPill warn"
      : "statusPill neutral";
  return <span className={cls}>{text}</span>;
}

// Map overallStatus to UI pill
function mapOverallStatusToPill(overallStatus) {
  const s = String(overallStatus || "").trim().toLowerCase();
  if (s === "completed" || s === "done") return { text: "Completed", tone: "ok" };
  if (s === "pending" || s === "overdue" || s === "late")
    return { text: "Pending", tone: "warn" };
  if (s === "upcoming" || s === "inprogress" || s === "in progress")
    return { text: "Upcoming", tone: "neutral" };
  return { text: overallStatus ? overallStatus : "Pending", tone: "neutral" };
}

// Build step rows from progress (completedSteps)
function buildStepsFromProgress(completedSteps, totalSteps) {
  const completed = Number.isFinite(completedSteps) ? completedSteps : 0;
  const total = Number.isFinite(totalSteps) ? totalSteps : STEP_TEMPLATE.length;

  const currentStep = Math.min(completed + 1, total);

  return STEP_TEMPLATE.slice(0, total).map((t) => {
    if (t.no <= completed) return { ...t, status: "Completed", statusTone: "ok" };
    if (t.no === currentStep) return { ...t, status: "Pending", statusTone: "warn" };
    return { ...t, status: "Upcoming", statusTone: "neutral" };
  });
}

// Calculate progress percent safely
function calcPercent(completed, total) {
  const c = Number.isFinite(completed) ? completed : 0;
  const t = Number.isFinite(total) ? total : STEP_TEMPLATE.length;
  if (!t) return 0;
  return Math.max(0, Math.min(100, Math.round((c / t) * 100)));
}

// Decide next deadline text from "current step"
function getNextDeadlineText(completedSteps, totalSteps) {
  const completed = Number.isFinite(completedSteps) ? completedSteps : 0;
  const total = Number.isFinite(totalSteps) ? totalSteps : STEP_TEMPLATE.length;
  const current = Math.min(completed + 1, total);
  const step = STEP_TEMPLATE.find((x) => x.no === current);
  return step?.dueRight || "N/A";
}

export default function ChecklistPage() {
  const navigate = useNavigate();

  // Search + pagination (list view)
  const [qText, setQText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Students list
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Selected student (detail view)
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Keep a snapshot to avoid re-render loops
  const [selectedStudentSnapshot, setSelectedStudentSnapshot] = useState(null);

  // Enrollment data (detail view)
  const [enrollment, setEnrollment] = useState(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  // Printable root (detail view only)
  const printAreaRef = useRef(null);

  // demo schoolId
  const targetSchoolId = "demo-school";

  // Load all students for this school
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
          schoolId: targetSchoolId,
        }))
      );
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  // Load students once
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter list by search
  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return students;

    return students.filter((s) => {
      return (
        (s.name || "").toLowerCase().includes(t) ||
        (s.parent || "").toLowerCase().includes(t) ||
        (s.classYear || "").toLowerCase().includes(t) ||
        (s.email || "").toLowerCase().includes(t)
      );
    });
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

  // Open student detail view
  function onOpenStudent(studentRow) {
    setSelectedStudentId(studentRow.id);
    setSelectedStudentSnapshot(studentRow);
    setEnrollment(null);
  }

  // Back to list
  function onBackToList() {
    setSelectedStudentId(null);
    setSelectedStudentSnapshot(null);
    setEnrollment(null);
  }

  /**
   * Copy styles to iframe so PDF looks like your UI.
   * Then add a strong print override to prevent "blank page".
   */
  const copyAllStylesTo = (targetDoc) => {
    const nodes = document.querySelectorAll('style, link[rel="stylesheet"]');
    nodes.forEach((node) => {
      targetDoc.head.appendChild(node.cloneNode(true));
    });

    // Strong print override (fix blank PDF)
    const override = targetDoc.createElement("style");
    override.innerHTML = `
      @page { margin: 12mm; }
      @media print {
        html, body { background: #fff !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body * { visibility: visible !important; }
        body, body * { color: #111 !important; }
      }
    `;
    targetDoc.head.appendChild(override);
  };

  /**
   * Print / Save as PDF for CURRENT student checklist detail.
   * We print from a hidden iframe to avoid main page print CSS issues.
   */
  function onDownloadPdf() {
    if (!printAreaRef.current) return;

    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const iwin = iframe.contentWindow;
    const idoc = iframe.contentDocument || iwin.document;

    // Build iframe page
    idoc.open();
    idoc.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>FirstStep - Checklist</title>
        </head>
        <body></body>
      </html>
    `);
    idoc.close();

    // Copy styles + print override
    copyAllStylesTo(idoc);

    // Copy ONLY the printable detail area into iframe
    const wrapper = idoc.createElement("div");
    wrapper.innerHTML = printAreaRef.current.outerHTML;
    idoc.body.appendChild(wrapper);

    // Wait and print
    setTimeout(() => {
      try {
        iwin.focus();
        iwin.print();
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 400);
      }
    }, 250);
  }

  // Delete student
  async function onDeleteStudent(studentId, studentName) {
    const ok = window.confirm(`Delete "${studentName}"?\nThis cannot be undone.`);
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "students", studentId));
      await loadStudents();
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Delete failed. Check console + Firestore rules.");
    }
  }

  // Ensure enrollment doc exists (doc id = studentId)
  async function ensureEnrollmentDoc(studentRow) {
    const enrRef = doc(db, "enrollments", studentRow.id);
    const snap = await getDoc(enrRef);

    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }

    // Create default enrollment doc
    const seed = {
      schoolId: studentRow.schoolId,
      studentId: studentRow.id,
      studentName: studentRow.name,
      parentName: studentRow.parent,
      parentEmail: studentRow.email,
      totalSteps: STEP_TEMPLATE.length,
      completedSteps: 0,
      progressPercent: 0,
      overallStatus: "pending",
      nextDeadline: getNextDeadlineText(0, STEP_TEMPLATE.length),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(enrRef, seed);
    return { id: studentRow.id, ...seed };
  }

  // Load enrollment when selected student changes
  useEffect(() => {
    let alive = true;

    async function loadEnrollment() {
      if (!selectedStudentId || !selectedStudentSnapshot) return;

      try {
        setLoadingEnrollment(true);
        setEnrollment(null);

        const data = await ensureEnrollmentDoc(selectedStudentSnapshot);
        if (!alive) return;

        setEnrollment(data);
      } catch (err) {
        console.error("Failed to load enrollment:", err);
        if (!alive) return;
        setEnrollment(null);
      } finally {
        if (alive) setLoadingEnrollment(false);
      }
    }

    loadEnrollment();

    return () => {
      alive = false;
    };
  }, [selectedStudentId, selectedStudentSnapshot]);

  // Update enrollment progress in Firestore
  async function updateEnrollmentProgress(nextCompletedSteps) {
    if (!selectedStudentId) return;

    const total = Number(enrollment?.totalSteps ?? STEP_TEMPLATE.length);
    const completed = Math.max(0, Math.min(total, Number(nextCompletedSteps || 0)));
    const nextPercent = calcPercent(completed, total);

    // Simple status logic
    const nextStatus = completed >= total ? "completed" : "pending";

    // Next deadline text (UI friendly)
    const nextDeadline = completed >= total ? "Done" : getNextDeadlineText(completed, total);

    const enrRef = doc(db, "enrollments", selectedStudentId);

    // Update Firestore
    await updateDoc(enrRef, {
      completedSteps: completed,
      progressPercent: nextPercent,
      overallStatus: nextStatus,
      nextDeadline,
      updatedAt: serverTimestamp(),
    });

    // Update local state (fast UI)
    setEnrollment((prev) => ({
      ...(prev || {}),
      id: selectedStudentId,
      completedSteps: completed,
      progressPercent: nextPercent,
      overallStatus: nextStatus,
      nextDeadline,
    }));
  }

  // Mark current step as done
  async function onMarkStepDone() {
    const completed = Number(enrollment?.completedSteps ?? 0);
    const total = Number(enrollment?.totalSteps ?? STEP_TEMPLATE.length);
    if (completed >= total) return;

    try {
      await updateEnrollmentProgress(completed + 1);
    } catch (e) {
      console.error("Mark step done failed:", e);
      alert("Update failed. Check console + Firestore rules.");
    }
  }

  // Undo last step
  async function onUndoStep() {
    const completed = Number(enrollment?.completedSteps ?? 0);
    if (completed <= 0) return;

    try {
      await updateEnrollmentProgress(completed - 1);
    } catch (e) {
      console.error("Undo failed:", e);
      alert("Update failed. Check console + Firestore rules.");
    }
  }

  // DETAIL VIEW
  if (selectedStudentId && selectedStudentSnapshot) {
    const totalCount = Number(enrollment?.totalSteps ?? STEP_TEMPLATE.length);
    const completedCount = Number(enrollment?.completedSteps ?? 0);

    const percentDone =
      typeof enrollment?.progressPercent === "number"
        ? enrollment.progressPercent
        : calcPercent(completedCount, totalCount);

    const currentStepNo = Math.min(completedCount + 1, totalCount);
    const nextDeadlineText =
      enrollment?.nextDeadline ?? getNextDeadlineText(completedCount, totalCount);
    const pill = mapOverallStatusToPill(enrollment?.overallStatus);

    // Dynamic step rows
    const steps = buildStepsFromProgress(completedCount, totalCount);

    return (
      // IMPORTANT: we print ONLY this root (ref)
      <div className="ckDWrap ckPrintRoot" ref={printAreaRef}>
        <div className="ckDHeader">
          <AvatarEmoji name={selectedStudentSnapshot.name} className="ckDAvatar" />

          <div className="ckDHeaderText">
            <div className="ckDTitleSmall">Onboarding Checklist for</div>

            <div className="ckDNameRow">
              <div className="ckDName">{selectedStudentSnapshot.name}</div>
              <div className="ckDYear">({selectedStudentSnapshot.classYear})</div>
            </div>

            <div className="ckDMeta">
              <div className="ckDParent">{selectedStudentSnapshot.parent}</div>
              <div className="ckDEmail">{selectedStudentSnapshot.email}</div>
            </div>

            <div className="ckDHeaderStatusRow">
              {loadingEnrollment ? (
                <StatusPill tone="neutral" text="Loading enrollment..." />
              ) : enrollment ? (
                <StatusPill tone={pill.tone} text={pill.text} />
              ) : (
                <StatusPill tone="warn" text="Enrollment not found" />
              )}
            </div>
          </div>

          <button type="button" className="ckDBackBtn ckNoPrint" onClick={onBackToList}>
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

          {/* Action buttons (admin) */}
          <div className="ckDActions ckNoPrint">
            <div className="ckDCurrentStepText">
              <span className="ckDMuted">Current Step:</span> <b>Step {currentStepNo}</b>
            </div>

            <div className="ckDBtnRow">
              <button
                type="button"
                className="btnOutlinePrimary btnSm"
                onClick={onUndoStep}
                disabled={loadingEnrollment || !enrollment || completedCount <= 0}
                title="Undo last completed step"
              >
                ↩ Undo
              </button>

              <button
                type="button"
                className="btnPrimary btnSm"
                onClick={onMarkStepDone}
                disabled={loadingEnrollment || !enrollment || completedCount >= totalCount}
                title="Mark current step as done"
              >
                ✅ Mark Step Done
              </button>

              <button
                type="button"
                className="ckDDownloadBtn"
                onClick={onDownloadPdf}
                title="Print / Save as PDF"
              >
                Download Current Step PDF
              </button>
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
            {steps.map((step) => (
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

          <div className="ckDBottomBar ckNoPrint">
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
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="checklistWrap">
      <div className="checklistTopBar">
        <button
          type="button"
          className="btnOutlinePrimary"
          onClick={() => navigate("/admin/students/new")}
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
        <div className="tableHeader checklistHeaderGrid">
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
          <div className="th thActions">Actions</div>
        </div>

        <div className="tableBody">
          {loadingStudents && <div className="emptyState">Loading students...</div>}

          {!loadingStudents &&
            rows.map((row) => (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                className="tableRow checklistRowGrid"
                onClick={() => onOpenStudent(row)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onOpenStudent(row);
                }}
              >
               <div className="td tdCheck">
              
                </div> 

                <div className="td tdName checklistNameCell">
                  <AvatarEmoji name={row.name} />
                  <span className="studentName">{row.name}</span>
                </div>

                <div className="td">{row.parent}</div>
                <div className="td">{row.classYear}</div>

                <div className="td tdStatus">
                  <StatusPill tone="neutral" text="Pending" />
                </div>

                <div className="td checklistActionsCell" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btnOutlinePrimary btnSm"
                    onClick={() => navigate(`/admin/students/${row.id}/edit`)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    className="btnDangerSoft btnSm"
                    onClick={() => onDeleteStudent(row.id, row.name)}
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