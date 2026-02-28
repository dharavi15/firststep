import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { getStudentsForAdmin, getStudentsForParent } from "../../services/studentService";

const STATUS_FILTERS = ["all", "pending", "completed"];
const PAGE_SIZE = 6;

function getInitials(name) {
  const s = String(name || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function statusPillClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "statusPill ok";
  if (s === "pending") return "statusPill warn";
  return "statusPill neutral";
}

export default function EnrollmentOverview() {
  const user = useAuthStore((s) => s.user);

  const isAdmin =
    user?.role === "admin" ||
    user?.userRole === "admin" ||
    user?.type === "admin" ||
    user?.email === "admin@test.com";

  const schoolId = user?.schoolId || "";
  const parentEmail = user?.email || user?.parentEmail || "";

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const canLoad = Boolean(schoolId) && (isAdmin || Boolean(parentEmail));

  const loadStudents = async () => {
    if (!canLoad) return;

    setLoading(true);
    setError("");

    try {
      const rows = isAdmin
        ? await getStudentsForAdmin({ schoolId })
        : await getStudentsForParent({ schoolId, parentEmail });

      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, isAdmin, parentEmail]);

  const sortedItems = useMemo(() => {
    const copy = Array.isArray(items) ? [...items] : [];
    copy.sort((a, b) =>
      String(a.studentName || "").localeCompare(String(b.studentName || ""))
    );
    return copy;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = String(searchTerm || "").trim().toLowerCase();

    return sortedItems.filter((row) => {
      const status = String(row.overallStatus || "pending").toLowerCase();

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;

      const name = String(row.studentName || "").toLowerCase();
      const parent = String(row.parentName || "").toLowerCase();
      const email = String(row.parentEmail || "").toLowerCase();
      const year = String(row.year ?? "").toLowerCase();

      return (
        name.includes(q) ||
        parent.includes(q) ||
        email.includes(q) ||
        year.includes(q) ||
        status.includes(q)
      );
    });
  }, [sortedItems, statusFilter, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

  return (
    <div className="checklistWrap eoWrap">
      <div className="eoTopRow">
        <div className="eoTopLeft">
          <div className="eventDetailTitle">Students Overview</div>
          <div className="eventDetailDesc">List of enrolled students</div>
        </div>
      </div>

      <div className="eoControls">
        <div className="eoStatusGroup">
          <div className="eoStatusLabel">Status :</div>
          <div className="eoTabs">
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={active ? "eoTab eoTabActive" : "eoTab"}
                  onClick={() => setStatusFilter(s)}
                >
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="eoSearch">
          <span className="eoSearchIcon">🔍</span>
          <input
            className="searchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
          />
        </div>
      </div>

      {!schoolId ? <div className="emptyState">No schoolId found for this user</div> : null}
      {schoolId && !canLoad ? (
        <div className="emptyState">No parent email found for this user</div>
      ) : null}
      {schoolId && canLoad && loading ? <div className="emptyState">Loading students</div> : null}
      {schoolId && canLoad && !loading && error ? <div className="emptyState">{error}</div> : null}

      {schoolId && canLoad && !loading && !error ? (
        <div className="tableCard eoTableCard">
          <div className="eoTableHeader">
            <div className="eoTh eoThNo">No</div>
            <div className="eoTh">Student Name</div>
            <div className="eoTh">Parent Name</div>
            <div className="eoTh">Class</div>
            <div className="eoTh">Status</div>
          </div>

          <div className="tableBody eoTableBody">
            {pageItems.length === 0 ? (
              <div className="emptyState">No students found</div>
            ) : (
              pageItems.map((row, idx) => {
                const statusText = String(row.overallStatus || "pending").toLowerCase();
                const yearText =
                  typeof row.year === "number" || String(row.year || "").trim()
                    ? `Year ${row.year}`
                    : "-";

                const no = (safePage - 1) * PAGE_SIZE + idx + 1;

                return (
                  <div key={row.id} className="eoRow">
                    <div className="eoTd eoTdNo">
                      <div className="eoNoBadge">{no}</div>
                    </div>

                    <div className="eoTd eoStudentCell">
                      <div className="studentAvatar">{getInitials(row.studentName)}</div>

                      <div className="eoStudentText">
                        <div className="studentName">{row.studentName || "No name"}</div>
                      </div>
                    </div>

                    <div className="eoTd">{row.parentName || "-"}</div>
                    <div className="eoTd">{yearText}</div>

                    <div className="eoTd">
                      <span className={statusPillClass(statusText)}>
                        {statusText[0].toUpperCase() + statusText.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="tableFooter eoFooter">
            <div className="eoPageText">
              Page : {safePage} of {totalPages}
            </div>

            <div className="pageBtns">
              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Prev page"
              >
                ‹
              </button>

              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}