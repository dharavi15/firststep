import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firestore";

// This function loads all students from Firestore
// It returns an array of student objects
// Each object includes id from the document id

export async function getStudents() {
  const col = collection(db, "students");

  // Order by createdAt if the field exists in your documents
  // If your documents do not have createdAt, remove orderBy line
  const q = query(col, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    return { id: d.id, ...d.data() };
  });
}

// This function loads students for one parent email
// It filters by parentEmail field in students collection

export async function getStudentsByParentEmail(parentEmail) {
  const email = (parentEmail || "").trim();
  if (!email) return [];

  const col = collection(db, "students");
  const q = query(col, where("parentEmail", "==", email));

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    return { id: d.id, ...d.data() };
  });
}