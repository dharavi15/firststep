import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Bell, CheckCircle2 } from "lucide-react";

// make number always 2 digits
// example: 5 -> "05"
function pad2(n) {
  return String(n).padStart(2, "0");
}

// convert Date object to string format "YYYY-MM-DD"
// example: 2026-02-05
function toKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = pad2(dateObj.getMonth() + 1);
  const d = pad2(dateObj.getDate());
  return `${y}-${m}-${d}`;
}

// create month title like "February 2026"
function monthLabel(dateObj) {
  const m = dateObj.toLocaleString("en-US", { month: "long" });
  const y = dateObj.getFullYear();
  return `${m} ${y}`;
}

// get first day of month
// example: Feb 2026 -> 2026-02-01
function startOfMonth(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
}

// get total number of days in month
// example: Feb 2026 -> 28
function daysInMonth(dateObj) {
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();
}

// get weekday index
// Sunday = 0, Monday = 1 ... Saturday = 6
function weekdayIndexSun0(dateObj) {
  return dateObj.getDay();
}

// mock up code (can change to be DB later)
const MOCK_EVENTS = [
  {
    id: "e1",
    date: "2026-02-10",
    title: "Health Form Due",
    note: "2 days left",
    type: "deadline",
  },
  {
    id: "e2",
    date: "2026-02-20",
    title: "Orientation",
    note: "Parent meeting",
    type: "meeting",
  },
  {
    id: "e3",
    date: "2026-02-05",
    title: "Pay Tuition & Fees",
    note: "Pending",
    type: "deadline",
  },
];

// convert event list to Map
// key = date string
// value = array of events on that date
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

// count how many events are inside the month that user is viewing
// this is used for notification badge
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
  // default month is Feb 2026 (for demo)
  const [viewDate, setViewDate] = useState(new Date(2026, 1, 1));

  // selected date
  const [selected, setSelected] = useState("2026-02-05");

  // create map of events by date
  const eventMap = useMemo(() => buildEventMap(MOCK_EVENTS), []);

  // get events of selected date
  const selectedEvents = useMemo(() => {
    return eventMap.get(selected) || [];
  }, [eventMap, selected]);

  // count events in current viewing month
  const notifCount = useMemo(() => {
    return countEventsInMonth(MOCK_EVENTS, viewDate);
  }, [viewDate]);

  // build calendar grid (6 rows x 7 columns)
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
        const dt = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          dayNum
        );
        cells.push(dt);
      }
    }

    return cells;
  }, [viewDate]);

  // go to previous month
  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  // go to next month
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  // when user clicks a date
  function onPickDate(dt) {
    const key = toKey(dt);
    setSelected(key);
  }

  // create readable label for selected date
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
            <button
              className="iconBtn calNavBtn"
              type="button"
              onClick={prevMonth}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className="iconBtn calNavBtn"
              type="button"
              onClick={nextMonth}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendarWeekdays">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w) => (
            <div key={w} className="weekdayCell">
              {w}
            </div>
          ))}
        </div>

        <div className="calendarGrid">
          {grid.map((dt, idx) => {
            if (!dt) {
              return <div key={idx} className="calCell isEmpty" />;
            }

            const key = toKey(dt);
            const isSelected = key === selected;
            const hasEvents = (eventMap.get(key) || []).length > 0;

            return (
              <button
                key={key}
                type="button"
                className={`calCell ${isSelected ? "isSelected" : ""}`}
                onClick={() => onPickDate(dt)}
              >
                <div className="calDayNum">{dt.getDate()}</div>

                {hasEvents && (
                  <div className="calDotRow">
                    <span className="calDot" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="upcomingBlock">
        <div className="upcomingHeader">
          <h3 className="upcomingTitle">Up Coming Event</h3>
          <div className="upcomingDate">{selectedLabel}</div>
        </div>

        <div className="upcomingList">
          {selectedEvents.length === 0 ? (
            <div className="upcomingEmpty">
              No events on this date.
            </div>
          ) : (
            selectedEvents.map((e) => (
              <div key={e.id} className="upcomingRow">
                <div className="upcomingLeft">
                  <span className="upcomingIcon">
                    <CheckCircle2 size={18} />
                  </span>
                  <span className="upcomingText">
                    {e.title}
                  </span>
                </div>
                <div className="upcomingRight">
                  {e.note}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}