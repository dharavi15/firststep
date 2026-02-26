import { useEffect, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { getStudentsForAdmin } from "../../services/studentService";

export default function EnrollmentOverview() {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError("");

      // Debug: see real user + schoolId on this page
      console.log("EnrollmentOverview user:", user);

      // Debug fallback: if user has no schoolId, use demo-school 
      const schoolId = user?.schoolId || "demo-school";
      console.log("EnrollmentOverview schoolId used:", schoolId);

      try {
        const rows = await getStudentsForAdmin({ schoolId });

        console.log("EnrollmentOverview students count:", Array.isArray(rows) ? rows.length : 0);
        console.log("EnrollmentOverview first row:", Array.isArray(rows) ? rows[0] : null);

        if (!alive) return;
        setItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load students");
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [user]);

  return (
    <div className="page">
      <div className="pageHeader">
        <h2 className="pageTitle">Enrollment Overview</h2>
        <p className="pageSubtitle">This list is loaded from Firestore</p>
      </div>

      <div className="card">
        <div className="cardHeader">
          <h3 className="cardTitle">Students Overview</h3>
          <p className="cardSubtitle">Admin can see all students in the school</p>
        </div>

        {loading && <p className="uiText">Loading...</p>}
        {!loading && error && <p className="uiError">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="uiText">No students found</p>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="studentList">
            {items.map((s) => (
              <div key={s.id} className="studentRow">
                <div className="studentLeft">
                  <div className="studentName">{s.studentName || "No name"}</div>
                  <div className="studentMeta">
                    {typeof s.year === "number" ? `Year ${s.year}` : "No year"}
                  </div>
                </div>

                <div className="studentRight">
                  <span className={`statusPill status-${s.overallStatus || "pending"}`}>
                    {s.overallStatus || "pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}