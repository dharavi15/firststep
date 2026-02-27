import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Create an enrollment doc (progress tracking)
export async function createEnrollment({
  enrollmentId,
  schoolId,
  studentName,
  parentName,
  parentEmail,
  year,
  totalSteps = 5,
} = {}) {
  if (!enrollmentId) throw new Error("enrollmentId is required");
  if (!schoolId) throw new Error("schoolId is required");

  const payload = {
    enrollmentId,
    schoolId,
    studentName: studentName || "",
    parentName: parentName || "",
    parentEmail: parentEmail || "",
    year: typeof year === "number" ? year : null,

    totalSteps,
    completedSteps: 0,
    progressPercent: 0,
    overallStatus: "pending",

    // Keep it simple for now
    nextDeadline: "",
    createdAt: new Date().toISOString(),
  };

  // Use enrollmentId as Firestore doc id to make linking easy
  const ref = doc(db, "enrollments", enrollmentId);
  await setDoc(ref, payload);

  return payload;
}