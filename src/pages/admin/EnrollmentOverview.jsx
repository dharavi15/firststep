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
const STATUS_FILTERS = ["all", "pending", "completed"];
const PAGE_SIZE = 6;

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

function getInitials(name) {
  const s = String(name || "").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function statusPillClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "statusPill ok";
  if (s === "pending") return "statusPill warn";
  return "statusPill neutral";
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

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

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

  const filteredItems = useMemo(() => {
    const q = String(searchTerm || "").trim().toLowerCase();

    return sortedItems.filter((row) => {
      const status = String(row.overallStatus || "pending").toLowerCase();

      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!q) return true;

      const name = String(row.studentName || "").toLowerCase();
      const parent = String(row.parentName || "").toLowerCase();
      const email = String(row.parentEmail || "").toLowerCase();
      const year = String(row.year ?? "").toLowerCase();

      return (
        name.includes(q) ||
        parent.includes(q) ||
        email.includes(q) ||
        year.includes(q) ||
        status.includes(q)
      );
    });
  }, [sortedItems, statusFilter, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, safePage]);

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

  const askDelete = (id) => {
    setDeleteId(id);
    setEditId("");
    setShowAdd(false);
  };

  const cancelDelete = () => {
    setDeleteId("");
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
      <div className="eoInlineForm">
        <div className="eoInlineHead">
          <div className="eoInlineTitle">Add Student</div>
          <div className="eoInlineSub">Fill the fields and save</div>
        </div>

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
            className="btnPrimary"
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
      <div className="eoInlineForm">
        <div className="eoInlineHead">
          <div className="eoInlineTitle">Edit Student</div>
          <div className="eoInlineSub">Update fields and save</div>
        </div>

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
            onChange={(e) => setEditForm((p) => ({ ...p, year: e.target.value }))}
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
            className="btnPrimary"
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
      <div className="eoDeleteBox">
        <div className="eoInlineHead">
          <div className="eoInlineTitle">Delete Student</div>
          <div className="eoInlineSub">Are you sure you want to delete this student?</div>
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
            className="btnPrimary"
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
    <div className="checklistWrap eoWrap">
      <div className="eoTopRow">
        <div className="eoTopLeft">
          <div className="eventDetailTitle">Students Overview</div>
          <div className="eventDetailDesc">List of enrolled students</div>
        </div>

        {isAdmin ? (
          <button type="button" className="eoBtnAdd" onClick={openAdd}>
            Add Student
          </button>
        ) : null}
      </div>

      <div className="eoControls">
        <div className="eoStatusGroup">
          <div className="eoStatusLabel">Status :</div>
          <div className="eoTabs">
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={active ? "eoTab eoTabActive" : "eoTab"}
                  onClick={() => setStatusFilter(s)}
                >
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="eoSearch">
          <span className="eoSearchIcon">🔍</span>
          <input
            className="searchInput"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search"
          />
        </div>
      </div>

      {!schoolId ? <div className="emptyState">No schoolId found for this user</div> : null}
      {schoolId && !canLoad ? <div className="emptyState">No parent email found for this user</div> : null}
      {schoolId && canLoad && loading ? <div className="emptyState">Loading students</div> : null}
      {schoolId && canLoad && !loading && error ? <div className="emptyState">{error}</div> : null}

      {schoolId && canLoad && !loading && !error ? (
        <div className="tableCard eoTableCard">
          <div className="eoTableHeader">
            <div className="eoTh eoThNo">No</div>
            <div className="eoTh">Student Name</div>
            <div className="eoTh">Parent Name</div>
            <div className="eoTh">Class</div>
            <div className="eoTh">Status</div>
          </div>

          <div className="tableBody eoTableBody">
            {pageItems.length === 0 ? (
              <div className="emptyState">No students found</div>
            ) : (
              pageItems.map((row, idx) => {
                const statusText = String(row.overallStatus || "pending").toLowerCase();
                const yearText =
                  typeof row.year === "number" || String(row.year || "").trim()
                    ? `Year ${row.year}`
                    : "-";

                const no = (safePage - 1) * PAGE_SIZE + idx + 1;

                return (
                  <div key={row.id} className="eoRow">
                    <div className="eoTd eoTdNo">
                      <div className="eoNoBadge">{no}</div>
                    </div>

                    <div className="eoTd eoStudentCell">
                      <div className="studentAvatar">{getInitials(row.studentName)}</div>

                      <div className="eoStudentText">
                        <div className="studentName">{row.studentName || "No name"}</div>

                        {isAdmin ? (
                          <div className="eoRowActions">
                            <button type="button" className="linkBtn" onClick={() => startEdit(row)}>
                              Edit
                            </button>
                            <button type="button" className="linkBtn" onClick={() => askDelete(row.id)}>
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="eoTd">{row.parentName || "-"}</div>
                    <div className="eoTd">{yearText}</div>

                    <div className="eoTd">
                      <span className={statusPillClass(statusText)}>
                        {statusText[0].toUpperCase() + statusText.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="tableFooter eoFooter">
            <div className="eoPageText">
              Page : {safePage} of {totalPages}
            </div>

            <div className="pageBtns">
              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Prev page"
              >
                ‹
              </button>

              <button
                type="button"
                className="pageBtn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {renderAddForm()}
      {renderEditFormInline()}
      {renderDeleteConfirmInline()}
    </div>
  );
}