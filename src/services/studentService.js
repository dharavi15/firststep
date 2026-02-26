import { collection, getDocs, query, where } from "firebase/firestore";
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

export async function getStudents({ schoolId } = {}) {
  return getStudentsForAdmin({ schoolId });
}