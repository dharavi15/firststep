/*// src/pages/admin/AddStudentPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

// ---------- Helpers ----------
function makeEnrollmentIdFromName(fullName) {
  // format: enr_first_last  (only first + last)
  const clean = String(fullName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "enr_student";

  const parts = clean.split(" ").filter(Boolean);
  const first = parts[0] || "student";
  const last = parts.length > 1 ? parts[parts.length - 1] : "student";
  return `enr_${first}_${last}`;
}

const YEARS = Array.from({ length: 12 }, (_, i) => i + 1);

// ---------- Zod validation ----------
const studentSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentEmail: z.string().email("Enter a valid parent email"),
  year: z.coerce.number().int().min(1, "Select a year").max(12, "Select a year"),
  enrollmentId: z
    .string()
    .min(1, "Enrollment ID is required")
    .regex(/^enr_[a-z0-9_]+$/, "Enrollment ID must look like enr_first_last"),
});

export default function AddStudentPage({ mode = "create" }) {
  const navigate = useNavigate();
  const params = useParams();
  const studentId = params.studentId;

  const isEdit = mode === "edit";

  // ✅ In real app: read from users/{uid}.schoolId
  const schoolId = "demo-school";

  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);

  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    parentEmail: "",
    year: "",
    enrollmentId: "",
  });

  // field-level errors
  const [errors, setErrors] = useState({});

  // auto-generate enrollmentId when studentName changes (only if user hasn't manually edited)
  const [enrollmentTouched, setEnrollmentTouched] = useState(false);

  useEffect(() => {
    if (!enrollmentTouched) {
      setForm((prev) => ({
        ...prev,
        enrollmentId: makeEnrollmentIdFromName(prev.studentName),
      }));
    }
  }, [form.studentName, enrollmentTouched]);

  // Load existing doc for edit
  useEffect(() => {
    async function loadExisting() {
      if (!isEdit) return;
      if (!studentId) return;

      try {
        setLoadingExisting(true);
        const ref = doc(db, "students", studentId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Student not found.");
          navigate("/admin/checklist");
          return;
        }

        const d = snap.data() || {};
        setForm({
          studentName: d.studentName || "",
          parentName: d.parentName || "",
          parentEmail: d.parentEmail || "",
          year: d.year ?? "",
          enrollmentId: d.enrollmentId || "",
        });

        // if existing enrollmentId is present, treat as touched
        if (d.enrollmentId) setEnrollmentTouched(true);
      } catch (e) {
        console.error("Failed to load student:", e);
        alert("Failed to load student. Check console.");
      } finally {
        setLoadingExisting(false);
      }
    }

    loadExisting();
  }, [isEdit, studentId, navigate]);

  const title = isEdit ? "Edit Student" : "Add New Student";

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateNow() {
    const parsed = studentSchema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return { ok: true, data: parsed.data };
    }

    const nextErrors = {};
    parsed.error.issues.forEach((issue) => {
      const k = issue.path?.[0];
      if (k) nextErrors[k] = issue.message;
    });
    setErrors(nextErrors);
    return { ok: false, data: null };
  }

  async function onSubmit(e) {
    e.preventDefault();

    const v = validateNow();
    if (!v.ok) return;

    setLoading(true);
    try {
      if (isEdit) {
        const ref = doc(db, "students", studentId);
        await updateDoc(ref, {
          studentName: v.data.studentName.trim(),
          parentName: v.data.parentName.trim(),
          parentEmail: v.data.parentEmail.trim(),
          year: v.data.year,
          enrollmentId: v.data.enrollmentId.trim(),
          schoolId,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "students"), {
          studentName: v.data.studentName.trim(),
          parentName: v.data.parentName.trim(),
          parentEmail: v.data.parentEmail.trim(),
          year: v.data.year,
          enrollmentId: v.data.enrollmentId.trim(),
          schoolId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      navigate("/admin/checklist");
    } catch (err) {
      console.error("Save failed:", err);

      // Show user-friendly error (not firestore rules)
      alert("Save failed. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = useMemo(() => {
    return !loading && !loadingExisting;
  }, [loading, loadingExisting]);

  if (loadingExisting) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Loading student...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>{title}</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Student Name *
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Student Name *
          </label>
          <input
            value={form.studentName}
            onChange={(e) => setField("studentName", e.target.value)}
            placeholder="Ethan Parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.studentName && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.studentName}</div>
          )}
        </div>

        {/* Parent Name *
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Parent Name *
          </label>
          <input
            value={form.parentName}
            onChange={(e) => setField("parentName", e.target.value)}
            placeholder="Daniel Parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.parentName && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.parentName}</div>
          )}
        </div>

        {/* Parent Email *
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Parent Email *
          </label>
          <input
            value={form.parentEmail}
            onChange={(e) => setField("parentEmail", e.target.value)}
            placeholder="daniel@gmail.com"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.parentEmail && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.parentEmail}</div>
          )}
        </div>

        {/* Year *
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Year *
          </label>
          <select
            value={form.year}
            onChange={(e) => setField("year", e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          {errors.year && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.year}</div>
          )}
        </div>

        {/* Enrollment ID *
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Enrollment ID *
          </label>
          <input
            value={form.enrollmentId}
            onChange={(e) => {
              setEnrollmentTouched(true);
              setField("enrollmentId", e.target.value);
            }}
            placeholder="enr_ethan_parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            Auto-generated from student name, but you can edit it.
          </div>
          {errors.enrollmentId && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.enrollmentId}</div>
          )}
        </div>

        {/* Buttons *
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => navigate("/admin/checklist")}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #000",
              background: "#111",
              color: "white",
              cursor: "pointer",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            {loading ? "Saving..." : isEdit ? "Update Student" : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}*/



// src/pages/admin/AddStudentPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

// ---------- Helpers ----------
function makeEnrollmentIdFromName(fullName) {
  // format: enr_first_last  (only first + last)
  const clean = String(fullName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return "enr_student";

  const parts = clean.split(" ").filter(Boolean);
  const first = parts[0] || "student";
  const last = parts.length > 1 ? parts[parts.length - 1] : "student";
  return `enr_${first}_${last}`;
}

const YEARS = Array.from({ length: 12 }, (_, i) => i + 1);

// ---------- Zod validation ----------
const studentSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentEmail: z.string().email("Enter a valid parent email"),
  year: z.coerce.number().int().min(1, "Select a year").max(12, "Select a year"),
  enrollmentId: z
    .string()
    .min(1, "Enrollment ID is required")
    .regex(/^enr_[a-z0-9_]+$/, "Enrollment ID must look like enr_first_last"),
});

export default function AddStudentPage({ mode = "create" }) {
  const navigate = useNavigate();
  const params = useParams();
  const studentId = params.studentId;

  const isEdit = mode === "edit";

  // ✅ In real app: read from users/{uid}.schoolId
  const schoolId = "demo-school";

  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);

  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    parentEmail: "",
    year: "",
    enrollmentId: "",
  });

  const [errors, setErrors] = useState({});
  const [enrollmentTouched, setEnrollmentTouched] = useState(false);

  useEffect(() => {
    if (!enrollmentTouched) {
      setForm((prev) => ({
        ...prev,
        enrollmentId: makeEnrollmentIdFromName(prev.studentName),
      }));
    }
  }, [form.studentName, enrollmentTouched]);

  // Load existing doc for edit
  useEffect(() => {
    async function loadExisting() {
      if (!isEdit) return;
      if (!studentId) return;

      try {
        setLoadingExisting(true);
        const ref = doc(db, "students", studentId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Student not found.");
          navigate("/admin/checklist");
          return;
        }

        const d = snap.data() || {};
        setForm({
          studentName: d.studentName || "",
          parentName: d.parentName || "",
          parentEmail: d.parentEmail || "",
          year: d.year ?? "",
          enrollmentId: d.enrollmentId || "",
        });

        if (d.enrollmentId) setEnrollmentTouched(true);
      } catch (e) {
        console.error("Failed to load student:", e);
        alert("Failed to load student. Check console.");
      } finally {
        setLoadingExisting(false);
      }
    }

    loadExisting();
  }, [isEdit, studentId, navigate]);

  const title = isEdit ? "Edit Student" : "Add New Student";

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateNow() {
    const parsed = studentSchema.safeParse(form);
    if (parsed.success) {
      setErrors({});
      return { ok: true, data: parsed.data };
    }

    const nextErrors = {};
    parsed.error.issues.forEach((issue) => {
      const k = issue.path?.[0];
      if (k) nextErrors[k] = issue.message;
    });
    setErrors(nextErrors);
    return { ok: false, data: null };
  }

  async function onSubmit(e) {
    e.preventDefault();

    const v = validateNow();
    if (!v.ok) return;

    setLoading(true);

    const studentPayload = {
      studentName: v.data.studentName.trim(),
      parentName: v.data.parentName.trim(),
      parentEmail: v.data.parentEmail.trim(),
      year: v.data.year,
      enrollmentId: v.data.enrollmentId.trim(),
      schoolId,
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEdit) {
        // 1) update student
        const sRef = doc(db, "students", studentId);
        await updateDoc(sRef, {
          ...studentPayload,
        });

        // 2) ensure enrollment exists using SAME ID as studentId
        const eRef = doc(db, "enrollments", studentId);

        await setDoc(
          eRef,
          {
            // keep enrollment progress if already exists
            schoolId,
            studentName: studentPayload.studentName,
            parentName: studentPayload.parentName,
            parentEmail: studentPayload.parentEmail,
            year: studentPayload.year,

            // defaults if not present
            totalSteps: 5,
            completedSteps: 0,
            progressPercent: 0,
            overallStatus: "pending",
            nextDeadline: null,

            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // 1) create student first
        const sDocRef = await addDoc(collection(db, "students"), {
          ...studentPayload,
          createdAt: serverTimestamp(),
        });

        // 2) create enrollment doc with SAME ID as student doc id
        const eRef = doc(db, "enrollments", sDocRef.id);
        await setDoc(eRef, {
          schoolId,
          studentName: studentPayload.studentName,
          parentName: studentPayload.parentName,
          parentEmail: studentPayload.parentEmail,
          year: studentPayload.year,

          totalSteps: 5,
          completedSteps: 0,
          progressPercent: 0,
          overallStatus: "pending",
          nextDeadline: null,

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      navigate("/admin/checklist");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed. Please check your inputs and Firestore rules.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = useMemo(() => !loading && !loadingExisting, [loading, loadingExisting]);

  if (loadingExisting) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Loading student...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>{title}</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Student Name */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Student Name *
          </label>
          <input
            value={form.studentName}
            onChange={(e) => setField("studentName", e.target.value)}
            placeholder="Ethan Parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.studentName && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.studentName}</div>
          )}
        </div>

        {/* Parent Name */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Parent Name *
          </label>
          <input
            value={form.parentName}
            onChange={(e) => setField("parentName", e.target.value)}
            placeholder="Daniel Parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.parentName && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.parentName}</div>
          )}
        </div>

        {/* Parent Email */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Parent Email *
          </label>
          <input
            value={form.parentEmail}
            onChange={(e) => setField("parentEmail", e.target.value)}
            placeholder="daniel@gmail.com"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          {errors.parentEmail && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.parentEmail}</div>
          )}
        </div>

        {/* Year */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Year *
          </label>
          <select
            value={form.year}
            onChange={(e) => setField("year", e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
          {errors.year && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.year}</div>
          )}
        </div>

        {/* Enrollment ID */}
        <div style={{ background: "white", borderRadius: 14, padding: 16, border: "1px solid #eee" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Enrollment ID *
          </label>
          <input
            value={form.enrollmentId}
            onChange={(e) => {
              setEnrollmentTouched(true);
              setField("enrollmentId", e.target.value);
            }}
            placeholder="enr_ethan_parker"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
            Auto-generated from student name, but you can edit it.
          </div>
          {errors.enrollmentId && (
            <div style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>{errors.enrollmentId}</div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
          <button
            type="button"
            onClick={() => navigate("/admin/checklist")}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid #000",
              background: "#111",
              color: "white",
              cursor: "pointer",
              opacity: canSubmit ? 1 : 0.6,
            }}
          >
            {loading ? "Saving..." : isEdit ? "Update Student" : "Save Student"}
          </button>
        </div>
      </form>
    </div>
  );
}