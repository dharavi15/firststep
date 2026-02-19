import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

// mock detail data for each student
// can change to DB or API later
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

// create simple avatar using emoji
// this avoids using real image for now
function AvatarEmoji({ name }) {

  // choose emoji based on name
  // same name will always get same emoji
  const emoji = useMemo(() => {
    const pool = ["👧", "👦", "🧒", "👩‍🎓", "👨‍🎓"];
    let sum = 0;

    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }

    return pool[sum % pool.length];
  }, [name]);

  return <span className="detailAvatar">{emoji}</span>;
}

export default function ChecklistStudentPage() {

  // get studentId from URL
  // example: /admin/checklist/s-ethan
  const { studentId } = useParams();

  // useNavigate allows us to go back to list page
  const navigate = useNavigate();

  // find student detail using studentId
  // if not found, use default fallback data
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

      {/* Top section with avatar and overall status */}
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

      {/* Step list section */}
      <div className="detailList">

        {data.steps.map((s) => (
          <div key={s.n} className="detailRow">

            {/* Step number */}
            <div className="stepNo">{s.n}</div>

            {/* Step name */}
            <div className="stepLabel">{s.label}</div>

            {/* Step result */}
            <div className="stepValue">{s.value}</div>

          </div>
        ))}

      </div>

      {/* Footer section */}
      <div className="detailFooter">

        <div className="detailFooterLeft">
          <div className="detailStepOf">{data.stepOf}</div>
          <div className="detailNext">Next: {data.next}</div>
        </div>

        <div className="detailFooterRight">
          <button
            type="button"
            className="linkBtn"
            onClick={() => navigate("/admin/checklist")}
          >
            Back to list
          </button>
        </div>

      </div>

    </div>
  );
}