// src/pages/admin/ProfilePage.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Mail, MapPin, Phone, User } from "lucide-react";

/* localStorage key */
const PROFILE_KEY = "firststep_profiles";

/* localStorage key */
const EVENT_KEY = "firststep_calendar_events";

/* emoji options */
const EMOJI_OPTIONS = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];

/* mock students */
const DEFAULT_STUDENTS = [
  {
    id: "s-1",
    name: "Miss ABC",
    email: "abc@gmail.com",
    phone: "(123) 456-7890",
    address: "123 Maple St, Hometown, CA 91001",
    parentName: "Daniel Parker",
    parentEmail: "daniel@gmail.com",
    classYear: "Admin",
    avatarEmoji: "👩‍🎓",
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
    avatarEmoji: "👨‍🎓",
  },
];

/* ensure emoji exists */
function normalizeStudents(list) {
  return list.map((s, idx) => {
    const fallback = EMOJI_OPTIONS[idx % EMOJI_OPTIONS.length];
    return { ...s, avatarEmoji: s.avatarEmoji || fallback };
  });
}

/* load students */
function loadStudents() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return normalizeStudents(DEFAULT_STUDENTS);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return normalizeStudents(DEFAULT_STUDENTS);

    return normalizeStudents(parsed);
  } catch {
    return normalizeStudents(DEFAULT_STUDENTS);
  }
}

/* save students */
function saveStudents(list) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(list));
}

/* load events */
function loadEvents() {
  try {
    const raw = localStorage.getItem(EVENT_KEY);

    if (!raw) {
      return [
        {
          id: "e1",
          title: "Open house",
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
        {
          id: "e3",
          title: "Reminder",
          note: "Note",
          date: "2026-02-28",
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

/* pretty date */
function prettyDate(dateStr) {
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return dateStr;

  return dt.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* sort events */
function sortByDateAsc(list) {
  return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
}

/* avatar */
function AvatarCircle({ emoji }) {
  return (
    <div className="profileAvatar" aria-hidden="true">
      {emoji || "🧒"}
    </div>
  );
}

/* info row */
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
  /* students state */
  const [students, setStudents] = useState(() => loadStudents());

  /* selected student */
  const [selectedId, setSelectedId] = useState(() => {
    const list = loadStudents();
    return list[0]?.id || "";
  });

  /* events state */
  const [events] = useState(() => loadEvents());

  /* edit mode */
  const [isEditOpen, setIsEditOpen] = useState(false);

  /* form fields */
  const [formEmoji, setFormEmoji] = useState(EMOJI_OPTIONS[0]);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formParentName, setFormParentName] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formClassYear, setFormClassYear] = useState("");

  /* form error */
  const [formError, setFormError] = useState("");

  /* scroll target */
  const editRef = useRef(null);

  /* selected student object */
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedId) || null;
  }, [students, selectedId]);

  /* upcoming events */
  const upcomingEvents = useMemo(() => {
    if (!selectedStudent) return [];

    const filtered = events.filter((e) => {
      return e.studentId === selectedStudent.id || !e.studentId;
    });

    return sortByDateAsc(filtered);
  }, [events, selectedStudent]);

  /* fill form */
  function fillFormFromStudent(stu) {
    setFormEmoji(stu?.avatarEmoji || EMOJI_OPTIONS[0]);
    setFormName(stu?.name || "");
    setFormEmail(stu?.email || "");
    setFormPhone(stu?.phone || "");
    setFormAddress(stu?.address || "");
    setFormParentName(stu?.parentName || "");
    setFormParentEmail(stu?.parentEmail || "");
    setFormClassYear(stu?.classYear || "");
  }

  /* select student */
  function onSelectStudent(id) {
    setSelectedId(id);
    setFormError("");

    if (isEditOpen) {
      const nextStudent = students.find((s) => s.id === id) || null;
      fillFormFromStudent(nextStudent);
    } else {
      setIsEditOpen(false);
    }
  }

  /* open edit section */
  function openEdit() {
    if (!selectedStudent) return;
    fillFormFromStudent(selectedStudent);
    setFormError("");
    setIsEditOpen(true);
  }

  /* cancel edit */
  function closeEdit() {
    setIsEditOpen(false);
    setFormError("");
    fillFormFromStudent(selectedStudent);
  }

  /* save profile */
  function onSaveProfile(e) {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required.");
      return;
    }

    const next = students.map((s) => {
      if (s.id !== selectedStudent.id) return s;

      return {
        ...s,
        avatarEmoji: formEmoji,
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        parentName: formParentName.trim(),
        parentEmail: formParentEmail.trim(),
        classYear: formClassYear.trim(),
      };
    });

    setStudents(next);
    saveStudents(next);

    setIsEditOpen(false);
    setFormError("");
  }

  /* scroll to edit section when open */
  useEffect(() => {
    if (!isEditOpen) return;
    if (!editRef.current) return;
    editRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isEditOpen]);

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
            onClick={() => onSelectStudent(s.id)}
          >
            <AvatarCircle emoji={s.avatarEmoji} />
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
              <AvatarCircle emoji={selectedStudent.avatarEmoji} />
              <div className="profileHeaderText">
                <div className="profileHeaderName">{selectedStudent.name}</div>
                <div className="profileHeaderEmail">{selectedStudent.email}</div>
              </div>
            </div>
          </div>

          <InfoRow icon={<Phone size={16} />} label="Phone" value={selectedStudent.phone} />
          <InfoRow icon={<MapPin size={16} />} label="Address" value={selectedStudent.address} />
          <InfoRow icon={<User size={16} />} label="Parent" value={selectedStudent.parentName} />
          <InfoRow icon={<Mail size={16} />} label="Parent Email" value={selectedStudent.parentEmail} />
          <InfoRow icon={<CheckCircle2 size={16} />} label="Class" value={selectedStudent.classYear} />

          {/* edit button */}
          {!isEditOpen && (
            <button type="button" className="btnOutlinePrimary" onClick={openEdit}>
              Edit Profile
            </button>
          )}

          {/* inline edit section */}
          {isEditOpen && (
            <div ref={editRef} className="profileEditCard">
              <div className="profileEditTopRow">
                <h3 className="modalTitle">Edit Profile</h3>
              </div>

              {formError && <div className="modalError">{formError}</div>}

              <form className="modalForm" onSubmit={onSaveProfile}>
                <label className="modalLabel">
                  Profile Emoji
                  <select
                    className="modalInput profileEmojiSelect"
                    value={formEmoji}
                    onChange={(e) => setFormEmoji(e.target.value)}
                  >
                    {EMOJI_OPTIONS.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="modalLabel">
                  Name
                  <input className="modalInput" value={formName} onChange={(e) => setFormName(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Email
                  <input className="modalInput" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Phone
                  <input className="modalInput" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Address
                  <input className="modalInput" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Parent Name
                  <input className="modalInput" value={formParentName} onChange={(e) => setFormParentName(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Parent Email
                  <input className="modalInput" value={formParentEmail} onChange={(e) => setFormParentEmail(e.target.value)} />
                </label>

                <label className="modalLabel">
                  Class
                  <input className="modalInput" value={formClassYear} onChange={(e) => setFormClassYear(e.target.value)} />
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
          )}

          {/* upcoming events */}
          <div className="profileUpcoming">
            <h3 className="profileUpcomingTitle">Upcoming</h3>

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
    </div>
  );
}