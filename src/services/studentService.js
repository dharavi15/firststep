import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Convert Firestore doc -> UI shape
function mapStudentDoc(docSnap) {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    schoolId: data.schoolId || "",
    enrollmentId: data.enrollmentId || "",
    parentName: data.parentName || "",
    parentEmail: data.parentEmail || "",

    // UI fields
    studentName: data.studentName || data.name || "",
    year: typeof data.year === "number" ? data.year : null,
    overallStatus: data.overallStatus || data.status || "pending",
  };
}

// Admin: get all students in school
export async function getStudentsForAdmin({ schoolId } = {}) {
  if (!schoolId) return [];

  const colRef = collection(db, "students");
  const q = query(colRef, where("schoolId", "==", schoolId));

  const snap = await getDocs(q);
  return snap.docs.map(mapStudentDoc);
}

// Parent: get only students that match parentEmail
export async function getStudentsForParent({ schoolId, parentEmail } = {}) {
  if (!schoolId || !parentEmail) return [];

  const colRef = collection(db, "students");
  const q = query(
    colRef,
    where("schoolId", "==", schoolId),
    where("parentEmail", "==", parentEmail)
  );

  const snap = await getDocs(q);
  return snap.docs.map(mapStudentDoc);
}

// Backward compatible
export async function getStudents({ schoolId } = {}) {
  return getStudentsForAdmin({ schoolId });
}

// Admin: add student
export async function addStudentForAdmin({
  schoolId,
  studentName,
  year,
  parentName,
  parentEmail,
  overallStatus,
} = {}) {
  if (!schoolId) throw new Error("Missing schoolId");

  const name = String(studentName || "").trim();
  const pName = String(parentName || "").trim();
  const pEmail = String(parentEmail || "").trim();
  const status = String(overallStatus || "pending").trim();
  const yearNum = Number(year);

  if (!name) throw new Error("Student name is required");
  if (!Number.isFinite(yearNum) || yearNum <= 0) throw new Error("Year must be a number");
  if (!pName) throw new Error("Parent name is required");
  if (!pEmail) throw new Error("Parent email is required");

  const safeSlug = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const enrollmentId = `enr_${safeSlug || "student"}_${Date.now()}`;

  const colRef = collection(db, "students");

  const payload = {
    createdAt: serverTimestamp(),
    enrollmentId,
    schoolId,
    studentName: name,
    year: yearNum,
    parentName: pName,
    parentEmail: pEmail,
    overallStatus: status || "pending",
  };

  const ref = await addDoc(colRef, payload);
  return { id: ref.id, ...payload };
}

// Admin: update student
export async function updateStudentForAdmin(studentId, updates = {}) {
  if (!studentId) throw new Error("Missing studentId");

  const patch = {};

  if ("studentName" in updates) patch.studentName = String(updates.studentName || "").trim();
  if ("parentName" in updates) patch.parentName = String(updates.parentName || "").trim();
  if ("parentEmail" in updates) patch.parentEmail = String(updates.parentEmail || "").trim();
  if ("overallStatus" in updates) patch.overallStatus = String(updates.overallStatus || "pending").trim();

  if ("year" in updates) {
    const yearNum = Number(updates.year);
    if (!Number.isFinite(yearNum) || yearNum <= 0) throw new Error("Year must be a number");
    patch.year = yearNum;
  }

  // Small safety checks
  if ("studentName" in patch && !patch.studentName) throw new Error("Student name is required");
  if ("parentName" in patch && !patch.parentName) throw new Error("Parent name is required");
  if ("parentEmail" in patch && !patch.parentEmail) throw new Error("Parent email is required");

  const ref = doc(db, "students", studentId);
  await updateDoc(ref, patch);

  return true;
}

// Admin: delete student
export async function deleteStudentForAdmin(studentId) {
  if (!studentId) throw new Error("Missing studentId");

  const ref = doc(db, "students", studentId);
  await deleteDoc(ref);

  return true;
}