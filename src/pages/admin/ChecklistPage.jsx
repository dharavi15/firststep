import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

// mock up student data
// can change to DB or API later
const STUDENTS = [
  { id: "s-ethan", name: "Ethan Parker", parent: "Daniel Parker", classYear: "Year 1", status: "Pending (2 days left)", statusTone: "warn" },
  { id: "s-lucas", name: "Lucas Reed", parent: "Lucas Reed", classYear: "Year 2", status: "Completed", statusTone: "ok" },
  { id: "s-mia", name: "Mia Thompson", parent: "Sarah Thompson", classYear: "Year 3", status: "Pending (7 days left)", statusTone: "warn" },
  { id: "s-ava", name: "Ava Collins", parent: "Emily Collins", classYear: "Year 4", status: "Pending", statusTone: "neutral" },
  { id: "s-sophia", name: "Sophia Martinez", parent: "Laura Martinez", classYear: "Year 5", status: "Completed", statusTone: "ok" },
];

// create simple avatar using emoji
// this avoids using real image for now
function AvatarEmoji({ name }) {

  // choose emoji based on name
  // same name will always get same emoji
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];
    let sum = 0;

    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    return pool[sum % pool.length];
  }, [name]);

  return <span className="studentAvatar">{emoji}</span>;
}

// show status with different color style
// tone controls which CSS class is used
function StatusPill({ tone = "neutral", text }) {

  const cls =
    tone === "ok"
      ? "statusPill ok"
      : tone === "warn"
      ? "statusPill warn"
      : "statusPill neutral";

  return <span className={cls}>{text}</span>;
}

export default function ChecklistPage() {

  // useNavigate allows us to go to another page
  const navigate = useNavigate();

  // q = search text
  const [q, setQ] = useState("");

  // page = current page number
  const [page, setPage] = useState(1);

  // how many students per page
  const pageSize = 8;

  // filter students based on search text
  // useMemo makes it recalculate only when q changes
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

  // calculate how many pages we need
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  // make sure current page does not go over total pages
  const safePage = Math.min(page, pageCount);

  // get only students for current page
  const rows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  // go to previous page
  function goPrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  // go to next page
  function goNext() {
    setPage((p) => Math.min(pageCount, p + 1));
  }

  // open student detail page
  // example: /admin/checklist/s-ethan
  function onOpenStudent(studentId) {
    navigate(`/admin/checklist/${studentId}`);
  }

  return (
    <div className="checklistWrap">

      {/* Search box */}
      <div className="searchCard">
        <Search className="searchIcon" size={20} />
        <input
          className="searchInput"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1); // reset to first page when searching
          }}
          placeholder="Search"
        />
      </div>

      {/* Student table */}
      <div className="tableCard">

        {/* Table header */}
        <div className="tableHeader">
          <div className="th thCheck" />
          <div className="th thName">Name</div>
          <div className="th">Parent</div>
          <div className="th">Class</div>
          <div className="th thStatus">Status</div>
        </div>

        {/* Table body */}
        <div className="tableBody">

          {rows.map((s) => (
            <button
              key={s.id}
              type="button"
              className="tableRow"
              onClick={() => onOpenStudent(s.id)}
            >

              {/* Checkbox */}
              <div className="td tdCheck">
                <input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Name + avatar */}
              <div className="td tdName">
                <AvatarEmoji name={s.name} />
                <span className="studentName">{s.name}</span>
              </div>

              {/* Parent */}
              <div className="td">{s.parent}</div>

              {/* Class */}
              <div className="td">{s.classYear}</div>

              {/* Status */}
              <div className="td tdStatus">
                <StatusPill tone={s.statusTone} text={s.status} />
              </div>

            </button>
          ))}

          {/* Show message if no student found */}
          {rows.length === 0 && (
            <div className="emptyState">
              No students found.
            </div>
          )}

        </div>

        {/* Pagination section */}
        <div className="tableFooter">

          <div className="pageText">
            Page : <b>{safePage}</b> of <b>{pageCount}</b>
          </div>

          <div className="pageBtns">
            <button
              type="button"
              className="pageBtn"
              onClick={goPrev}
              disabled={safePage <= 1}
            >
              ‹
            </button>

            <button
              type="button"
              className="pageBtn"
              onClick={goNext}
              disabled={safePage >= pageCount}
            >
              ›
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}