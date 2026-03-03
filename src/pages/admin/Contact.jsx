import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import LogoImg from "../../assets/img_-_logo.jpg";

export default function Contact() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const schoolPhone = "(123) 456-7890";
  const schoolEmail = "info@firststep-school.com";
  const schoolAddress = "123 School St,\nHometown, CA 91001";

  useEffect(() => {
    let alive = true;

    async function loadStudents() {
      try {
        setLoading(true);
        setErr("");

        // simple + safe (no orderBy = no index problem)
        const snap = await getDocs(collection(db, "students"));

        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        if (!alive) return;
        setStudents(rows);
      } catch {
        if (!alive) return;
        setErr("Failed to load students from Firestore.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      alive = false;
    };
  }, []);

  const sortedStudents = useMemo(() => {
    const copy = [...students];
    copy.sort((a, b) =>
      String(a.studentName || "").localeCompare(
        String(b.studentName || "")
      )
    );
    return copy;
  }, [students]);

  return (
    <div className="pagePad">
      <div className="eventDetailBlock contactWrap">
        {/* Hero */}
        <div className="contactHeroCard">
          <img className="contactLogo" src={LogoImg} alt="First Step logo" />

          <div className="contactHeroText">
            <div className="contactHeroTitle">We&apos;re here to help!</div>
            <div className="contactHeroDesc">
              Please reach out if you have any questions or need assistance.
            </div>
          </div>
        </div>

        {/* School Contact */}
        <div className="contactList">
          <div className="contactRow">
            <span className="contactIcon">☎</span>
            <span className="contactValue">{schoolPhone}</span>
          </div>

          <div className="contactRow">
            <span className="contactIcon">✉</span>
            <span className="contactValue">{schoolEmail}</span>
          </div>

          <div className="contactRow">
            <span className="contactIcon">⌖</span>
            <span
              className="contactValue"
              style={{ whiteSpace: "pre-line" }}
            >
              {schoolAddress}
            </span>
          </div>
        </div>

        {/* Student Contacts */}
        <div className="contactSection">
          <div className="contactSectionTitle">Student Contacts</div>

          {loading && (
            <div className="contactHint">Loading students...</div>
          )}

          {!loading && err && (
            <div className="contactError">{err}</div>
          )}

          {!loading && !err && sortedStudents.length === 0 && (
            <div className="contactHint">No students found.</div>
          )}

          {!loading && !err && sortedStudents.length > 0 && (
            <div className="studentContactGrid">
              {sortedStudents.map((s) => (
                <div className="studentContactCard" key={s.id}>
                  <div className="studentContactTop">
                    <div className="studentEmoji">
                      {s.avatarEmoji || "🧒"}
                    </div>

                    <div>
                      <div className="studentName">
                        {s.studentName || "-"}
                      </div>
                      <div className="studentSub">
                        Parent: {s.parentName || "-"} • Year{" "}
                        {s.year ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div className="studentContactRows">
                    <div className="studentRow">
                      <span>✉</span>
                      <span>{s.parentEmail || "-"}</span>
                    </div>

                    <div className="studentRow">
                      <span>☎</span>
                      <span>{s.phone || "-"}</span>
                    </div>

                    <div className="studentRow">
                      <span>⌖</span>
                      <span>{s.address || "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}