import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

// storage key for localStorage
// later you can replace this with Firebase collection
const STORAGE_KEY = "firststep_calendar_events";

// create random id for new event
function makeId() {
  return "e-" + Math.random().toString(16).slice(2) + "-" + Date.now();
}

// get events from localStorage
// later replace with Firebase getDocs()
function getEventsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      // default demo data
      return [
        {
          id: "e1",
          date: "2026-02-10",
          title: "Health Form Due",
          note: "2 days left",
        },
        {
          id: "e2",
          date: "2026-02-20",
          title: "Orientation",
          note: "Parent meeting",
        },
        {
          id: "e3",
          date: "2026-02-05",
          title: "Pay Tuition & Fees",
          note: "Pending",
        },
      ];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

// save events to localStorage
// later replace with Firebase setDoc()
function saveEventsToStorage(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// convert number to 2 digits
function pad2(n) {
  return String(n).padStart(2, "0");
}

// convert Date to YYYY-MM-DD
function toKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return `${y}-${m}-${d}`;
}

// create month title like February 2026
function monthLabel(dateObj) {
  const m = dateObj.toLocaleString("en-US", { month: "long" });
  const y = dateObj.getFullYear();
  return `${m} ${y}`;
}

// get first day of month
function startOfMonth(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
}

// get total days in month
function daysInMonth(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
}

// Sunday = 0
function weekdayIndexSun0(dateObj) {
  return dateObj.getDay();
}

// build map from date to events
function buildEventMap(events) {
  const map = new Map();

  for (const e of events) {
    if (!map.has(e.date)) {
      map.set(e.date, []);
    }
    map.get(e.date).push(e);
  }

  return map;
}

// count events inside current month
function countEventsInMonth(events, viewDate) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();

  return events.filter((e) => {
    const [yy, mm, dd] = e.date.split("-").map(Number);
    const dt = new Date(yy, mm - 1, dd);
    return dt.getFullYear() === y && dt.getMonth() === m;
  }).length;
}

export default function CalendarPage() {
  // month user is viewing
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1));

  // selected date
  const [selected, setSelected] = useState("2026-02-05");

  // events list
  const [events, setEvents] = useState([]);

  // loading state
  const [loading, setLoading] = useState(true);

  // error message
  const [error, setError] = useState("");

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // if not empty = editing mode
  const [editId, setEditId] = useState("");

  // form fields
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formNote, setFormNote] = useState("");

  // load events on first render
  useEffect(() => {
    try {
      setLoading(true);
      const list = getEventsFromStorage();
      setEvents(list);
      setError("");
    } catch {
      setError("Cannot load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  const eventMap = useMemo(() => buildEventMap(events), [events]);

  const selectedEvents = useMemo(() => {
    return eventMap.get(selected) || [];
  }, [eventMap, selected]);

  const notifCount = useMemo(() => {
    return countEventsInMonth(events, viewDate);
  }, [events, viewDate]);

  const grid = useMemo(() => {
    const first = startOfMonth(viewDate);
    const total = daysInMonth(viewDate);
    const startPad = weekdayIndexSun0(first);

    const cells = [];

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startPad + 1;

      if (dayNum < 1 || dayNum > total) {
        cells.push(null);
      } else {
        cells.push(
          new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum)
        );
      }
    }

    return cells;
  }, [viewDate]);

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  function onPickDate(dt) {
    setSelected(toKey(dt));
  }

  function openAddModal() {
    setEditId("");
    setFormDate(selected);
    setFormTitle("");
    setFormNote("");
    setError("");
    setIsModalOpen(true);
  }

  function openEditModal(ev) {
    setEditId(ev.id);
    setFormDate(ev.date);
    setFormTitle(ev.title);
    setFormNote(ev.note || "");
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditId("");
    setError("");
  }

  function onSubmitEvent(e) {
    e.preventDefault();

    if (!formDate || !formTitle.trim()) {
      setError("Date and Title are required.");
      return;
    }

    try {
      let next;

      if (editId) {
        next = events.map((ev) =>
          ev.id === editId
            ? { ...ev, date: formDate, title: formTitle, note: formNote }
            : ev
        );
      } else {
        next = [
          ...events,
          {
            id: makeId(),
            date: formDate,
            title: formTitle,
            note: formNote,
          },
        ];
      }

      setEvents(next);
      saveEventsToStorage(next);

      setSelected(formDate);
      setIsModalOpen(false);
      setEditId("");
    } catch {
      setError("Cannot save event.");
    }
  }

  function onDeleteEvent(eventId) {
    try {
      const next = events.filter((e) => e.id !== eventId);
      setEvents(next);
      saveEventsToStorage(next);
    } catch {
      setError("Cannot delete event.");
    }
  }

  const selectedLabel = useMemo(() => {
    if (!selected) return "";

    const [y, m, d] = selected.split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    return dt.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selected]);

  return (
    <div className="calendarWrap">
      <div className="calendarCard">
        <div className="calendarTop">
          <div className="calendarTitle">
            <div className="calendarMonth">
              {monthLabel(viewDate)}
            </div>

            <div className="calendarNotif">
              <Bell size={18} />
              <span className="notifBadge">{notifCount}</span>
            </div>
          </div>

          <div className="calendarNav">
            <button className="iconBtn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <button className="iconBtn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendarGrid">
          {grid.map((dt, idx) => {
            if (!dt) return <div key={idx} className="calCell" />;

            const key = toKey(dt);
            const isSelected = key === selected;
            const hasEvents = (eventMap.get(key) || []).length > 0;

            return (
              <button
                key={key}
                className={`calCell ${isSelected ? "isSelected" : ""}`}
                onClick={() => onPickDate(dt)}
              >
                <div>{dt.getDate()}</div>
                {hasEvents && <span className="calDot" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="upcomingBlock">
        <div className="upcomingHeader">
          <h3>Up Coming Event</h3>
          <div>{selectedLabel}</div>

          <button
            type="button"
            className="btnOutlinePrimary btnWithIcon"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>

        {loading && <div>Loading...</div>}

        {!loading &&
          selectedEvents.map((ev) => (
            <div key={ev.id} className="upcomingRow">
              <div className="upcomingLeft">
                <CheckCircle2 size={16} />
                <span>{ev.title}</span>
              </div>

              <div>{ev.note}</div>

              <div className="calendarActionGroup">
                <button
                  type="button"
                  className="btnOutlinePrimary btnWithIcon"
                  onClick={() => openEditModal(ev)}
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  className="btnOutlinePrimary btnWithIcon"
                  onClick={() => onDeleteEvent(ev.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}

        {error && <div>{error}</div>}
      </div>

      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalCard">
            <button
              type="button"
              className="btnOutlinePrimary"
              onClick={closeModal}
            >
              Close
            </button>

            <form onSubmit={onSubmitEvent}>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />

              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
              />

              <input
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Note"
              />

              <button type="submit" className="btnOutlinePrimary">
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}