import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import "../../styles/main.css";

function formatTHB(v) {
  const n = Number(v || 0);
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(n);
}

function computeStatus(due, paid) {
  const d = Number(due || 0);
  const p = Number(paid || 0);
  return p >= d ? "paid" : "pending";
}

function normalizeDateKey(value) {
  // Accept: "YYYY-MM-DD" or "DD/MM/YYYY" or empty
  const s = String(value || "").trim();
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY -> YYYY-MM-DD
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = m[1];
    const mm = m[2];
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return s;
}

export default function PaymentsOverview() {
  const [rows, setRows] = useState([]);

  // which student row is expanded
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // edit mode for the expanded row
  const [isEditing, setIsEditing] = useState(false);

  // form fields for expanded row
  const [form, setForm] = useState({
    totalDue: "",
    totalPaid: "",
    dueDate: "",
  });

  const selectedRow = useMemo(() => {
    return rows.find((r) => r.studentId === selectedStudentId) || null;
  }, [rows, selectedStudentId]);

  const loadAll = useCallback(async () => {
    const studentsSnap = await getDocs(collection(db, "students"));
    const students = studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const merged = await Promise.all(
      students.map(async (s) => {
        const paySnap = await getDoc(doc(db, "payments", s.id));
        const pay = paySnap.exists() ? paySnap.data() : null;

        const totalDue = Number(pay?.totalDue || 0);
        const totalPaid = Number(pay?.totalPaid || 0);
        const outstanding = Math.max(0, totalDue - totalPaid);
        const status = pay?.status || computeStatus(totalDue, totalPaid);

        return {
          studentId: s.id,
          studentName: s.studentName || "-",
          year: s.year || "-",
          parentName: s.parentName || "-",
          parentEmail: s.parentEmail || "-",
          totalDue,
          totalPaid,
          outstanding,
          status,
          dueDate: pay?.dueDate || "",
          hasPayment: !!pay,
        };
      })
    );

    setRows(merged);
  }, []);

  useEffect(() => {
    (async () => {
      await loadAll();
    })();
  }, [loadAll]);

  const toggleDetail = (id) => {
    // click same row -> close
    if (selectedStudentId === id) {
      setSelectedStudentId("");
      setIsEditing(false);
      return;
    }

    // open new row
    setSelectedStudentId(id);
    setIsEditing(false);

    const r = rows.find((x) => x.studentId === id);
    if (!r) return;

    setForm({
      totalDue: String(r.totalDue ?? ""),
      totalPaid: String(r.totalPaid ?? ""),
      dueDate: String(r.dueDate ?? ""),
    });
  };

  const closeDetail = () => {
    setSelectedStudentId("");
    setIsEditing(false);
  };

  const savePayment = async () => {
    if (!selectedRow) return;

    const totalDue = Number(form.totalDue || 0);
    const totalPaid = Number(form.totalPaid || 0);
    const status = computeStatus(totalDue, totalPaid);
    const dueDate = normalizeDateKey(form.dueDate);

    await setDoc(doc(db, "payments", selectedRow.studentId), {
      studentId: selectedRow.studentId,
      studentName: selectedRow.studentName,
      year: selectedRow.year,
      parentName: selectedRow.parentName,
      parentEmail: selectedRow.parentEmail,
      currency: "THB",
      totalDue,
      totalPaid,
      status,
      dueDate,
      updatedAt: serverTimestamp(),
    });

    setIsEditing(false);
    await loadAll();
  };

  const removePayment = async () => {
    if (!selectedRow) return;
    await deleteDoc(doc(db, "payments", selectedRow.studentId));
    closeDetail();
    await loadAll();
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Payments Overview</h2>

      <div className="card payments-card payments-wide">
        <div className="payments-table-head">
          <div className="payments-col-student">Student</div>
          <div className="payments-col-year">Year</div>
          <div className="payments-col-status">Status</div>
          <div className="payments-col-outstanding">Outstanding</div>
        </div>

        {rows.length === 0 ? (
          <div className="empty-state">No data yet</div>
        ) : (
          rows.map((r) => {
            const isOpen = selectedStudentId === r.studentId;

            return (
              <div key={r.studentId} className="paymentsRowWrap">
                <div className="payments-row">
                  <button
                    type="button"
                    className="payments-student-link"
                    onClick={() => toggleDetail(r.studentId)}
                    title="Open payment detail"
                  >
                    {r.studentName}
                  </button>

                  <div className="payments-year">Year {r.year}</div>

                  <div className="payments-status">
                    <span className={`status-badge ${r.status}`}>{r.status}</span>
                  </div>

                  <div className="payments-outstanding">{formatTHB(r.outstanding)}</div>
                </div>

                {isOpen && selectedRow && (
                  <div className="payments-inline-detail">
                    <div className="payments-detail-top">
                      <div className="payments-detail-left">
                        <h3 className="detail-title">{selectedRow.studentName}</h3>
                        <div className="detail-sub">
                          Parent: {selectedRow.parentName} ({selectedRow.parentEmail})
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={closeDetail}
                      >
                        Close
                      </button>
                    </div>

                    <div className="payments-detail-grid">
                      <div className="detail-box">
                        <div className="detail-label">Year</div>
                        <div className="detail-value">{selectedRow.year}</div>
                      </div>

                      <div className="detail-box">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <span className={`status-badge ${selectedRow.status}`}>
                            {selectedRow.status}
                          </span>
                        </div>
                      </div>

                      <div className="detail-box">
                        <div className="detail-label">Outstanding</div>
                        <div className="detail-value">
                          {formatTHB(selectedRow.outstanding)}
                        </div>
                      </div>

                      <div className="detail-box">
                        <div className="detail-label">Total Due</div>
                        <div className="detail-value">{formatTHB(selectedRow.totalDue)}</div>
                      </div>

                      <div className="detail-box">
                        <div className="detail-label">Total Paid</div>
                        <div className="detail-value">{formatTHB(selectedRow.totalPaid)}</div>
                      </div>
                    </div>

                    <div className="payments-form-grid">
                      <div className="form-field">
                        <label className="form-label">Total Due</label>
                        <input
                          className="text-input"
                          value={form.totalDue}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, totalDue: e.target.value })}
                          placeholder="Total Due"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="form-field">
                        <label className="form-label">Total Paid</label>
                        <input
                          className="text-input"
                          value={form.totalPaid}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, totalPaid: e.target.value })}
                          placeholder="Total Paid"
                          inputMode="numeric"
                        />
                      </div>

                      <div className="form-field paymentsDueDateField">
                        <label className="form-label">Due Date</label>
                        <input
                          className="text-input"
                          value={form.dueDate}
                          disabled={!isEditing}
                          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                          placeholder="YYYY-MM-DD (or DD/MM/YYYY)"
                        />
                      </div>
                    </div>

                    <div className="button-row">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => setIsEditing(true)}
                          >
                            {selectedRow.hasPayment ? "Edit" : "Add"}
                          </button>

                          <button
                            type="button"
                            className="btn-danger"
                            onClick={removePayment}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>

                          <button type="button" className="primary-btn" onClick={savePayment}>
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}