// src/pages/admin/Documents.jsx

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { db, storage } from "../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import useAuthStore from "../../store/useAuthStore";

/**
 * Step -> Document mapping
 * We use this to show "what document is needed" by current step.
 */
const STEP_DOCS = {
  1: [], // Awaiting Payment (no document required in this demo)
  2: ["healthForm"], // Fill Health Form
  3: ["tuitionPayment"], // Pay Tuition & Fees (receipt / payment info)
  4: [], // Attend Orientation (no document required in this demo)
  5: ["proofOfPayment"], // Upload Proof of Payment
};

/**
 * Document display config
 * key = field name inside enrollment.documents
 */
const DOC_CONFIG = {
  healthForm: {
    title: "Health Form",
    stepNo: 2,
    desc: "Upload the completed health form file.",
  },
  tuitionPayment: {
    title: "Tuition & Fees Receipt",
    stepNo: 3,
    desc: "Upload payment receipt or proof of payment info.",
  },
  proofOfPayment: {
    title: "Proof of Payment",
    stepNo: 5,
    desc: "Upload proof of payment file (image or PDF).",
  },
};

/**
 * Make initials for avatar circle
 */
function getInitials(name) {
  const s = String(name || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

/**
 * Safe file name for Storage path
 * Keep letters, numbers, "_" plus dot and dash
 */
function makeSafeFileName(originalName) {
  // Clean file name
  // Keep only letters, numbers, dot and dash
  // Replace other characters with "_"
  return String(originalName || "file").replace(/[^\w.-]+/g, "_");
}

/**
 * Build current step from completedSteps and totalSteps
 */
function calcCurrentStep(completedSteps, totalSteps) {
  const completed = Number.isFinite(completedSteps) ? completedSteps : 0;
  const total = Number.isFinite(totalSteps) ? totalSteps : 5;
  return Math.min(completed + 1, total);
}

/**
 * Ensure enrollment doc exists for a student
 * We use doc id = studentId (same as your ChecklistPage)
 */
async function ensureEnrollmentDoc(student) {
  const enrRef = doc(db, "enrollments", student.id);
  const snap = await getDoc(enrRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  // Create new enrollment doc if missing
  const base = {
    schoolId: student.schoolId || "demo-school",
    studentId: student.id,
    studentName: student.studentName || "",
    parentName: student.parentName || "",
    parentEmail: student.parentEmail || "",
    year: student.year ?? null,

    totalSteps: 5,
    completedSteps: 0,
    progressPercent: 0,
    overallStatus: "pending",
    nextDeadline: "N/A",

    // Document state is stored here
    documents: {},

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(enrRef, base);
  return { id: student.id, ...base };
}

/**
 * Decide which documents should be visible for the current step
 * - Show required docs for current step
 * - Also show any doc that was already uploaded before (so admin can review)
 */
function buildVisibleDocKeys(enrollment) {
  const docs = enrollment?.documents || {};
  const completedSteps = Number(enrollment?.completedSteps ?? 0);
  const totalSteps = Number(enrollment?.totalSteps ?? 5);
  const currentStep = calcCurrentStep(completedSteps, totalSteps);

  const required = new Set(STEP_DOCS[currentStep] || []);
  const uploaded = new Set(
    Object.keys(docs).filter((k) => docs?.[k]?.received === true)
  );

  return Array.from(new Set([...required, ...uploaded]));
}

export default function Documents() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Admin only page (simple guard)
  const isAdmin =
    user?.role === "admin" ||
    user?.userRole === "admin" ||
    user?.type === "admin" ||
    user?.email === "admin@test.com";

  const schoolId = user?.schoolId || "demo-school";

  const [qText, setQText] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  /**
   * Load all students (admin)
   * Note: This matches your current approach in ChecklistPage (get all then filter)
   */
  async function loadStudents() {
    try {
      setLoadingStudents(true);
      setMsg("");

      const snap = await getDocs(collection(db, "students"));

      const all = snap.docs.map((d) => {
        const data = d.data() || {};
        return {
          id: d.id,
          schoolId: data.schoolId ?? "",
          studentName: data.studentName ?? "",
          parentName: data.parentName ?? "",
          parentEmail: data.parentEmail ?? "",
          year: data.year ?? null,
        };
      });

      const filtered = all.filter((s) => {
        const sid = String(s.schoolId || "").trim().toLowerCase();
        return sid === String(schoolId).trim().toLowerCase();
      });

      setStudents(filtered);
    } catch (err) {
      console.error("Load students failed:", err);
      setStudents([]);
      setMsg("Load students failed ❌");
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, schoolId]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  /**
   * Load enrollment when student selected
   * We also create enrollment doc if it doesn't exist.
   */
  useEffect(() => {
    if (!selectedStudent) return;

    async function loadEnrollment() {
      try {
        setLoadingEnrollment(true);
        setMsg("");
        setEnrollment(null);

        const enr = await ensureEnrollmentDoc({
          ...selectedStudent,
          schoolId: selectedStudent.schoolId || schoolId,
        });

        setEnrollment(enr);
      } catch (err) {
        console.error("Load enrollment failed:", err);
        setEnrollment(null);
        setMsg("Load enrollment failed ❌");
      } finally {
        setLoadingEnrollment(false);
      }
    }

    loadEnrollment();
  }, [selectedStudent, schoolId]);

  /**
   * Filter students list by search
   */
  const filtered = useMemo(() => {
    const t = String(qText || "").trim().toLowerCase();
    if (!t) return students;

    return students.filter((s) => {
      const name = String(s.studentName || "").toLowerCase();
      const parent = String(s.parentName || "").toLowerCase();
      const email = String(s.parentEmail || "").toLowerCase();
      const year = String(s.year ?? "").toLowerCase();
      return (
        name.includes(t) ||
        parent.includes(t) ||
        email.includes(t) ||
        year.includes(t)
      );
    });
  }, [qText, students]);

  /**
   * Back to list
   */
  function onBackToList() {
    setSelectedStudentId(null);
    setEnrollment(null);
    setMsg("");
  }

  /**
   * Refresh enrollment data (after upload)
   */
  async function reloadEnrollment() {
    if (!selectedStudentId) return;
    try {
      setLoadingEnrollment(true);
      const enrRef = doc(db, "enrollments", selectedStudentId);
      const snap = await getDoc(enrRef);
      if (snap.exists()) setEnrollment({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error("Reload enrollment failed:", err);
    } finally {
      setLoadingEnrollment(false);
    }
  }

  /**
   * Upload document file to Storage and update Firestore
   */
  async function onUploadDoc(docKey, file) {
    if (!file || !selectedStudentId) return;

    const cfg = DOC_CONFIG[docKey];
    if (!cfg) return;

    try {
      setUploading(true);
      setMsg("");

      const safeName = makeSafeFileName(file.name);

      // Storage path includes step number
      // This makes "Documents" connected to real step.
      const path = `enrollments/${selectedStudentId}/step${cfg.stepNo}/${Date.now()}_${safeName}`;
      const r = ref(storage, path);

      await uploadBytes(r, file);
      const url = await getDownloadURL(r);

      // Update enrollment document
      const enrRef = doc(db, "enrollments", selectedStudentId);

      const nextDocs = {
        ...(enrollment?.documents || {}),
        [docKey]: {
          received: true,
          fileName: file.name,
          url,
          storagePath: path,
          stepNo: cfg.stepNo,
          updatedAt: Date.now(),
        },
      };

      await updateDoc(enrRef, {
        documents: nextDocs,
        updatedAt: serverTimestamp(),
      });

      setMsg("Saved ✅");
      await reloadEnrollment();
    } catch (err) {
      console.error("Upload failed:", err);
      setMsg("Save failed ❌");
    } finally {
      setUploading(false);
    }
  }

  /**
   * Remove only the Firestore doc state (does not delete file in Storage)
   * This is safer for demo. You can add deleteObject later if you want.
   */
  async function onClearDoc(docKey) {
    if (!selectedStudentId) return;

    const ok = window.confirm("Clear this document status?\n(File in Storage will stay.)");
    if (!ok) return;

    try {
      setMsg("");
      const enrRef = doc(db, "enrollments", selectedStudentId);

      const nextDocs = { ...(enrollment?.documents || {}) };
      delete nextDocs[docKey];

      await updateDoc(enrRef, {
        documents: nextDocs,
        updatedAt: serverTimestamp(),
      });

      setMsg("Cleared ✅");
      await reloadEnrollment();
    } catch (err) {
      console.error("Clear doc failed:", err);
      setMsg("Clear failed ❌");
    }
  }

  /**
   * Print (for PDF)
   */
  function onPrint() {
    window.print();
  }

  // --------- Guards ----------
  if (!isAdmin) {
    return (
      <div className="docsWrap">
        <div className="emptyState">Admin only</div>
      </div>
    );
  }

  // --------- DETAIL VIEW ----------
  if (selectedStudent) {
    const completedSteps = Number(enrollment?.completedSteps ?? 0);
    const totalSteps = Number(enrollment?.totalSteps ?? 5);
    const currentStep = calcCurrentStep(completedSteps, totalSteps);

    const percentDone =
      typeof enrollment?.progressPercent === "number"
        ? enrollment.progressPercent
        : totalSteps
        ? Math.round((completedSteps / totalSteps) * 100)
        : 0;

    const visibleDocKeys = buildVisibleDocKeys(enrollment);

    return (
      <div className="docsWrap docsPrintRoot">
        <div className="docsTop">
          <button type="button" className="viewBackBtn docsNoPrint" onClick={onBackToList}>
            ← Back
          </button>

          <button type="button" className="btnOutlinePrimary docsNoPrint" onClick={onPrint}>
            Print / Save PDF
          </button>
        </div>

        <div className="docPaper">
          <div className="docHeader">
            <div className="docTitle">Documents for {selectedStudent.studentName || "Student"}</div>
            <div className="docMeta">
              Parent: {selectedStudent.parentName || "-"} • Email: {selectedStudent.parentEmail || "-"}
            </div>
            <div className="docMeta">
              Progress: {percentDone}% • Current Step: <b>Step {currentStep}</b>
            </div>
          </div>

          {msg ? <div className="docBox docsNoPrint"><b>{msg}</b></div> : null}

          {loadingEnrollment ? (
            <div className="emptyState">Loading enrollment...</div>
          ) : !enrollment ? (
            <div className="emptyState">Enrollment not found</div>
          ) : (
            <>
              <div className="docBox">
                <div className="docSectionTitle">What is needed now</div>
                <div className="docText">
                  We show documents based on <b>Current Step</b>.  
                  If a document was uploaded before, we still show it here.
                </div>
              </div>

              {visibleDocKeys.length === 0 ? (
                <div className="docBox">
                  <div className="docSectionTitle">No document required for this step</div>
                  <div className="docText">Current step does not require upload.</div>
                </div>
              ) : (
                <div className="docsList">
                  {visibleDocKeys.map((key) => {
                    const cfg = DOC_CONFIG[key];
                    if (!cfg) return null;

                    const docState = enrollment?.documents?.[key] || null;
                    const received = docState?.received === true;
                    const showUpload = cfg.stepNo === currentStep;

                    return (
                      <div key={key} className="docBtn" role="group" aria-label={cfg.title}>
                        <div className="docBtnLeft">
                          <div className="docBtnStep">Step {cfg.stepNo}</div>
                          <div className="docBtnTitle">{cfg.title}</div>
                          <div className="docBtnMeta">
                            {cfg.desc}
                          </div>

                          {received ? (
                            <div className="docBtnMeta">
                              Status: <b>Received</b> • File: {docState?.fileName || "-"}
                            </div>
                          ) : (
                            <div className="docBtnMeta">
                              Status: <b>Not received</b>
                            </div>
                          )}

                          {received && docState?.url ? (
                            <div className="docBtnMeta">
                              Link:{" "}
                              <a href={docState.url} target="_blank" rel="noreferrer">
                                Open file
                              </a>
                            </div>
                          ) : null}
                        </div>

                        <div className="docBtnRight docsNoPrint">
                          {/* Upload is enabled only on the real current step */}
                          {showUpload ? (
                            <>
                              <label className="btnOutlinePrimary btnSm" style={{ cursor: "pointer" }}>
                                📎 Upload
                                <input
                                  type="file"
                                  style={{ display: "none" }}
                                  disabled={uploading}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onUploadDoc(key, f);
                                    e.target.value = "";
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                className="btnDangerSoft btnSm"
                                disabled={uploading}
                                onClick={() => onClearDoc(key)}
                              >
                                ✖ Clear
                              </button>
                            </>
                          ) : (
                            <div className="docBtnMeta">
                              Upload enabled at <b>Step {cfg.stepNo}</b>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // --------- LIST VIEW ----------
  return (
    <div className="docsWrap">
      <div className="docsTop">
        <div />
        <button type="button" className="btnOutlinePrimary" onClick={() => navigate("/admin/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <div className="searchCard">
        <Search className="searchIcon" size={20} />
        <input
          className="searchInput"
          value={qText}
          onChange={(e) => setQText(e.target.value)}
          placeholder="Search"
        />
      </div>

      {loadingStudents ? (
        <div className="emptyState">Loading students...</div>
      ) : filtered.length === 0 ? (
        <div className="emptyState">No students found</div>
      ) : (
        <div className="docsList">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              className="docBtn"
              onClick={() => setSelectedStudentId(s.id)}
            >
              <div className="docBtnLeft">
                <div className="docBtnTitle">
                  {getInitials(s.studentName)} • {s.studentName || "Unknown student"}
                </div>
                <div className="docBtnMeta">
                  Parent: {s.parentName || "-"} • Year: {s.year ?? "-"}
                </div>
              </div>
              <div className="docBtnRight">Open</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}