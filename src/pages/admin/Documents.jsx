import { useMemo, useState } from "react";

function buildPrintHtml(docTitle, innerHtml) {
  // This HTML is used only for printing / Save as PDF
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${docTitle}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      body { font-family: Arial, Helvetica, sans-serif; color: #111; }
      .page { max-width: 210mm; }
      h1 { font-size: 18px; margin: 0 0 8px; }
      h2 { font-size: 14px; margin: 14px 0 8px; }
      p, li { font-size: 12px; line-height: 1.5; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      .meta { font-size: 12px; color: #444; margin-bottom: 12px; }
      .box { border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; margin-top: 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
      .field { border: 1px solid #ddd; border-radius: 8px; padding: 10px; min-height: 40px; }
      .label { font-size: 11px; color: #444; margin-bottom: 6px; }
      .line { border-bottom: 1px solid #999; height: 18px; }
      .small { font-size: 11px; color: #444; }
    </style>
  </head>
  <body>
    <div class="page">
      ${innerHtml}
    </div>
    <script>
      window.onload = function () {
        window.print();
      };
    </script>
  </body>
</html>`;
}

function SignatureBlock() {
  return (
    <div className="docBox">
      <div className="docSectionTitle">Acknowledgement and Signature</div>

      <div className="docGrid">
        <div className="docField">
          <div className="docFieldLabel">Student Full Name</div>
          <div className="docFieldLine" />
        </div>

        <div className="docField">
          <div className="docFieldLabel">Parent / Guardian Name</div>
          <div className="docFieldLine" />
        </div>

        <div className="docField">
          <div className="docFieldLabel">Date</div>
          <div className="docFieldLine" />
        </div>

        <div className="docField">
          <div className="docFieldLabel">Signature</div>
          <div className="docFieldLine" />
        </div>
      </div>

      <div className="docSmallNote">
        By signing, I confirm that I have read and understood this document.
      </div>
    </div>
  );
}

export default function Documents() {
  const [activeId, setActiveId] = useState(null);

  const docs = useMemo(
    () => [
      {
        id: "doc1",
        title: "Step 1: Providing Information to Prospective Parents",
        needsSignature: false,
        meta: "Read-only information",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document helps families understand the school, the admission
                process, and the next steps.
              </div>

              <div className="docSectionTitle">What parents should do</div>
              <ul className="docList">
                <li>Read the school overview (curriculum, campus, daily routine)</li>
                <li>Check admission requirements and key dates</li>
                <li>Prepare questions for the school team</li>
              </ul>

              <div className="docSectionTitle">What the school provides</div>
              <ul className="docList">
                <li>Programme overview and basic policies</li>
                <li>Contact channels and visiting schedule</li>
              </ul>
            </div>
          </>
        ),
      },

      {
        id: "doc2",
        title: "Step 2: Making Your Application",
        needsSignature: false,
        meta: "Read-only information",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document explains what information is needed to complete the
                application correctly.
              </div>

              <div className="docSectionTitle">Parent checklist</div>
              <ul className="docList">
                <li>Fill in student basic information</li>
                <li>Add parent / guardian contacts</li>
                <li>Prepare required ID documents (if requested)</li>
              </ul>

              <div className="docSectionTitle">Required details</div>
              <ul className="docList">
                <li>Student: full name, date of birth, nationality</li>
                <li>Parent: full name, phone, email, address</li>
                <li>Previous school (optional)</li>
              </ul>
            </div>
          </>
        ),
      },

      {
        id: "doc3",
        title: "Step 3: Submission of Application and Time Frame",
        needsSignature: false,
        meta: "Read-only information",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document explains the timeline after submitting an application.
              </div>

              <div className="docSectionTitle">What happens next</div>
              <ul className="docList">
                <li>School reviews the application (estimated 3–7 working days)</li>
                <li>School contacts parents to schedule the interview</li>
                <li>Parents receive status updates by email</li>
              </ul>

              <div className="docSectionTitle">Important notes</div>
              <ul className="docList">
                <li>Missing documents may delay the review</li>
                <li>Please keep your email and phone reachable</li>
              </ul>
            </div>
          </>
        ),
      },

      {
        id: "doc4",
        title: "Step 4: Admission Interview",
        needsSignature: false,
        meta: "Read-only information",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document explains how the admission interview works and how
                to prepare.
              </div>

              <div className="docSectionTitle">Interview preparation</div>
              <ul className="docList">
                <li>Student interview (age-appropriate questions)</li>
                <li>Parent interview (expectations and student support)</li>
                <li>Bring original documents if requested</li>
              </ul>

              <div className="docSectionTitle">After the interview</div>
              <ul className="docList">
                <li>School shares the result and the next step instructions</li>
              </ul>
            </div>
          </>
        ),
      },

      {
        id: "doc5",
        title: "Step 5: Offer of Entry and Acceptance",
        needsSignature: true,
        meta: "Requires acknowledgement and signature",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document confirms the offer decision and explains acceptance
                steps.
              </div>

              <div className="docSectionTitle">If accepted, parents will</div>
              <ul className="docList">
                <li>Receive an offer letter from the school</li>
                <li>Confirm acceptance by the deadline</li>
                <li>Review fee summary and payment instructions</li>
              </ul>

              <div className="docSectionTitle">Important</div>
              <ul className="docList">
                <li>Acceptance is secured only after confirmation steps are completed</li>
                <li>If the deadline is missed, the offer may be withdrawn</li>
              </ul>
            </div>

            <SignatureBlock />
          </>
        ),
      },

      {
        id: "doc6",
        title: "Step 6: Registration",
        needsSignature: true,
        meta: "Requires acknowledgement and signature",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document finalizes enrollment and confirms student record details.
              </div>

              <div className="docSectionTitle">Registration checklist</div>
              <ul className="docList">
                <li>Confirm student details and emergency contacts</li>
                <li>Submit medical information / allergies (if applicable)</li>
                <li>Sign school agreements (policies and consent forms)</li>
              </ul>

              <div className="docSectionTitle">School provides</div>
              <ul className="docList">
                <li>Student account setup information</li>
                <li>School communication channels</li>
              </ul>
            </div>

            <SignatureBlock />
          </>
        ),
      },

      {
        id: "doc7",
        title: "Step 7: Information to Registered Students and Parents",
        needsSignature: true,
        meta: "Requires acknowledgement and signature",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                This document shares important information for the school year.
              </div>

              <div className="docSectionTitle">Parents receive</div>
              <ul className="docList">
                <li>School calendar and term dates</li>
                <li>Uniform and supply list</li>
                <li>Communication guide (apps / email / phone)</li>
                <li>Transportation and lunch options</li>
              </ul>

              <div className="docSectionTitle">Parents should</div>
              <ul className="docList">
                <li>Read all instructions and keep a copy of this document</li>
                <li>Contact the school if any information is unclear</li>
              </ul>
            </div>

            <SignatureBlock />
          </>
        ),
      },

      {
        id: "doc8",
        title: "Step 8: Orientation",
        needsSignature: false,
        meta: "Read-only information",
        content: (
          <>
            <div className="docBox">
              <div className="docSectionTitle">Purpose</div>
              <div className="docText">
                Orientation helps families start smoothly and understand daily routines.
              </div>

              <div className="docSectionTitle">Orientation includes</div>
              <ul className="docList">
                <li>Campus tour and classroom introduction</li>
                <li>Meet teachers and staff</li>
                <li>Explain daily routines and school rules</li>
              </ul>

              <div className="docSectionTitle">Parent checklist</div>
              <ul className="docList">
                <li>Attend the orientation session (date and time provided by school)</li>
                <li>Ask any final questions</li>
                <li>Confirm first-day schedule</li>
              </ul>
            </div>
          </>
        ),
      },
    ],
    []
  );

  const activeDoc = useMemo(() => {
    if (!activeId) return null;
    return docs.find((d) => d.id === activeId) || null;
  }, [activeId, docs]);

  const downloadPdf = () => {
    if (!activeDoc) return;

    // Build a clean print-only HTML (no app header/footer)
    const printInner = `
      <h1>${activeDoc.title}</h1>
      <div class="meta">${activeDoc.meta}</div>
      ${document.getElementById("doc-print-area")?.innerHTML || ""}
    `;

    const html = buildPrintHtml(activeDoc.title, printInner);

    // Open a new tab for printing. User can choose "Save as PDF"
    const w = window.open("", "_blank");
    if (!w) return;

    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // List view
  if (!activeDoc) {
    return (
      <div className="pagePad">
        <div className="eventDetailBlock docsWrap">
          <div className="eventDetailTitle">Documents</div>
          <div className="eventDetailDesc">
            Select a document below to view its details.
          </div>

          <div className="docsList">
            {docs.map((d, idx) => (
              <button
                key={d.id}
                type="button"
                className="docBtn"
                onClick={() => setActiveId(d.id)}
              >
                <div className="docBtnLeft">
                  <div className="docBtnStep">Document {idx + 1}</div>
                  <div className="docBtnTitle">{d.title}</div>
                  <div className="docBtnMeta">
                    {d.needsSignature ? "Signature required" : "Read-only"}
                  </div>
                </div>
                <div className="docBtnRight">Open</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  return (
    <div className="pagePad">
      <div className="eventDetailBlock docsWrap">
        <div className="docsTop">
          <button
            type="button"
            className="btnOutlinePrimary"
            onClick={() => setActiveId(null)}
          >
            Back to Documents
          </button>

          <button type="button" className="btnPrimary" onClick={downloadPdf}>
            Download PDF
          </button>
        </div>

        <div className="docPaper">
          <div className="docHeader">
            <div className="docTitle">{activeDoc.title}</div>
            <div className="docMeta">{activeDoc.meta}</div>
          </div>

          <div id="doc-print-area">{activeDoc.content}</div>
        </div>
      </div>
    </div>
  );
}