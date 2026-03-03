import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import LogoImg from "../../assets/img_-_logo.jpg";

export default function Contact() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // edit modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    parentEmail: "",
    phone: "",
    address: "",
    year: "",
    avatarEmoji: "",
  });

  // School contact (static)
  const schoolPhone = "(123) 456-7890";
  const schoolEmail = "info@firststep-school.com";
  const schoolAddress = "123 School St,\nHometown, CA 91001";

  async function loadStudents() {
    try {
      setLoading(true);
      setErr("");

      const snap = await getDocs(collection(db, "students"));
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(rows);
    } catch {
      setErr("Failed to load students from Firestore.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const sortedStudents = useMemo(() => {
    const copy = [...students];
    copy.sort((a, b) =>
      String(a.studentName || "").localeCompare(String(b.studentName || ""))
    );
    return copy;
  }, [students]);

  function openEditModal(student) {
    setEditId(student.id);
    setForm({
      studentName: student.studentName || "",
      parentName: student.parentName || "",
      parentEmail: student.parentEmail || "",
      phone: student.phone || "",
      address: student.address || "",
      year: student.year ?? "",
      avatarEmoji: student.avatarEmoji || "",
    });
    setOpenEdit(true);
  }

  function closeEditModal() {
    if (saving) return;
    setOpenEdit(false);
    setEditId("");
  }

  function onChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveEdit() {
    if (!editId) return;

    // simple validation
    if (!String(form.studentName).trim()) {
      alert("Student name is required");
      return;
    }
    if (!String(form.parentEmail).trim()) {
      alert("Parent email is required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        studentName: String(form.studentName).trim(),
        parentName: String(form.parentName).trim(),
        parentEmail: String(form.parentEmail).trim(),
        phone: String(form.phone).trim(),
        address: String(form.address).trim(),
        avatarEmoji: String(form.avatarEmoji).trim(),
      };

      // year: keep as number if possible
      const yearNum = Number(form.year);
      if (String(form.year).trim() === "") {
        payload.year = "";
      } else if (!Number.isNaN(yearNum)) {
        payload.year = yearNum;
      } else {
        payload.year = form.year;
      }

      await updateDoc(doc(db, "students", editId), payload);

      // refresh list
      await loadStudents();
      setOpenEdit(false);
      setEditId("");
    } catch {
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pagePad">
      <div className="eventDetailBlock contactWrap">
        {/* contact - school */}
        <div className="contactHeroCard">
          <img className="contactLogo" src={LogoImg} alt="First Step logo" />

          <div className="contactHeroText">
            <div className="contactHeroTitle">We&apos;re here to help!</div>

            <div className="contactHeroMiniList">
              <div className="contactMiniRow">
                <span className="contactMiniIcon">☎</span>
                <span className="contactMiniValue">{schoolPhone}</span>
              </div>

              <div className="contactMiniRow">
                <span className="contactMiniIcon">✉</span>
                <span className="contactMiniValue">{schoolEmail}</span>
              </div>

              <div className="contactMiniRow">
                <span className="contactMiniIcon">⌖</span>
                <span className="contactMiniValue" style={{ whiteSpace: "pre-line" }}>
                  {schoolAddress}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Contacts */}
        <div className="contactSection">
          <div className="contactSectionTitle">Student Contacts</div>

          {loading && <div className="contactHint">Loading students...</div>}
          {!loading && err && <div className="contactError">{err}</div>}
          {!loading && !err && sortedStudents.length === 0 && (
            <div className="contactHint">No students found.</div>
          )}

          {!loading && !err && sortedStudents.length > 0 && (
            <div className="studentContactGrid">
              {sortedStudents.map((s) => (
                <div className="studentContactCard" key={s.id}>
                  <div className="studentContactTop">
                    <div className="studentEmoji">{s.avatarEmoji || "🧒"}</div>

                    <div className="studentMeta">
                      <div className="studentName">{s.studentName || "-"}</div>
                      <div className="studentSub">
                        Parent: {s.parentName || "-"} • Year {s.year ?? "-"}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="studentEditBtn"
                      onClick={() => openEditModal(s)}
                    >
                      Edit
                    </button>
                  </div>

                  <div className="studentContactRows">
                    <div className="studentRow">
                      <span className="studentRowIcon">✉</span>
                      <span className="studentRowValue">{s.parentEmail || "-"}</span>
                    </div>

                    <div className="studentRow">
                      <span className="studentRowIcon">☎</span>
                      <span className="studentRowValue">{s.phone || "-"}</span>
                    </div>

                    <div className="studentRow">
                      <span className="studentRowIcon">⌖</span>
                      <span className="studentRowValue">{s.address || "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {openEdit && (
          <div className="modalOverlay" onMouseDown={closeEditModal} role="presentation">
            <div
              className="modalCard"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="modalHeader">
                <div className="modalTitle">Edit Student</div>
                <button
                  type="button"
                  className="modalCloseBtn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  ✕
                </button>
              </div>

              <div className="modalBody">
                <div className="modalGrid">
                  <label className="modalField">
                    <span className="modalLabel">Student Name *</span>
                    <input
                      className="modalInput"
                      value={form.studentName}
                      onChange={(e) => onChange("studentName", e.target.value)}
                      placeholder="Student name"
                    />
                  </label>

                  <label className="modalField">
                    <span className="modalLabel">Year</span>
                    <input
                      className="modalInput"
                      value={form.year}
                      onChange={(e) => onChange("year", e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </label>

                  <label className="modalField">
                    <span className="modalLabel">Parent Name</span>
                    <input
                      className="modalInput"
                      value={form.parentName}
                      onChange={(e) => onChange("parentName", e.target.value)}
                      placeholder="Parent name"
                    />
                  </label>

                  <label className="modalField">
                    <span className="modalLabel">Parent Email *</span>
                    <input
                      className="modalInput"
                      value={form.parentEmail}
                      onChange={(e) => onChange("parentEmail", e.target.value)}
                      placeholder="parent@email.com"
                    />
                  </label>

                  <label className="modalField">
                    <span className="modalLabel">Phone</span>
                    <input
                      className="modalInput"
                      value={form.phone}
                      onChange={(e) => onChange("phone", e.target.value)}
                      placeholder="Phone"
                    />
                  </label>

                  <label className="modalField">
                    <span className="modalLabel">Avatar Emoji</span>
                    <input
                      className="modalInput"
                      value={form.avatarEmoji}
                      onChange={(e) => onChange("avatarEmoji", e.target.value)}
                      placeholder="👧 👦 🧒"
                    />
                  </label>

                  <label className="modalField modalFieldFull">
                    <span className="modalLabel">Address</span>
                    <input
                      className="modalInput"
                      value={form.address}
                      onChange={(e) => onChange("address", e.target.value)}
                      placeholder="Address"
                    />
                  </label>
                </div>
              </div>

              <div className="modalFooter">
                <button
                  type="button"
                  className="modalBtn ghost"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="modalBtn primary"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}