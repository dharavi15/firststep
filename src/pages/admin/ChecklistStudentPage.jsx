import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STUDENT_DETAIL = {
  "s-ethan": {
    name: "Ethan Parker",
    overall: "Pending (2 days left)",
    steps: [
      { n: 1, label: "Awaiting Payment", value: "Pending (2 days left)" },
      { n: 2, label: "Fill Health Form", value: "Completed" },
      { n: 3, label: "Pay Tuition & Fees", value: "Pending (7 days left)" },
      { n: 4, label: "Attend Orientation", value: "April 30" },
      { n: 5, label: "Upload Proof of Payment", value: "Pending" },
    ],
    stepOf: "Step 1 of 5",
    next: "Fill Health Form",
  },
  "s-lucas": {
    name: "Lucas Reed",
    overall: "Completed",
    steps: [
      { n: 1, label: "Awaiting Payment", value: "Completed" },
      { n: 2, label: "Fill Health Form", value: "Completed" },
      { n: 3, label: "Pay Tuition & Fees", value: "Completed" },
      { n: 4, label: "Attend Orientation", value: "Completed" },
      { n: 5, label: "Upload Proof of Payment", value: "Completed" },
    ],
    stepOf: "Step 5 of 5",
    next: "-",
  },
};

function AvatarEmoji({ name }) {
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return pool[sum % pool.length];
  }, [name]);

  return <span className="detailAvatar" aria-hidden="true">{emoji}</span>;
}

export default function ChecklistStudentPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const data = STUDENT_DETAIL[studentId] || {
    name: "Unknown Student",
    overall: "Pending",
    steps: [
      { n: 1, label: "Awaiting Payment", value: "Pending" },
      { n: 2, label: "Fill Health Form", value: "Pending" },
      { n: 3, label: "Pay Tuition & Fees", value: "Pending" },
      { n: 4, label: "Attend Orientation", value: "Pending" },
      { n: 5, label: "Upload Proof of Payment", value: "Pending" },
    ],
    stepOf: "Step 1 of 5",
    next: "-",
  };

  return (
    <div className="detailWrap">
      <div className="detailTop">
        <div className="detailLeft">
          <AvatarEmoji name={data.name} />
          <div className="detailName">{data.name}</div>
        </div>

        <div className="detailRight">
          <div className="detailStatusLabel">Status:</div>
          <div className="detailStatusValue">{data.overall}</div>
        </div>
      </div>

      <div className="detailList">
        {data.steps.map((s) => (
          <div key={s.n} className="detailRow">
            <div className="stepNo">{s.n}</div>
            <div className="stepLabel">{s.label}</div>
            <div className="stepValue">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="detailFooter">
        <div className="detailFooterLeft">
          <div className="detailStepOf">{data.stepOf}</div>
          <div className="detailNext">Next: {data.next}</div>
        </div>

        <div className="detailFooterRight">
          <button type="button" className="linkBtn" onClick={() => navigate("/admin/checklist")}>
            Back to list
          </button>
        </div>
      </div>
    </div>
  );
}