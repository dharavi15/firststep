import { useEffect, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { getStudentsForAdmin } from "../../services/studentService";

export default function Students() {
  const user = useAuthStore((s) => s.user);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const rows = await getStudentsForAdmin({ schoolId: user?.schoolId });
        if (!alive) return;
        setItems(rows);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load students");
      } finally {
        
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [user?.schoolId]);

  return (
    <div>
      <h2>Manage Student</h2>
      <p style={{ marginTop: 0 }}>This list is loaded from Firestore</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "var(--color-error)" }}>{error}</p>}

      {!loading && !error && items.length === 0 && <p>No students found.</p>}

      {!loading &&
        !error &&
        items.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: 12,
              background: "var(--color-surface)",
              marginBottom: 10,
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{s.studentName || "No name"}</div>

            <div style={{ display: "flex", gap: 14 }}>
              <div>{s.year ? `Year ${s.year}` : "No grade"}</div>
              <div>{s.overallStatus || "No status"}</div>
            </div>
          </div>
        ))}
    </div>
  );
}