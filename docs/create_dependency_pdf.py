import os
import subprocess
import sys

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>EPC Suite - Golden Period Document & Workflow Dependency Matrix</title>
<style>
  @page {
    size: A4 landscape;
    margin: 8mm 10mm 10mm 10mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1e293b;
    margin: 0;
    padding: 0;
    font-size: 10px;
    line-height: 1.35;
    background: #ffffff;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 6px;
    margin-bottom: 8px;
  }
  .header h1 {
    margin: 0;
    font-size: 16px;
    color: #0f172a;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .header .sub {
    font-size: 10px;
    color: #475569;
    margin-top: 1px;
  }
  .header-meta {
    text-align: right;
    font-size: 9px;
    color: #475569;
  }
  .meta-tag {
    display: inline-block;
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 1px 6px;
    border-radius: 3px;
    font-weight: 700;
    font-size: 9px;
  }
  
  /* Pipeline Timeline Strip */
  .timeline-strip {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }
  .t-box {
    flex: 1;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-top: 3px solid #2563eb;
    border-radius: 4px;
    padding: 4px 6px;
  }
  .t-box.t-stat { border-top-color: #8b5cf6; }
  .t-box.t-mfg  { border-top-color: #059669; }
  .t-box.t-fat  { border-top-color: #d97706; }
  .t-box.t-gate { border-top-color: #dc2626; }
  
  .t-days {
    font-size: 8px;
    font-weight: 800;
    text-transform: uppercase;
    color: #2563eb;
  }
  .t-box.t-stat .t-days { color: #7c3aed; }
  .t-box.t-mfg .t-days { color: #059669; }
  .t-box.t-fat .t-days { color: #d97706; }
  .t-box.t-gate .t-days { color: #dc2626; }

  .t-name {
    font-size: 9.5px;
    font-weight: 700;
    color: #0f172a;
    margin-top: 1px;
  }
  .t-sub {
    font-size: 8px;
    color: #64748b;
  }

  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
  }
  thead {
    display: table-header-group;
  }
  tr {
    page-break-inside: avoid;
  }
  th {
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 5px 6px;
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: 1px solid #0f172a;
  }
  td {
    padding: 4.5px 6px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  
  /* Badges */
  .badge {
    display: inline-block;
    font-size: 7.5px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
    text-transform: uppercase;
  }
  .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
  .badge-purple { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
  .badge-emerald { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
  .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .badge-slate { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
  .badge-indigo { background: #e0e7ff; color: #3730a3; border: 1px solid #a5b4fc; }

  .doc-ref {
    font-family: monospace;
    font-weight: 700;
    color: #0f172a;
    font-size: 9px;
  }
  .doc-name {
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 1px;
    font-size: 9.5px;
  }
  .doc-sample {
    font-size: 8px;
    color: #64748b;
    font-family: monospace;
  }
  .user-name {
    font-weight: 700;
    color: #1e293b;
    font-size: 9px;
  }
  .user-dept {
    font-size: 8px;
    color: #64748b;
  }
  .module-path {
    font-family: monospace;
    font-size: 8px;
    color: #475569;
    background: #f1f5f9;
    padding: 1px 3px;
    border-radius: 2px;
    display: inline-block;
  }
  .gate-lock {
    color: #b91c1c;
    font-weight: 700;
    font-size: 8px;
    display: block;
    margin-top: 1px;
  }
  .footer-note {
    margin-top: 8px;
    font-size: 8px;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #cbd5e1;
    padding-top: 4px;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>APAR EPC SUITE — DOCUMENT & WORKFLOW DEPENDENCY MATRIX</h1>
    <div class="sub">Golden Period 60-Day Ground Break Pipeline · Role-Wise Data Uploads & Sequential Gate Clearances</div>
  </div>
  <div class="header-meta">
    <span class="meta-tag">STAGE 2 / GOLDEN PERIOD</span><br>
    Target: Day 60 Ground Break · Version 2.4
  </div>
</div>

<div class="timeline-strip">
  <div class="t-box">
    <div class="t-days">STAGE 1: DAYS 1 – 10</div>
    <div class="t-name">Award & Mother BOQ Ingestion</div>
    <div class="t-sub">LOA, CPBG, Master BOQ & WBS L2 Baseline</div>
  </div>
  <div class="t-box t-mfg">
    <div class="t-days">STAGE 2: DAYS 10 – 25</div>
    <div class="t-name">Advance Mfg Clearance & Survey</div>
    <div class="t-sub">Apar LOI, Buyout POs, Check Survey & Spotting</div>
  </div>
  <div class="t-box t-stat">
    <div class="t-days">STAGE 3: DAYS 15 – 40</div>
    <div class="t-name">Statutory Licences (CEIG & Form V)</div>
    <div class="t-sub">Electrical Approval, CLRA License & WC Policies</div>
  </div>
  <div class="t-box t-fat">
    <div class="t-days">STAGE 4: DAYS 25 – 50</div>
    <div class="t-name">Factory Inspection, FAT & Client DI</div>
    <div class="t-sub">Utility Nomination, FAT Report & Dispatch Instruction</div>
  </div>
  <div class="t-box t-gate">
    <div class="t-days">STAGE 5: DAYS 45 – 60</div>
    <div class="t-name">Store Readiness & Ground Break</div>
    <div class="t-sub">Store Certification, MRN Inwarding & DPR #01</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width: 50px;">Ref #</th>
      <th style="width: 170px;">Document Name & Sample File</th>
      <th style="width: 120px;">Primary User & Role</th>
      <th style="width: 105px;">System Module / URL</th>
      <th style="width: 55px;">Target SLA</th>
      <th style="width: 175px;">Prerequisites (Input Required)</th>
      <th style="width: 185px;">Downstream Unlocked (Outputs)</th>
      <th style="width: 65px;">Gate Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="doc-ref">DOC-01</td>
      <td>
        <div class="doc-name">Letter of Award (LOA)</div>
        <div class="doc-sample">LOA-MSETCL-2026-092.pdf</div>
      </td>
      <td>
        <div class="user-name">Amit Patel</div>
        <div class="user-dept">Bid / Marketing Manager</div>
      </td>
      <td>
        <span class="module-path">/contracts</span><br>
        <span class="module-path">/golden-period</span>
      </td>
      <td><strong>Day 1</strong></td>
      <td>Commercial Bid Opening, L1 Bid Evaluation, Utility Letter of Intent</td>
      <td>Initializes Project Container; unlocks 60-Day countdown, CPBG banking & Contract drafting</td>
      <td><span class="badge badge-blue">Contract</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-02</td>
      <td>
        <div class="doc-name">Contract Performance BG (CPBG)</div>
        <div class="doc-sample">CPBG-SBI-Rs5.42Cr.pdf</div>
      </td>
      <td>
        <div class="user-name">Gaurav Chawla / Rahul Mehta</div>
        <div class="user-dept">Treasury / Contracts</div>
      </td>
      <td>
        <span class="module-path">/golden-period/bank-guarantees</span>
      </td>
      <td><strong>Day 7</strong><br><span style="color:#64748b;">(≤15d LOA)</span></td>
      <td>LOA commercial terms, Bank sanction line (SBI/HDFC), Treasury approval</td>
      <td>Unlocks formal Contract Agreement signing & Mobilization Advance claim (10%)</td>
      <td><span class="badge badge-amber">Financial</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-03</td>
      <td>
        <div class="doc-name">Signed Contract & Mother BOQ</div>
        <div class="doc-sample">CTR-2026-001-MotherBOQ.xlsx</div>
      </td>
      <td>
        <div class="user-name">Rahul Mehta / Akash Dubey</div>
        <div class="user-dept">Contracts / Legal</div>
      </td>
      <td>
        <span class="module-path">/contracts</span> (BOQ Tab)
      </td>
      <td><strong>Day 10</strong></td>
      <td>LOA + Verified CPBG receipt by Utility</td>
      <td><strong>Locks Mother BOQ in System</strong>. Downstream POs & LOIs strictly bounded to contract items</td>
      <td><span class="badge badge-red">Core Lock</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-04</td>
      <td>
        <div class="doc-name">L2 Baseline WBS Schedule</div>
        <div class="doc-sample">WBS-L2-Baseline-Rev0.mpp</div>
      </td>
      <td>
        <div class="user-name">Priya Sharma</div>
        <div class="user-dept">Project Manager</div>
      </td>
      <td>
        <span class="module-path">/wbs</span>
      </td>
      <td><strong>Day 12</strong></td>
      <td>Signed Contract Milestones & Mother BOQ quantities</td>
      <td>Establishes master schedule baseline, critical path tracking, and 60-day ground break targets</td>
      <td><span class="badge badge-blue">Planning</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-05</td>
      <td>
        <div class="doc-name">Check Survey & Tower Spotting</div>
        <div class="doc-sample">TWR-SPOTTING-PROFILE-R0.dwg</div>
      </td>
      <td>
        <div class="user-name">Arun Mishra / Vikram Singh</div>
        <div class="user-dept">Survey Lead / Design Engg</div>
      </td>
      <td>
        <span class="module-path">/site-surveys</span><br>
        <span class="module-path">/transmittals</span>
      </td>
      <td><strong>Day 15–25</strong></td>
      <td>Route walkover, GPS coordinates, approved corridor alignment</td>
      <td>Finalizes tower type schedule (A, B, C, D) & stub lengths; unfreezes excavation coordinates</td>
      <td><span class="badge badge-indigo">Technical</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-06</td>
      <td>
        <div class="doc-name">Internal LOI (Apar Conductor)</div>
        <div class="doc-sample">LOI-APAR-COND-001.pdf</div>
      </td>
      <td>
        <div class="user-name">Ravi Tiwari / Shuv Sarkar</div>
        <div class="user-dept">Procurement / SCM</div>
      </td>
      <td>
        <span class="module-path">/golden-period/manufacturing-clearance</span>
      </td>
      <td><strong>Day 15</strong></td>
      <td>Locked Mother BOQ Item 01 (HTLS Conductor, 450 KM)</td>
      <td>Reserves aluminium ingot hedging, wire rod rolling & stranding plant slots at Silvassa/Jharsuguda</td>
      <td><span class="badge badge-emerald">Production</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-07</td>
      <td>
        <div class="doc-name">Buyout POs (Stubs, Towers, HW)</div>
        <div class="doc-sample">PO-TWR-01 (Utkarsh), PO-HW-01</div>
      </td>
      <td>
        <div class="user-name">Ravi Tiwari</div>
        <div class="user-dept">Vendor Manager</div>
      </td>
      <td>
        <span class="module-path">/golden-period/vendors</span>
      </td>
      <td><strong>Day 20</strong></td>
      <td>Approved Vendor list nomination & Mother BOQ validation</td>
      <td>Authorizes structural steel procurement and fabrication of 240 stub sets for early civil works</td>
      <td><span class="badge badge-emerald">Procurement</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-08</td>
      <td>
        <div class="doc-name">Principal Employer Form V</div>
        <div class="doc-sample">MSETCL-FORM-V-KORADI.pdf</div>
      </td>
      <td>
        <div class="user-name">Meera Pillai</div>
        <div class="user-dept">Compliance Officer</div>
      </td>
      <td>
        <span class="module-path">/golden-period/statutory</span>
      </td>
      <td><strong>Day 20</strong></td>
      <td>Signed Contract Agreement with Utility (MSETCL)</td>
      <td>Mandatory statutory prerequisite to file for State Labour Commissioner CLRA License</td>
      <td><span class="badge badge-purple">Statutory-1</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-09</td>
      <td>
        <div class="doc-name">Labour License (CLRA) & CAR / WC</div>
        <div class="doc-sample">CLRA-LIC-2026-MH-150.pdf</div>
      </td>
      <td>
        <div class="user-name">Meera Pillai / Anita Reddy</div>
        <div class="user-dept">Compliance / HSE Officer</div>
      </td>
      <td>
        <span class="module-path">/golden-period/statutory</span><br>
        <span class="module-path">/golden-period/insurance</span>
      </td>
      <td><strong>Day 35</strong></td>
      <td>Form V from MSETCL + Contractor All Risk (CAR) & Workmen Compensation (WC) policies</td>
      <td>Legal permission to deploy contract labour and mobilize civil excavation gangs on site</td>
      <td><span class="badge badge-purple">Statutory-1</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-10</td>
      <td>
        <div class="doc-name">CEIG Electrical Scheme Approval</div>
        <div class="doc-sample">CEIG-APP-220KV-MH.pdf</div>
      </td>
      <td>
        <div class="user-name">Meera Pillai / Vikram Singh</div>
        <div class="user-dept">Compliance / Design Engg</div>
      </td>
      <td>
        <span class="module-path">/golden-period/statutory</span>
      </td>
      <td><strong>Day 35</strong></td>
      <td>Class-A Electrical Contractor License, Single Line Diagram, PTCC clearance</td>
      <td>Statutory authority to execute high-voltage line construction & cross statutory corridors</td>
      <td><span class="badge badge-purple">Statutory-2</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-11</td>
      <td>
        <div class="doc-name">Utility Inspector Nomination</div>
        <div class="doc-sample">MSETCL-NOM-INSP-042.pdf</div>
      </td>
      <td>
        <div class="user-name">Amit Patel (Marketing) / Utility</div>
        <div class="user-dept">Marketing Team / MSETCL</div>
      </td>
      <td>
        <span class="module-path">/golden-period/vendors</span>
      </td>
      <td><strong>Day 30</strong></td>
      <td>Inspection Call Raised by SCM after factory pilot lot readiness</td>
      <td>Authorizes official joint inspection date between APAR QA/QC, Supplier & Utility Engineer</td>
      <td><span class="badge badge-amber">Inspection</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-12</td>
      <td>
        <div class="doc-name">Factory Acceptance Test (FAT) Report</div>
        <div class="doc-sample">FAT-APAR-HTLS-LOT1-SIGNED.pdf</div>
      </td>
      <td>
        <div class="user-name">Deepa Nair</div>
        <div class="user-dept">QA/QC Inspector</div>
      </td>
      <td>
        <span class="module-path">/qa-qc/inspections</span>
      </td>
      <td><strong>Day 42</strong></td>
      <td>Joint testing at factory with nominated Utility Inspector</td>
      <td>Passed to Marketing Team. Prerequisite for Utility to issue Dispatch Instruction (DI)</td>
      <td><span class="badge badge-amber">Quality</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-13</td>
      <td>
        <div class="doc-name">Utility Dispatch Instruction (DI)</div>
        <div class="doc-sample">MSETCL-DI-2026-HTLS-088.pdf</div>
      </td>
      <td>
        <div class="user-name">Amit Patel / Utility CE</div>
        <div class="user-dept">Marketing / MSETCL</div>
      </td>
      <td>
        <span class="module-path">/golden-period/dispatches</span>
      </td>
      <td><strong>Day 48</strong></td>
      <td>Signed FAT Report submitted to Utility by Marketing</td>
      <td>Authorizes factory dispatch gates to load trucks; triggers transit e-way bills to site store</td>
      <td><span class="badge badge-red">Core Lock</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-14</td>
      <td>
        <div class="doc-name">Site Store Readiness Certificate</div>
        <div class="doc-sample">STORE-CERT-KORADI-REV0.pdf</div>
      </td>
      <td>
        <div class="user-name">Manoj Desai</div>
        <div class="user-dept">Store Manager / Inventory Ctrl</div>
      </td>
      <td>
        <span class="module-path">/golden-period/stores</span>
      </td>
      <td><strong>Day 50</strong></td>
      <td>Storage yard lease, perimeter fencing, security guards, weather-proof cement shed</td>
      <td>Designated receiving store ready for incoming consignments; clears store readiness gate</td>
      <td><span class="badge badge-slate">Logistics</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-15</td>
      <td>
        <div class="doc-name">Material Receipt Note (MRN)</div>
        <div class="doc-sample">MRN-2026-001 (Stubs & Cmt)</div>
      </td>
      <td>
        <div class="user-name">Manoj Desai</div>
        <div class="user-dept">Inventory Controller</div>
      </td>
      <td>
        <span class="module-path">/inventory</span>
      </td>
      <td><strong>Day 55</strong></td>
      <td>Arrival of vehicles under Utility DI, invoice verification & visual physical inspection</td>
      <td>Physical verification of stubs, earthing, cement & hardware in site store; ready for gang issue</td>
      <td><span class="badge badge-slate">Inventory</span></td>
    </tr>

    <tr>
      <td class="doc-ref">DOC-16</td>
      <td>
        <div class="doc-name">Day 60 Gate Sign-Off & DPR #01</div>
        <div class="doc-sample">DPR-2026-001-AP01-EXCAV.pdf</div>
      </td>
      <td>
        <div class="user-name">Sunil Verma & Suresh Yadav</div>
        <div class="user-dept">Project Director / Gang Supv</div>
      </td>
      <td>
        <span class="module-path">/golden-period</span><br>
        <span class="module-path">/installation/dpr</span>
      </td>
      <td><strong>Day 60</strong></td>
      <td>All 15 prerequisites 100% verified (BOQ, CPBG, Stubs in Store, CEIG, Form V)</td>
      <td><strong>HITS THE GROUND</strong>: Ground break, pit excavation & stub setting at Location AP-01</td>
      <td><span class="badge badge-red">Day 60 Gate</span></td>
    </tr>
  </tbody>
</table>

<div class="footer-note">
  <div><strong>APAR Industries Limited — EPC Infrastructure Division</strong> | Confidential & Proprietary Operations Document</div>
  <div>Generated on: 21-Oct-2026 | Standard Operating Procedure (SOP-EPC-02)</div>
</div>

</body>
</html>
"""

def generate_pdf():
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(docs_dir, "EPC_Document_Dependency_Matrix.html")
    pdf_path = os.path.join(docs_dir, "EPC_Golden_Period_Document_Dependency_Matrix.pdf")

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)
    print(f"Wrote HTML to {html_path}")

    # Use Edge / Chrome
    browser_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(browser_exe):
        browser_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    
    if not os.path.exists(browser_exe):
        print("Error: No Edge or Chrome executable found.")
        sys.exit(1)

    cmd = [
        browser_exe,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    print(f"Running browser print-to-pdf...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        print(f"SUCCESS: Generated PDF at {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
    else:
        print(f"Failed. Return code: {res.returncode}, Stderr: {res.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    generate_pdf()
