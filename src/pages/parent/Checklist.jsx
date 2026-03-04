/*import { useMemo, useState } from "react";
import ParentTopBar from "../../components/navigation/ParentTopBar";
import ParentBottomNav from "../../components/navigation/ParentBottomNav";

const STUDENT = {
  fullName: "Ethan Parker",
  year: "Year 1",
  parentName: "Daniel Parker",
  parentEmail: "daniel@gmail.com",
};

const STEPS = [
  { no: 1, title: "Awaiting Payment", statusText: "Completed", tone: "ok", dueLeft: "Due 25 Feb", dueDate: "25 Feb" },
  { no: 2, title: "Fill Health Form", statusText: "Completed", tone: "ok", dueLeft: "Due 25 Feb", dueDate: "25 Feb" },
  { no: 3, title: "Pay Tuition and Fees", statusText: "Pending (2 days left)", tone: "warn", dueLeft: "Due 25 Feb", dueDate: "25 Feb" },
  { no: 4, title: "Attend Orientation", statusText: "Upcoming", tone: "upcoming", dueLeft: "April 30", dueDate: "April 30" },
  { no: 5, title: "Upload Proof of Payment", statusText: "Upcoming", tone: "upcoming", dueLeft: "Upcoming", dueDate: "Upcoming" },
];

function getPercent(steps) {
  const done = steps.filter((s) => s.tone === "ok").length;
  return Math.round((done / steps.length) * 100);
}

function getDotClass(tone) {
  if (tone === "ok") return "ckDDot ckDDotOk";
  if (tone === "warn") return "ckDDot ckDDotWarn";
  return "ckDDot ckDDotUp";
}

function getPillClass(tone) {
  if (tone === "ok") return "statusPill ok";
  if (tone === "warn") return "statusPill warn";
  return "statusPill neutral";
}

export default function ParentChecklist() {
  const [selectedStepNo, setSelectedStepNo] = useState(1);

  const percent = useMemo(() => getPercent(STEPS), []);
  const completedCount = useMemo(() => STEPS.filter((s) => s.tone === "ok").length, []);
  const nextDeadline = "25 February 2026";

  const downloadPdf = () => {
    alert("PDF download mock");
  };

  const onRowClick = (no) => {
    setSelectedStepNo(no);
  };

  return (
    <div className="parentApp">
      <ParentTopBar title="Checklist" userName="Miss ABC" />

      <main className="parentContent">
        <div className="ckDWrap">
          <div className="ckDHeader">
            <div className="ckDAvatar">EP</div>

            <div className="ckDHeaderText">
              <div className="ckDTitleSmall">Onboarding Checklist for</div>

              <div className="ckDNameRow">
                <div className="ckDName">{STUDENT.fullName}</div>
                <div className="ckDYear">({STUDENT.year})</div>
              </div>

              <div className="ckDMeta">
                <div className="ckDParent">{STUDENT.parentName}</div>
                <div className="ckDEmail">{STUDENT.parentEmail}</div>
              </div>
            </div>
          </div>

          <div className="ckDProgressCard">
            <div className="ckDProgressTop">
              <div className="ckDProgressLabel">Enrollment Progress</div>
              <div className="ckDProgressRight">
                <div className="ckDProgressPercent">{percent}%</div>
                <div className="ckDProgressCompletedText">Completed</div>
              </div>
            </div>

            <div className="ckDBar">
              <div className="ckDFill" style={{ width: `${percent}%` }} />
            </div>

            <div className="ckDProgressBottom">
              <div>
                <span className="ckDBadge">
                  {completedCount} of {STEPS.length}
                </span>
                <span className="ckDMuted">Steps completed</span>
              </div>

              <div className="ckDMuted">
                Next Deadline:<span className="ckDDeadlineBold">{nextDeadline}</span>
              </div>
            </div>
          </div>

          <div className="ckDTableCard">
            <div className="ckDTableHeader">
              <div className="ckDTh">#</div>
              <div className="ckDTh">Step</div>
              <div className="ckDTh">Status</div>
              <div className="ckDTh">Deadline</div>
              <div className="ckDTh">Deadline</div>
            </div>

            <div className="ckDTableBody">
              {STEPS.map((s) => {
                const isWarn = s.tone === "warn";
                const rowClass = `ckDRow ${isWarn ? "ckDRowWarn" : ""}`;

                return (
                  <button
                    key={s.no}
                    type="button"
                    className={rowClass}
                    onClick={() => onRowClick(s.no)}
                    style={{
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <div className="ckDTd ckDTdNo" style={{ padding: "12px 14px" }}>
                      <span className={getDotClass(s.tone)} />
                      <span className="ckDNoText">{s.no}.</span>
                    </div>

                    <div className="ckDTd" style={{ padding: "12px 14px" }}>
                      {s.title}
                    </div>

                    <div className="ckDTd" style={{ padding: "12px 14px" }}>
                      <span className={getPillClass(s.tone)}>{s.statusText}</span>
                    </div>

                    <div className="ckDTd ckDTdDueLeft" style={{ padding: "12px 14px" }}>
                      {s.dueLeft}
                    </div>

                    <div className="ckDTd" style={{ padding: "12px 14px" }}>
                      {s.dueDate}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="ckDBottomBar">
              <div className="ckDLegend">
                <div className="ckDLegendItem">
                  <span className="ckDDot ckDDotOk" /> <span>Status:</span> <span>On Track</span>
                </div>

                <div className="ckDLegendItem">
                  <span className="ckDDot ckDDotWarn" /> <span>Pending</span>
                </div>

                <div className="ckDLegendItem">
                  <span className="ckDDot ckDDotUp" /> <span>Upcoming</span>
                </div>
              </div>

              <button type="button" className="ckDDownloadBtn" onClick={downloadPdf}>
                Download Current Step PDF
              </button>
            </div>
          </div>

          <div className="emptyState">Selected step: {selectedStepNo}</div>
        </div>
      </main>

      <ParentBottomNav />
    </div>
  );
}*/