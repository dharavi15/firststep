// src/pages/admin/ProfilePage.jsx
import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

// localStorage key for student profiles
// later you can replace with Firebase collection
const PROFILE_KEY = "firststep_profiles";

// localStorage key for calendar events
// later you can replace with Firebase collection
const EVENT_KEY = "firststep_calendar_events";

// default mock students
// later you can replace this with database data
const DEFAULT_STUDENTS = [
  {
    id: "s-1",
    name: "Linus Mathew",
    email: "abc@gmail.com",
    phone: "(123) 456-7890",
    address: "123 Maple St, Hometown, CA 91001",
    parentName: "Daniel Parker",
    parentEmail: "daniel@gmail.com",
    classYear: "Year 1",
  },
  {
    id: "s-2",
    name: "Lucas Reed",
    email: "lucas@gmail.com",
    phone: "(555) 111-2222",
    address: "77 River Rd, City, CA 91002",
    parentName: "Lucas Reed",
    parentEmail: "lucas.parent@gmail.com",
    classYear: "Year 2",
  },
];

// read students from localStorage
// later replace with Firebase getDocs()
function loadStudents() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_STUDENTS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_STUDENTS;

    return parsed;
  } catch {
    return DEFAULT_STUDENTS;
  }
}

// save students to localStorage
// later replace with Firebase setDoc()
function saveStudents(list) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(list));
}

// read events from localStorage
// later replace with Firebase getDocs()
function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENT_KEY);

    if (!raw) {
      // default mock events
      return [
        {
          id: "e1",
          title: "Health Form Due",
          note: "2 days left",
          date: "2026-02-10",
          studentId: "s-1",
        },
        {
          id: "e2",
          title: "Orientation",
          note: "Parent meeting",
          date: "2026-02-20",
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

// format date to readable text
function prettyDate(dateStr) {
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return dateStr;

  return dt.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// sort events by date ascending
function sortByDateAsc(list) {
  return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
}

// simple avatar using first letter
function AvatarCircle({ name }) {
  const first = (name || "?").trim().slice(0, 1).toUpperCase();
  return <div className="profileAvatar" aria-hidden="true">{first}</div>;
}

// info row component
// we pass icon as JSX to avoid ESLint "unused" issues
function InfoRow({ icon, label, value }) {
  return (
    <div className="profileInfoRow">
      <div className="profileInfoLeft">
        <span className="profileInfoIcon">{icon}</span>
        <span className="profileInfoLabel">{label}</span>
      </div>
      <div className="profileInfoValue">{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  // load students once on first render
  const [students, setStudents] = useState(() => loadStudents());

  // selected student id
  const [selectedId, setSelectedId] = useState(() => {
    const list = loadStudents();
    return list[0]?.id || "";
  });

  // load events once on first render
  const [events] = useState(() => loadEvents());

  // edit modal open/close
  const [isEditOpen, setIsEditOpen] = useState(false);

  // form fields for edit profile
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formParentName, setFormParentName] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formClassYear, setFormClassYear] = useState("");

  // form error message
  const [formError, setFormError] = useState("");

  // find selected student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedId) || null;
  }, [students, selectedId]);

  // events for selected student + global events
  const upcomingEvents = useMemo(() => {
    if (!selectedStudent) return [];

    const filtered = events.filter((e) => {
      return e.studentId === selectedStudent.id || !e.studentId;
    });

    return sortByDateAsc(filtered);
  }, [events, selectedStudent]);

  // open edit modal and fill form with selected student data
  function openEdit() {
    if (!selectedStudent) return;

    setFormName(selectedStudent.name || "");
    setFormEmail(selectedStudent.email || "");
    setFormPhone(selectedStudent.phone || "");
    setFormAddress(selectedStudent.address || "");
    setFormParentName(selectedStudent.parentName || "");
    setFormParentEmail(selectedStudent.parentEmail || "");
    setFormClassYear(selectedStudent.classYear || "");

    setFormError("");
    setIsEditOpen(true);
  }

  // close edit modal
  function closeEdit() {
    setIsEditOpen(false);
    setFormError("");
  }

  // save edited profile to state + localStorage
  function onSaveProfile(e) {
    e.preventDefault();

    if (!selectedStudent) return;

    // basic validation
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required.");
      return;
    }

    const next = students.map((s) => {
      if (s.id !== selectedStudent.id) return s;

      return {
        ...s,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        parentName: formParentName.trim(),
        parentEmail: formParentEmail.trim(),
        classYear: formClassYear.trim(),
      };
    });

    // update UI
    setStudents(next);

    // persist to localStorage
    saveStudents(next);

    // close modal
    setIsEditOpen(false);
  }

  return (
    <div className="profileWrap">
      {/* student list */}
      <div className="profileListCard">
        <div className="profileListTitle">Students</div>

        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`profileRowBtn ${s.id === selectedId ? "active" : ""}`}
            onClick={() => setSelectedId(s.id)}
          >
            <AvatarCircle name={s.name} />
            <span className="profileRowName">{s.name}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      {/* detail card */}
      {selectedStudent && (
        <div className="profileDetailCard">
          <div className="profileHeader">
            <div className="profileHeaderLeft">
              <AvatarCircle name={selectedStudent.name} />
              <div className="profileHeaderText">
                <div className="profileHeaderName">{selectedStudent.name}</div>
                <div className="profileHeaderEmail">{selectedStudent.email}</div>
              </div>
            </div>

            <div className="profileHeaderRight">
              <Bell size={18} />
            </div>
          </div>

          <InfoRow
            icon={<Phone size={16} />}
            label="Phone Number"
            value={selectedStudent.phone}
          />

          <InfoRow
            icon={<MapPin size={16} />}
            label="Home Address"
            value={selectedStudent.address}
          />

          <InfoRow
            icon={<User size={16} />}
            label="Parent Name"
            value={selectedStudent.parentName}
          />

          <InfoRow
            icon={<Mail size={16} />}
            label="Parent Email"
            value={selectedStudent.parentEmail}
          />

          <InfoRow
            icon={<CheckCircle2 size={16} />}
            label="Class"
            value={selectedStudent.classYear}
          />

          <button type="button" className="btnOutlinePrimary" onClick={openEdit}>
            Edit Profile
          </button>

          {/* upcoming events */}
          <div className="profileUpcoming">
            <h3 className="profileUpcomingTitle">Up Coming Event</h3>

            {upcomingEvents.length === 0 ? (
              <div className="upcomingEmpty">No upcoming events.</div>
            ) : (
              upcomingEvents.map((ev) => (
                <div key={ev.id} className="upcomingRow">
                  <div className="upcomingLeft">
                    <CheckCircle2 size={16} />
                    <span className="upcomingText">{ev.title}</span>
                  </div>
                  <div className="upcomingRight">{prettyDate(ev.date)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* edit modal */}
      {isEditOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <h3 className="modalTitle">Edit Profile</h3>

            {formError && <div className="modalError">{formError}</div>}

            <form className="modalForm" onSubmit={onSaveProfile}>
              <label className="modalLabel">
                Name
                <input
                  className="modalInput"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Email
                <input
                  className="modalInput"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Phone
                <input
                  className="modalInput"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Address
                <input
                  className="modalInput"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Parent Name
                <input
                  className="modalInput"
                  value={formParentName}
                  onChange={(e) => setFormParentName(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Parent Email
                <input
                  className="modalInput"
                  value={formParentEmail}
                  onChange={(e) => setFormParentEmail(e.target.value)}
                />
              </label>

              <label className="modalLabel">
                Class
                <input
                  className="modalInput"
                  value={formClassYear}
                  onChange={(e) => setFormClassYear(e.target.value)}
                />
              </label>

              <div className="modalActions">
                <button type="button" className="btnOutlinePrimary" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="btnOutlinePrimary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}