import { useMemo, useState, useEffect, useCallback } from "react";
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
const STORAGE_KEY = "firststep_calendar_events";

// create random id for new event
function makeId() {
  return "e-" + Math.random().toString(16).slice(2) + "-" + Date.now();
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

// create month title
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

// read manual events from localStorage (with demo fallback)
function getManualEventsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const now = new Date();
      const today = toKey(now);
      const in2Days = toKey(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)
      );

      return [
        { id: "demo-1", date: today, title: "Open house", note: "At school" },
        {
          id: "demo-2",
          date: in2Days,
          title: "Document Due",
          note: "Please submit documents",
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

function saveManualEventsToStorage(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// local time
function startOfDay(dt) {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// helper: diff days between two YYYY-MM-DD (target - today)
function diffDaysFromToday(dateKey) {
  const now = startOfDay(new Date());
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = startOfDay(new Date(y, m - 1, d));
  const ms = target.getTime() - now.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// build due soon list (next 7 days including today)
function buildDueSoon(events) {
  const list = events
    .map((ev) => ({ ...ev, diff: diffDaysFromToday(ev.date) }))
    .filter((ev) => ev.diff >= 0 && ev.diff <= 7)
    .sort((a, b) => a.diff - b.diff || a.title.localeCompare(b.title));

  return list;
}

// quick add templates
const QUICK_TEMPLATES = [
  { key: "tuition", title: "Tuition Due", note: "Please pay tuition & fees" },
  { key: "doc", title: "Document Due", note: "Please submit documents" },
  { key: "meeting", title: "Parent Meeting", note: "At school" },
  { key: "ori", title: "Orientation", note: "Campus visit" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  // today reference
  const todayKey = useMemo(() => toKey(new Date()), []);

  // month user is viewing
  const [viewDate, setViewDate] = useState(() => startOfMonth(new Date()));

  // selected date
  const [selected, setSelected] = useState(todayKey);

  // manual events (localStorage)
  const [manualEvents, setManualEvents] = useState([]);

  // auto events
  const [autoEvents, setAutoEvents] = useState([]);

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

  // load manual events on first render
  useEffect(() => {
    try {
      setLoading(true);
      const list = getManualEventsFromStorage();
      setManualEvents(list);
      setError("");
    } catch {
      setError("Cannot load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  // auto events loader
  const loadAutoEvents = useCallback(async () => {
    try {
      setAutoEvents([]);
    } catch {
      setError((prev) => prev || "Auto deadlines cannot load.");
      setAutoEvents([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadAutoEvents();
    })();
  }, [loadAutoEvents]);

  // merged events used by UI
  const events = useMemo(() => {
    return [...manualEvents, ...autoEvents];
  }, [manualEvents, autoEvents]);

  const eventMap = useMemo(() => buildEventMap(events), [events]);

  const selectedEvents = useMemo(() => {
    const list = eventMap.get(selected) || [];
    // auto events first
    return [...list].sort((a, b) => {
      const aa = a.isAuto ? 0 : 1;
      const bb = b.isAuto ? 0 : 1;
      return aa - bb;
    });
  }, [eventMap, selected]);

  const notifCount = useMemo(() => {
    return countEventsInMonth(events, viewDate);
  }, [events, viewDate]);

  const dueSoonList = useMemo(() => buildDueSoon(events), [events]);

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
        cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum));
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
        next = manualEvents.map((ev) =>
          ev.id === editId
            ? { ...ev, date: formDate, title: formTitle, note: formNote }
            : ev
        );
      } else {
        next = [
          ...manualEvents,
          {
            id: makeId(),
            date: formDate,
            title: formTitle,
            note: formNote,
          },
        ];
      }

      setManualEvents(next);
      saveManualEventsToStorage(next);

      setSelected(formDate);
      setIsModalOpen(false);
      setEditId("");
      setError("");
    } catch {
      setError("Cannot save event.");
    }
  }

  function onDeleteEvent(eventId) {
    try {
      const next = manualEvents.filter((e) => e.id !== eventId);
      setManualEvents(next);
      saveManualEventsToStorage(next);
      setError("");
    } catch {
      setError("Cannot delete event.");
    }
  }

  function quickAdd(template) {
    try {
      const next = [
        ...manualEvents,
        {
          id: makeId(),
          date: selected,
          title: template.title,
          note: template.note,
        },
      ];
      setManualEvents(next);
      saveManualEventsToStorage(next);
      setError("");
    } catch {
      setError("Cannot quick add event.");
    }
  }

  const selectedLabel = useMemo(() => {
    if (!selected) return "";

    const [y, m, d] = selected.split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    return dt.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [selected]);

  const todayLabel = useMemo(() => {
    const [y, m, d] = todayKey.split("-").map(Number);
    const dt = new Date(y, m - 1, d);

    return dt.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [todayKey]);

  // text summary for each day (show first title + count)
  function dayEventSummary(dateKey) {
    const list = eventMap.get(dateKey) || [];
    if (!list.length) return "";

    const sorted = [...list].sort((a, b) => {
      const aa = a.isAuto ? 0 : 1;
      const bb = b.isAuto ? 0 : 1;
      return aa - bb || String(a.title).localeCompare(String(b.title));
    });

    const first = sorted[0]?.title || "";
    const more = sorted.length - 1;

    if (!first) return more > 0 ? `+${sorted.length} events` : "";
    return more > 0 ? `${first} +${more}` : first;
  }

  return (
    <div className="calendarWrap">
      <div className="calendarCard">
        <div className="calendarTop">
          <div className="calendarTitle">
            <div className="calendarMonth">{monthLabel(viewDate)}</div>

            <div className="calendarNotif">
              <Bell size={18} />
              <span className="notifBadge">{notifCount}</span>
            </div>

          </div>

          <div className="calendarNav">
            <button type="button" className="iconBtn calNavBtn" onClick={prevMonth}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="iconBtn calNavBtn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendarHintRow">
          <div>
            <span className="calendarHintLabel">Today:</span> {todayLabel}{" "}
            <span className="calInlineTag calInlineTagToday">Today</span>
          </div>
          <div>
            <span className="calendarHintLabel">Selected:</span> {selectedLabel}
          </div>
        </div>

        <div className="calendarWeekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="weekdayCell">
              {w}
            </div>
          ))}
        </div>

        <div className="calendarGrid">
          {grid.map((dt, idx) => {
            if (!dt) return <div key={idx} className="calCell isEmpty" />;

            const key = toKey(dt);
            const isSelected = key === selected;
            const isToday = key === todayKey;

            const list = eventMap.get(key) || [];
            const hasEvents = list.length > 0;
            const summary = hasEvents ? dayEventSummary(key) : "";

            return (
              <button
                key={key}
                type="button"
                className={`calCell ${isSelected ? "isSelected" : ""} ${
                  isToday ? "isToday" : ""
                }`}
                onClick={() => onPickDate(dt)}
              >
                <div className="calDayTop">
                  <div className="calDayNum">{dt.getDate()}</div>

                  {/* add Selected label inside selected cell */}
                  {isSelected ? (
                    <span className="calDayTag calDayTagSelected">Selected</span>
                  ) : null}

                  {/* keep today styling via class */}
                </div>

                <div className="calDotRow">
                  {hasEvents ? (
                    <>
                      <span className="calDot" aria-hidden="true" />
                      <span className="calEventText" title={summary}>
                        {summary}
                      </span>
                    </>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Due Soon */}
      <div className="dueSoonBlock">
        <div className="dueSoonHeader">
          <div className="dueSoonTitle">
            Due Soon <span className="notifBadge">{dueSoonList.length}</span>
          </div>
          <div className="dueSoonMeta">Next 7 days (including today)</div>
        </div>

        {dueSoonList.length === 0 ? (
          <div className="empty-state">No due soon</div>
        ) : (
          dueSoonList.map((ev) => {
            const diff = diffDaysFromToday(ev.date);
            const badge =
              diff === 0 ? "Due today" : `${diff} day${diff > 1 ? "s" : ""} left`;

            return (
              <div key={ev.id} className="dueSoonRow">
                <div className="dueSoonLeft">
                  <div className="dueSoonBadge">{badge}</div>
                  <div className="dueSoonName">
                    {ev.title}{" "}
                    {ev.isAuto ? <span className="dueSoonAuto">(auto)</span> : null}
                  </div>
                  {ev.note ? <div className="dueSoonNote">{ev.note}</div> : null}
                </div>
                <div className="dueSoonDate">{ev.date}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Upcoming */}
      <div className="upcomingBlock">
        <div className="upcomingHeader">
          <div className="upcomingHeadLeft">
            <h3 className="upcomingTitle">Up Coming Event</h3>
            <div className="upcomingDate">{selectedLabel}</div>
          </div>

          <button
            type="button"
            className="btnOutlinePrimary btnWithIcon upcomingAddBtn"
            onClick={openAddModal}
          >
            <Plus size={16} />
            Add Event
          </button>
        </div>

        <div className="quickAddRow">
          <div className="quickAddLabel">Quick Add:</div>
          <div className="quickAddBtns">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                className="quickAddBtn"
                onClick={() => quickAdd(t)}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="calendarLoading">Loading...</div>}

        {!loading && selectedEvents.length === 0 && (
          <div className="empty-state">No events for this date.</div>
        )}

        {!loading &&
          selectedEvents.map((ev) => (
            <div key={ev.id} className="upcomingRow">
              <div className="upcomingLeft">
                <CheckCircle2 size={16} />
                <span className="upcomingTitleText">
                  {ev.title}{" "}
                  {ev.isAuto ? <span className="dueSoonAuto">(auto)</span> : null}
                </span>
              </div>

              <div className="upcomingNoteText">{ev.note}</div>

              <div className="calendarActionGroup">
                <button
                  type="button"
                  className="btnOutlinePrimary btnWithIcon btnSm"
                  onClick={() => openEditModal(ev)}
                  disabled={!!ev.isAuto}
                  title={ev.isAuto ? "Auto event cannot edit" : "Edit"}
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  className="btnOutlinePrimary btnWithIcon btnSm"
                  onClick={() => onDeleteEvent(ev.id)}
                  disabled={!!ev.isAuto}
                  title={ev.isAuto ? "Auto event cannot delete" : "Delete"}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}

        {error && <div className="error-text">{error}</div>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalCard">
            <div className="modalTopRow">
              <div className="modalTitle">{editId ? "Edit Event" : "Add Event"}</div>
              <button
                type="button"
                className="btnOutlinePrimary btnSm"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <form onSubmit={onSubmitEvent} className="modalForm">
              <div className="form-field">
                <label className="form-label">Date</label>
                <input
                  className="text-input"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Title</label>
                <input
                  className="text-input"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Title"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Note</label>
                <input
                  className="text-input"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Note"
                />
              </div>

              <div className="modalActions">
                <button type="submit" className="btnOutlinePrimary">
                  Save
                </button>
              </div>

              {error && <div className="error-text modalErrorInline">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}