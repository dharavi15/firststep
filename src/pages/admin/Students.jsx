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
        const rows = await getStudentsForAdmin({
          schoolId: user?.schoolId,
        });

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
      <p>This list is loaded from Firestore</p>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p>No students found.</p>
      )}

      {!loading &&
        !error &&
        items.map((s) => (
          <div key={s.id}>
            <div>{s.studentName || "No name"}</div>
            <div>
              <span>{s.year ? `Year ${s.year}` : "No grade"}</span>
              {" | "}
              <span>{s.overallStatus || "No status"}</span>
            </div>
          </div>
        ))}
    </div>
  );
}