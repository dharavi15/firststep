import { useEffect, useMemo, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import {
  addStudentForAdmin,
  deleteStudentForAdmin,
  getStudentsForAdmin,
  getStudentsForParent,
  updateStudentForAdmin,
} from "../../services/studentService";

const STATUS_OPTIONS = ["pending", "completed"];

function emptyForm() {
  return {
    studentName: "",
    year: "",
    parentName: "",
    parentEmail: "",
    overallStatus: "pending",
  };
}

function validateForm(values) {
  const errs = {};

  const name = String(values.studentName || "").trim();
  const yearNum = Number(values.year);
  const pName = String(values.parentName || "").trim();
  const pEmail = String(values.parentEmail || "").trim();

  if (!name) errs.studentName = "Required";
  if (!Number.isFinite(yearNum) || yearNum <= 0) errs.year = "Use a number";
  if (!pName) errs.parentName = "Required";
  if (!pEmail) errs.parentEmail = "Required";

  return errs;
}

export default function EnrollmentOverview() {
  const user = useAuthStore((s) => s.user);

  const isAdmin =
    user?.role === "admin" ||
    user?.userRole === "admin" ||
    user?.type === "admin" ||
    user?.email === "admin@test.com";

  const schoolId = user?.schoolId || "";
  const parentEmail = user?.email || user?.parentEmail || "";

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm());
  const [addErrors, setAddErrors] = useState({});
  const [savingAdd, setSavingAdd] = useState(false);

  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState(emptyForm());
  const [editErrors, setEditErrors] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteId, setDeleteId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canLoad = Boolean(schoolId) && (isAdmin || Boolean(parentEmail));

  const loadStudents = async () => {
    if (!canLoad) return;

    setLoading(true);
    setError("");

    try {
      const rows = isAdmin
        ? await getStudentsForAdmin({ schoolId })
        : await getStudentsForParent({ schoolId, parentEmail });

      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, isAdmin, parentEmail]);

  const sortedItems = useMemo(() => {
    const copy = Array.isArray(items) ? [...items] : [];
    copy.sort((a, b) =>
      String(a.studentName || "").localeCompare(String(b.studentName || ""))
    );
    return copy;
  }, [items]);

  const openAdd = () => {
    setShowAdd(true);
    setAddForm(emptyForm());
    setAddErrors({});
    setEditId("");
    setDeleteId("");
  };

  const closeAdd = () => {
    setShowAdd(false);
    setAddForm(emptyForm());
    setAddErrors({});
  };

  const startEdit = (row) => {
    setEditId(row.id);
    setDeleteId("");
    setShowAdd(false);

    setEditForm({
      studentName: row.studentName || "",
      year: row.year ?? "",
      parentName: row.parentName || "",
      parentEmail: row.parentEmail || "",
      overallStatus: row.overallStatus || "pending",
    });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditId("");
    setEditForm(emptyForm());
    setEditErrors({});
  };

  const onSaveAdd = async () => {
    const errs = validateForm(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length) return;

    if (!schoolId) {
      setError("No schoolId found for this user");
      return;
    }

    setSavingAdd(true);
    setError("");

    try {
      await addStudentForAdmin({
        schoolId,
        studentName: addForm.studentName,
        year: addForm.year,
        parentName: addForm.parentName,
        parentEmail: addForm.parentEmail,
        overallStatus: addForm.overallStatus,
      });

      closeAdd();
      await loadStudents();
    } catch (e) {
      setError(e?.message || "Cannot add student");
    } finally {
      setSavingAdd(false);
    }
  };

  const onSaveEdit = async () => {
    const errs = validateForm(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length) return;

    if (!editId) return;

    setSavingEdit(true);
    setError("");

    try {
      await updateStudentForAdmin(editId, {
        studentName: editForm.studentName,
        year: editForm.year,
        parentName: editForm.parentName,
        parentEmail: editForm.parentEmail,
        overallStatus: editForm.overallStatus,
      });

      cancelEdit();
      await loadStudents();
    } catch (e) {
      setError(e?.message || "Cannot update student");
    } finally {
      setSavingEdit(false);
    }
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setEditId("");
    setShowAdd(false);
  };

  const cancelDelete = () => {
    setDeleteId("");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    setError("");

    try {
      await deleteStudentForAdmin(deleteId);
      setDeleteId("");
      await loadStudents();
    } catch (e) {
      setError(e?.message || "Cannot delete student");
    } finally {
      setDeleting(false);
    }
  };

  const renderAddForm = () => {
    if (!isAdmin || !showAdd) return null;

    return (
      <div className="modalForm modalFormSpaced" style={{ marginTop: 12 }}>
        <div className="eventDetailTitle" style={{ fontSize: 16 }}>
          Add Student
        </div>
        <div className="eventDetailDesc">Fill the fields and save</div>

        <label className="modalLabel">
          Student Name
          <input
            className="modalInput"
            value={addForm.studentName}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, studentName: e.target.value }))
            }
            placeholder="Student Name"
          />
          {addErrors.studentName ? (
            <div className="uiError">{addErrors.studentName}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Year
          <input
            className="modalInput"
            value={addForm.year}
            onChange={(e) => setAddForm((p) => ({ ...p, year: e.target.value }))}
            placeholder="1 - 12"
            inputMode="numeric"
          />
          {addErrors.year ? <div className="uiError">{addErrors.year}</div> : null}
        </label>

        <label className="modalLabel">
          Parent Name
          <input
            className="modalInput"
            value={addForm.parentName}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, parentName: e.target.value }))
            }
            placeholder="Parent Name"
          />
          {addErrors.parentName ? (
            <div className="uiError">{addErrors.parentName}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Parent Email
          <input
            className="modalInput"
            value={addForm.parentEmail}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, parentEmail: e.target.value }))
            }
            placeholder="parent@email.com"
          />
          {addErrors.parentEmail ? (
            <div className="uiError">{addErrors.parentEmail}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Status
          <select
            className="modalInput"
            value={addForm.overallStatus}
            onChange={(e) =>
              setAddForm((p) => ({ ...p, overallStatus: e.target.value }))
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="modalActions">
          <button
            type="button"
            className="btnOutlinePrimary"
            onClick={closeAdd}
            disabled={savingAdd}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btnPrimary btnPrimaryAuto"
            onClick={onSaveAdd}
            disabled={savingAdd}
          >
            {savingAdd ? "Saving..." : "Save Student"}
          </button>
        </div>
      </div>
    );
  };

  const renderEditFormInline = () => {
    if (!isAdmin || !editId) return null;

    return (
      <div className="modalForm modalFormSpaced" style={{ marginTop: 12 }}>
        <div className="eventDetailTitle" style={{ fontSize: 16 }}>
          Edit Student
        </div>
        <div className="eventDetailDesc">Update fields and save</div>

        <label className="modalLabel">
          Student Name
          <input
            className="modalInput"
            value={editForm.studentName}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, studentName: e.target.value }))
            }
            placeholder="Student Name"
          />
          {editErrors.studentName ? (
            <div className="uiError">{editErrors.studentName}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Year
          <input
            className="modalInput"
            value={editForm.year}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, year: e.target.value }))
            }
            placeholder="1 - 12"
            inputMode="numeric"
          />
          {editErrors.year ? <div className="uiError">{editErrors.year}</div> : null}
        </label>

        <label className="modalLabel">
          Parent Name
          <input
            className="modalInput"
            value={editForm.parentName}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, parentName: e.target.value }))
            }
            placeholder="Parent Name"
          />
          {editErrors.parentName ? (
            <div className="uiError">{editErrors.parentName}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Parent Email
          <input
            className="modalInput"
            value={editForm.parentEmail}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, parentEmail: e.target.value }))
            }
            placeholder="parent@email.com"
          />
          {editErrors.parentEmail ? (
            <div className="uiError">{editErrors.parentEmail}</div>
          ) : null}
        </label>

        <label className="modalLabel">
          Status
          <select
            className="modalInput"
            value={editForm.overallStatus}
            onChange={(e) =>
              setEditForm((p) => ({ ...p, overallStatus: e.target.value }))
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="modalActions">
          <button
            type="button"
            className="btnOutlinePrimary"
            onClick={cancelEdit}
            disabled={savingEdit}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btnPrimary btnPrimaryAuto"
            onClick={onSaveEdit}
            disabled={savingEdit}
          >
            {savingEdit ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmInline = () => {
    if (!isAdmin || !deleteId) return null;

    return (
      <div className="eventDetailBlock" style={{ marginTop: 12 }}>
        <div className="eventDetailTitle" style={{ fontSize: 16 }}>
          Delete Student
        </div>
        <div className="eventDetailDesc">
          Are you sure you want to delete this student?
        </div>

        <div className="modalActions">
          <button
            type="button"
            className="btnOutlinePrimary"
            onClick={cancelDelete}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btnPrimary btnPrimaryAuto"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="eventDetailBlock">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div className="eventDetailTitle">Students Overview</div>
          <div className="eventDetailDesc">This list is loaded from Firestore</div>
        </div>

        {isAdmin ? (
          <button type="button" className="btnPrimary btnPrimaryAuto" onClick={openAdd}>
            Add Student
          </button>
        ) : null}
      </div>

      {!schoolId ? <div className="emptyState">No schoolId found for this user</div> : null}
      {schoolId && !canLoad ? (
        <div className="emptyState">No parent email found for this user</div>
      ) : null}

      {schoolId && canLoad && loading ? <div className="emptyState">Loading students</div> : null}
      {schoolId && canLoad && !loading && error ? <div className="emptyState">{error}</div> : null}

      {schoolId && canLoad && !loading && !error && sortedItems.length === 0 ? (
        <div className="emptyState">No students found</div>
      ) : null}

      {schoolId && canLoad && !loading && !error && sortedItems.length > 0 ? (
        <div className="tableBody tableBodySpaced" style={{ marginTop: 10 }}>
          {sortedItems.map((row) => {
            const yearText = typeof row.year === "number" ? `Year ${row.year}` : "No year";
            const statusText = row.overallStatus || "pending";

            return (
              <div key={row.id} className="profileInfoRow">
                <div className="profileInfoLeft">
                  <span className="profileInfoLabel">{row.studentName || "No name"}</span>

                  {isAdmin ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button type="button" className="linkBtn" onClick={() => startEdit(row)}>
                        Edit
                      </button>
                      <button type="button" className="linkBtn" onClick={() => askDelete(row.id)}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="profileInfoValue">
                  <span className="studentMeta">{yearText}</span>
                  <span className="studentMeta">{statusText}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {renderAddForm()}
      {renderEditFormInline()}
      {renderDeleteConfirmInline()}
    </div>
  );
}