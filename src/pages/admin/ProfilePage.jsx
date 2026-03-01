import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Mail, MapPin, Phone, User } from "lucide-react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";

/* emoji options */
const EMOJI_OPTIONS = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];

/* avatar circle */
function AvatarCircle({ emoji }) {
  return <div className="profileAvatar">{emoji || "🧒"}</div>;
}

/* info row */
function InfoRow({ icon, label, value }) {
  return (
    <div className="profileInfoRow">
      <div className="profileInfoLeft">
        <span className="profileInfoIcon">{icon}</span>
        <span className="profileInfoLabel">{label}</span>
      </div>
      <div className="profileInfoValue">{value || "-"}</div>
    </div>
  );
}

function normalizeYear(value) {
  const v = String(value ?? "").trim();
  if (!v) return ""; // keep empty as empty
  // if user typed only digits -> save as number (helps with rules/type checks)
  if (/^\d+$/.test(v)) return Number(v);
  return v; // allow non-number year labels if you want
}

export default function ProfilePage() {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const editRef = useRef(null);

  /* form fields */
  const [formEmoji, setFormEmoji] = useState(EMOJI_OPTIONS[0]);
  const [formStudentName, setFormStudentName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formParentName, setFormParentName] = useState("");
  const [formParentEmail, setFormParentEmail] = useState("");
  const [formYear, setFormYear] = useState("");

  /* support multiple possible name fields */
  function getStudentName(stu) {
    return stu?.studentName || stu?.fullName || stu?.name || "Unnamed";
  }

  /* realtime fetch students */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setStudents(list);

        setSelectedId((prev) => {
          if (prev) return prev;
          return list[0]?.id || "";
        });
      },
      (err) => {
        console.error("onSnapshot(students) error:", err);
        setFormError(err?.message || "Failed to load students.");
      }
    );

    return () => unsub();
  }, []);

  /* selected student */
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedId) || null;
  }, [students, selectedId]);

  /* fill form */
  function fillForm(stu) {
    setFormEmoji(stu?.avatarEmoji || EMOJI_OPTIONS[0]);
    setFormStudentName(getStudentName(stu));
    setFormPhone(stu?.phone || "");
    setFormAddress(stu?.address || "");
    setFormParentName(stu?.parentName || "");
    setFormParentEmail(stu?.parentEmail || "");
    setFormYear(stu?.year ?? ""); // keep original type; input will show it as string anyway
  }

  function onSelectStudent(id) {
    setSelectedId(id);
    setFormError("");

    if (isEditOpen) {
      const nextStudent = students.find((s) => s.id === id) || null;
      fillForm(nextStudent);
    }
  }

  function openEdit() {
    if (!selectedStudent) return;
    fillForm(selectedStudent);
    setFormError("");
    setIsEditOpen(true);
  }

  function closeEdit() {
    setIsEditOpen(false);
    setFormError("");
  }

  async function onSaveProfile(e) {
    e.preventDefault();
    if (!selectedStudent) return;
    if (isSaving) return;

    const studentName = formStudentName.trim();
    const parentEmail = formParentEmail.trim();

    if (!studentName || !parentEmail) {
      setFormError("Student Name and Parent Email are required.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      // Helpful debug
      console.log("Saving student:", selectedStudent.id);
      console.log("Auth user:", auth.currentUser?.uid, auth.currentUser?.email);

      const payload = {
        avatarEmoji: formEmoji,
        studentName,
        phone: formPhone.trim(),
        address: formAddress.trim(),
        parentName: formParentName.trim(),
        parentEmail,
        year: normalizeYear(formYear),
      };

      await updateDoc(doc(db, "students", selectedStudent.id), payload);

      setIsEditOpen(false);
      setFormError("");
    } catch (err) {
      console.error("updateDoc(students) error:", err);

      // Show real reason (permission-denied / unavailable / etc.)
      const code = err?.code ? `(${err.code}) ` : "";
      const msg = err?.message || "Failed to update profile.";
      setFormError(`${code}${msg}`);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    if (!isEditOpen) return;
    if (!editRef.current) return;
    editRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [isEditOpen]);

  return (
    <div className="profileWrap">
      {/* left list */}
      <div className="profileListCard">
        <div className="profileListTitle">Students</div>

        {students.length === 0 ? (
          <div className="emptyState">No students found.</div>
        ) : (
          students.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`profileRowBtn ${s.id === selectedId ? "active" : ""}`}
              onClick={() => onSelectStudent(s.id)}
            >
              <AvatarCircle emoji={s.avatarEmoji} />
              <span className="profileRowName">{getStudentName(s)}</span>
              <ChevronRight size={16} />
            </button>
          ))
        )}
      </div>

      {/* right detail */}
      {selectedStudent && (
        <div className="profileDetailCard">
          <div className="profileHeader">
            <div className="profileHeaderLeft">
              <AvatarCircle emoji={selectedStudent.avatarEmoji} />
              <div className="profileHeaderText">
                <div className="profileHeaderName">{getStudentName(selectedStudent)}</div>
                <div className="profileHeaderEmail">{selectedStudent.parentEmail || "-"}</div>
              </div>
            </div>
          </div>

          <InfoRow icon={<Phone size={16} />} label="Phone" value={selectedStudent.phone} />
          <InfoRow icon={<MapPin size={16} />} label="Address" value={selectedStudent.address} />
          <InfoRow icon={<User size={16} />} label="Parent" value={selectedStudent.parentName} />
          <InfoRow icon={<Mail size={16} />} label="Parent Email" value={selectedStudent.parentEmail} />
          <InfoRow icon={<CheckCircle2 size={16} />} label="Class" value={selectedStudent.year} />

          {!isEditOpen && (
            <button type="button" className="btnOutlinePrimary" onClick={openEdit}>
              Edit Profile
            </button>
          )}

          {isEditOpen && (
            <div ref={editRef} className="profileEditCard">
              <h3 className="modalTitle">Edit Profile</h3>

              {formError && <div className="modalError">{formError}</div>}

              <form className="modalForm" onSubmit={onSaveProfile}>
                <label className="modalLabel">
                  Profile Emoji
                  <select
                    className="modalInput"
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
                  Student Name
                  <input
                    className="modalInput"
                    value={formStudentName}
                    onChange={(e) => setFormStudentName(e.target.value)}
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
                    value={String(formYear ?? "")}
                    onChange={(e) => setFormYear(e.target.value)}
                  />
                </label>

                <div className="modalActions">
                  <button type="button" className="btnOutlinePrimary" onClick={closeEdit}>
                    Cancel
                  </button>

                  <button type="submit" className="btnPrimary" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}