import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

const STUDENTS = [
  { id: "s-ethan", name: "Ethan Parker", parent: "Daniel Parker", classYear: "Year 1", status: "Pending (2 days left)", statusTone: "warn" },
  { id: "s-lucas", name: "Lucas Reed", parent: "Lucas Reed", classYear: "Year 2", status: "Completed", statusTone: "ok" },
  { id: "s-mia", name: "Mia Thompson", parent: "Sarah Thompson", classYear: "Year 3", status: "Pending (7 days left)", statusTone: "warn" },
  { id: "s-ava", name: "Ava Collins", parent: "Emily Collins", classYear: "Year 4", status: "Pending", statusTone: "neutral" },
  { id: "s-sophia", name: "Sophia Martinez", parent: "Laura Martinez", classYear: "Year 5", status: "Completed", statusTone: "ok" },
];

function AvatarEmoji({ name }) {
  // ทำ avatar แบบง่ายๆ (ไม่ต้องมีรูปจริงก่อน)
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return pool[sum % pool.length];
  }, [name]);

  return <span className="studentAvatar" aria-hidden="true">{emoji}</span>;
}

function StatusPill({ tone = "neutral", text }) {
  const cls =
    tone === "ok" ? "statusPill ok" : tone === "warn" ? "statusPill warn" : "statusPill neutral";
  return <span className={cls}>{text}</span>;
}

export default function ChecklistPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 8;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return STUDENTS;
    return STUDENTS.filter((s) => {
      return (
        s.name.toLowerCase().includes(query) ||
        s.parent.toLowerCase().includes(query) ||
        s.classYear.toLowerCase().includes(query) ||
        s.status.toLowerCase().includes(query)
      );
    });
  }, [q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }
  function goNext() {
    setPage((p) => Math.min(pageCount, p + 1));
  }
  function onOpenStudent(studentId) {
    navigate(`/admin/checklist/${studentId}`);
  }

  return (
    <div className="checklistWrap">
      {/* Search */}
      <div className="searchCard">
        <Search className="searchIcon" size={20} />
        <input
          className="searchInput"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search"
          aria-label="Search students"
        />
      </div>

      {/* Table */}
      <div className="tableCard">
        <div className="tableHeader">
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
        </div>

        <div className="tableBody">
          {rows.map((s) => (
            <button
              key={s.id}
              type="button"
              className="tableRow"
              onClick={() => onOpenStudent(s.id)}
              title="Open student checklist"
            >
              <div className="td tdCheck">
                <input type="checkbox" onClick={(e) => e.stopPropagation()} aria-label={`Select ${s.name}`} />
              </div>

              <div className="td tdName">
                <AvatarEmoji name={s.name} />
                <span className="studentName">{s.name}</span>
              </div>

              <div className="td">{s.parent}</div>
              <div className="td">{s.classYear}</div>

              <div className="td tdStatus">
                <StatusPill tone={s.statusTone} text={s.status} />
              </div>
            </button>
          ))}

          {rows.length === 0 && (
            <div className="emptyState">No students found.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="tableFooter">
          <div className="pageText">
            Page : <b>{safePage}</b> of <b>{pageCount}</b>
          </div>

          <div className="pageBtns">
            <button type="button" className="pageBtn" onClick={goPrev} disabled={safePage <= 1} aria-label="Previous page">
              ‹
            </button>
            <button type="button" className="pageBtn" onClick={goNext} disabled={safePage >= pageCount} aria-label="Next page">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}