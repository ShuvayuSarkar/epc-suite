import os
import sys

try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml import parse_xml
    from docx.oxml.ns import nsdecls
except ImportError:
    print("python-docx not found.")
    sys.exit(1)

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=100, right=100):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def create_streamlined_docx():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.7)
        section.bottom_margin = Inches(0.7)
        section.left_margin = Inches(0.7)
        section.right_margin = Inches(0.7)

    NAVY = RGBColor(15, 23, 42)      # #0f172a
    BLUE = RGBColor(37, 99, 235)     # #2563eb
    SLATE = RGBColor(71, 85, 105)    # #475569
    DARK = RGBColor(30, 41, 59)      # #1e293b
    WHITE = RGBColor(255, 255, 255)
    TEAL = RGBColor(13, 148, 136)    # #0d9488

    # Title Section
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_org = title_p.add_run("APAR INDUSTRIES LIMITED — EPC INFRASTRUCTURE PMO\n")
    run_org.font.size = Pt(10)
    run_org.font.bold = True
    run_org.font.color.rgb = BLUE

    run_title = title_p.add_run("IN-HOUSE PMO TOOL: MODULE-WISE ROLES, DOCUMENT REPOSITORY & ACCESS MATRIX")
    run_title.font.size = Pt(16)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(10)
    run_sub = sub_p.add_run(
        "Aligned to Senior Management Guidelines for HTLS (GETCO 414) & OPGW (KPTCL) Turnkey Projects\n"
        "Document Ref: APAR-PMO-SOP-2026-REV3 | Effective: October 2026"
    )
    run_sub.font.size = Pt(9.5)
    run_sub.font.italic = True
    run_sub.font.color.rgb = SLATE

    # Executive Overview
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(12)
    intro_run = intro_p.add_run(
        "Executive Directive: As mandated by Senior Management, the In-House EPC PMO Tool is structured into "
        "8 Dedicated Operational Modules. This standard operating procedure defines the precise document upload "
        "responsibilities, editing controls, authorization thresholds, and system lock triggers for each lead owner "
        "and their respective teams across both HTLS (GETCO 414) and OPGW (KPTCL) projects."
    )
    intro_run.font.size = Pt(9.5)
    intro_run.font.color.rgb = DARK

    # Table 1: Master Module & Team Mapping
    h1 = doc.add_heading("1. Management Master Module & Lead Owner Directory", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    for r in h1.runs:
        r.font.size = Pt(12.5)
        r.font.color.rgb = NAVY

    modules_summary = [
        ("M-01", "L1 / LOI / LOA / Contract / BG", "Mr. Nilesh Tiwari", "Tendering & Contracts", "LOA, Contract Agreement, Mother BOQ, CPBG, APBG, Amendments"),
        ("M-02", "Golden Activity Period (30+60 Days)", "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa", "Project Monitoring & Operations", "30-Day Pre-LOA Checklist, 60-Day Action Plan, Advance Mfg Clearances, CEIG, Form V, Store Readiness, Ground Break Gate"),
        ("M-03", "Construction Dashboard", "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa", "Field Execution & Quality", "WBS L2 Baseline, DPRs (Civil/Erection/Stringing/OTDR), QCS Inspection Sheets, JMCs, Pre-Comm Logs, TOC / Handover"),
        ("M-04", "Procurement & Vendor Mgmt", "Mr. Anand Raval /\nMr. Sanjay Sharma", "SCM & Procurement", "QCS Vendor Comparisons, Supplier POs, Factory Inspection Calls, FAT Reports & MTCs, Client DIs, Delivery Proofs, Bills Ageing"),
        ("M-05", "Credit Control & Receivables", "Mr. Arnab Bose /\nMr. Piyush Shah", "Credit Control & Commercial", "Client RA Invoices, Bill-to-Collection Reconciliation, Ageing Analysis (Due/Overdue), Deductions & Milestones MIS"),
        ("M-06", "Finance & Cost Control", "Mr. Milind Soni /\nMr. Piyush Gohil", "Finance & Accounts", "Unbilled Revenue MIS, Creditors Ageing MIS, Project Budget vs Actuals (CBS), Bid vs Actual Profitability, Working Capital GFI/NFI"),
        ("M-07", "Document Management System", "Mr. Kamal Gandhi", "Document Control & Claims", "Time Limit Extension (EOT), Permit to Work (PTW Shutdowns), Idling Claims, Force Majeure Notices, Official Correspondence"),
        ("M-08", "Inventory & Asset Management", "Mr. Gopal Nair /\nMr. Sunil Mishra", "Stores & P&M Logistics", "Daily Stock Ledger, Monthly Material Reconciliation, Store-to-Store Transfers (STO), Tools & Plants (T&P), TSE Machinery Logs"),
    ]

    t1 = doc.add_table(rows=1, cols=5)
    t1.alignment = WD_TABLE_ALIGNMENT.CENTER
    t1.autofit = False
    col_w1 = [Inches(0.6), Inches(2.0), Inches(1.5), Inches(1.5), Inches(2.2)]
    headers1 = ["Mod #", "Module Name", "Designated Lead(s)", "Core Department", "Primary Documentation Scope"]

    hdr1 = t1.rows[0].cells
    for i, h in enumerate(headers1):
        hdr1[i].text = h
        hdr1[i].width = col_w1[i]
        set_cell_background(hdr1[i], "0F172A")
        set_cell_margins(hdr1[i], top=100, bottom=100, left=80, right=80)
        p = hdr1[i].paragraphs[0]
        for r in p.runs:
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = WHITE

    for row_idx, row in enumerate(modules_summary):
        cells = t1.add_row().cells
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(row):
            cells[i].text = val
            cells[i].width = col_w1[i]
            set_cell_background(cells[i], bg)
            set_cell_margins(cells[i], top=70, bottom=70, left=80, right=80)
            p = cells[i].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8.5)
                if i in [0, 1]:
                    r.font.bold = True
                if i == 1:
                    r.font.color.rgb = DARK

    # Detailed Module Analysis
    h2 = doc.add_heading("2. Comprehensive Document Upload, Editing & Verification Rules", level=1)
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(6)
    for r in h2.runs:
        r.font.size = Pt(12.5)
        r.font.color.rgb = NAVY

    detailed_modules = [
        {
            "id": "MODULE 01",
            "name": "L1 Intimation, LOI, LOA, Contract Agreement & Bank Guarantees",
            "lead": "Mr. Nilesh Tiwari (Tendering, Contracts & Legal)",
            "benchmark": "HTLS (GETCO 414) & OPGW (KPTCL) Commercial Framework",
            "scope_desc": "Manages initial award onboarding, legal execution of commercial agreements, and statutory banking guarantees.",
            "docs": [
                ("M1-DOC-01", "L1 Intimation & Price Bid Evaluation Copy", "Day 1 (Post-Opening)", "PDF", "Upload & Edit during tender award", "Commercial opening announcement"),
                ("M1-DOC-02", "Letter of Award (LOA) / Letter of Intent (LOI)", "Day 1 of Award", "PDF", "Upload & Lock once accepted", "Formal client award letter"),
                ("M1-DOC-03", "Signed Contract Agreement & Mother BOQ Schedule", "Day 10 (Post-LOA)", "PDF / XLSX", "Editable during draft; LOCKED upon final client sign-off", "Verified CPBG & LOA terms"),
                ("M1-DOC-04", "Contract Performance Bank Guarantee (CPBG)", "Day 7 (≤15d LOA)", "PDF / Scan", "Upload initial; Editable for amendments & renewals", "LOA 10% BG clause & Bank Sanction"),
                ("M1-DOC-05", "Advance Payment Bank Guarantee (APBG)", "Day 15 (Post-LOA)", "PDF", "Upload initial; Tracked for recovery reductions", "Mobilization advance claim terms"),
                ("M1-DOC-06", "Contract Amendments, Addendums & Variations", "As Issued", "PDF", "Append new revisions; preserves original baseline", "Client-approved scope change orders"),
            ],
            "rules": [
                "Mother BOQ Hard Lock: Once Mr. Nilesh Tiwari submits the signed Mother BOQ into the system, all unit rates, contract item codes, and ceiling quantities are HARD LOCKED. Downstream POs cannot exceed these lines without an approved Contract Amendment.",
                "Bank Guarantee Tracking: System tracks validity expiry and 6-month claim periods, triggering automated red alerts 60, 30, and 15 days prior to expiry.",
                "Access Control: Nilesh Tiwari (Admin/Full Control); Project Managers (Read-Only); Finance (Read/Verify)."
            ]
        },
        {
            "id": "MODULE 02",
            "name": "Golden Activity Period Module (L1 to LOA to Hitting Ground in 30+60 Days)",
            "lead": "Mr. Rakesh Sinha / Mr. Suvesh Pahwa (Project Monitoring & Operations)",
            "benchmark": "30-Day Pre-LOA + 60-Day Post-LOA Countdown to Foundation Kickoff",
            "scope_desc": "Drives the rapid mobilization phase to ensure all statutory, engineering, procurement, and site prerequisites are achieved to break ground within 60 days.",
            "docs": [
                ("M2-DOC-01", "30-Day Pre-LOA Readiness Checklist & Risk Register", "Day -30 to 0", "XLSX", "Live editing by Rakesh Sinha / Suvesh Pahwa", "L1 Intimation date"),
                ("M2-DOC-02", "60-Day Golden Period Master Action Plan", "Day 5 Post-LOA", "MPP / XLSX", "Baseline locked; Weekly progress updates", "Signed LOA"),
                ("M2-DOC-03", "Advance Manufacturing Clearance (Internal LOI / Factory Slot)", "Day 15 Post-LOA", "PDF", "Approved & Uploaded by Rakesh Sinha", "Locked Mother BOQ (Long-lead items)"),
                ("M2-DOC-04", "CEIG Statutory Electrical Scheme Sanction", "Day 35 Post-LOA", "PDF", "Uploaded by Statutory team; Verified by Leads", "Class-A License, SLD & Route Profile"),
                ("M2-DOC-05", "Principal Employer Form V & CLRA Labour License", "Day 35 Post-LOA", "PDF", "Uploaded by Statutory/HR; Verified by Leads", "Signed Contract & WC/CAR Insurance"),
                ("M2-DOC-06", "Central Site Store Physical Readiness Certificate", "Day 50 Post-LOA", "PDF", "Uploaded by Store In-charge; Approved by Leads", "5-acre yard lease, fence, hydra, sleepers"),
                ("M2-DOC-07", "Day 60 Golden Period Gate Sign-off (Ground Break)", "Day 58-60", "PDF", "Final executive sign-off; Unlocks Site DPRs", "100% clearance of 6 gate criteria"),
            ],
            "rules": [
                "Gate Interlock Engine: The system will physically block the creation of DPR #01 (Foundation Excavation) unless Mr. Rakesh Sinha / Mr. Suvesh Pahwa execute the digital 60-Day Gate Sign-off.",
                "HTLS Specifics (GETCO 414): Requires check survey, tower spotting profile, and advance stub PO placement verified.",
                "OPGW Specifics (KPTCL): Requires drum schedule validation, tower clamping design approval, and live-line PTW coordination."
            ]
        },
        {
            "id": "MODULE 03",
            "name": "Construction Dashboard Module (DPR / WBS / L2 Schedules / QCS / JMC / Commissioning / TOC)",
            "lead": "Mr. Rakesh Sinha / Mr. Suvesh Pahwa (Field Operations & Execution)",
            "benchmark": "Civil, Tower Erection, Stringing (HTLS) & Splicing (OPGW)",
            "scope_desc": "Tracks physical execution on site, daily progress against the L2 schedule, quality inspections, joint measurements, and commercial handover.",
            "docs": [
                ("M3-DOC-01", "L2 Master Project Baseline Schedule", "Day 12 Post-LOA", "MPP / PDF", "Baseline locked (Rev-0); Revisions require variance note", "Contract milestones"),
                ("M3-DOC-02", "Daily Progress Reports (DPR - Civil, Erection, Stringing)", "Daily by 10 AM", "Web Form / PDF", "Editable by Site Supervisor until 8 PM; Locked post-approval", "Daily work completed on site"),
                ("M3-DOC-03", "Quality Check Sheets (QCS - Pit, Concreting, Torque, Sag)", "Stage-wise", "PDF / Scan", "Uploaded by QA Inspector; Non-editable once verified", "Physical field stage completion"),
                ("M3-DOC-04", "Joint Measurement Certificates (JMC)", "Monthly", "PDF / Scan", "Requires dual sign-off (APAR In-charge + Utility AE)", "Executed quantities at site"),
                ("M3-DOC-05", "Pre-Commissioning Test Protocols (HTLS / OTDR for OPGW)", "Pre-Charging", "PDF", "Joint testing observations; Verified by Lead", "Line completion & stringing"),
                ("M3-DOC-06", "Taking Over Certificate (TOC) / Commissioning Memo", "Final Handover", "PDF", "Formal commercial acceptance; Read-only archival", "Successful 24-hr charging trial"),
            ],
            "rules": [
                "DPR Submission Window: Gang Supervisors submit DPRs daily by 20:00 hrs. Rakesh Sinha / Suvesh Pahwa review and approve by 10:00 hrs next morning. Once approved, DPR quantities are permanently locked.",
                "JMC-to-Invoice Linkage: Billing team cannot generate client invoices unless backed by an approved, digitally signed JMC in this module.",
                "OPGW Quality Check: Specific OTDR attenuation loss logs (≤0.21 dB/km at 1550 nm) must be attached before commissioning sign-off."
            ]
        },
        {
            "id": "MODULE 04",
            "name": "Procurement Module (QCS to Supplier PO / Materials / Inspection / FAT / DI / Bills Ageing)",
            "lead": "Mr. Anand Raval / Mr. Sanjay Sharma (Supply Chain & Procurement)",
            "benchmark": "Long-lead HTLS Conductor & OPGW Hardware / Stubs Procurement",
            "scope_desc": "End-to-end material procurement lifecycle from quotation comparison, vendor POs, factory inspections, client DIs, to vendor & gang bill ageing.",
            "docs": [
                ("M4-DOC-01", "Quotation Comparison Statement (QCS)", "Pre-PO Award", "XLSX / PDF", "Editable during vendor evaluation; Locked upon PO approval", "Min 3 valid vendor quotes"),
                ("M4-DOC-02", "Supplier Purchase Orders (PO) & Internal LOIs", "Within SLA", "PDF", "Generated in system; Locked on dispatch; Amendments logged", "Approved QCS & Mother BOQ balance"),
                ("M4-DOC-03", "Factory Inspection Call Notices", "Batch Ready", "PDF", "Uploaded by SCM; Notified to Client/Marketing", "Vendor internal test readiness"),
                ("M4-DOC-04", "Factory Acceptance Test (FAT) Reports & MTCs", "Post-Testing", "PDF / Scan", "Uploaded by QA/SCM; Dual signed (Vendor + Client)", "Witnessed factory testing"),
                ("M4-DOC-05", "Utility Dispatch Instructions (DI)", "Pre-Transit", "PDF", "Uploaded by SCM/Marketing; Unlocks factory gate pass", "Approved FAT Report"),
                ("M4-DOC-06", "Delivery Challans, E-Way Bills & Consignment Proofs", "Transit Inward", "PDF / Scan", "Uploaded by Transporter/Store In-charge", "Material movement under DI"),
                ("M4-DOC-07", "Supplier & Labour Gang Invoices with Ageing", "Weekly", "PDF / Data", "Uploaded by SCM/Vendors; System auto-tracks 30/60/90d ageing", "Verified delivery / completed JMC"),
            ],
            "rules": [
                "Mother BOQ Line Constraint: System automatically validates that PO quantity + previously ordered quantity does NOT exceed Mother BOQ contract limit.",
                "Inspection & DI Coupling: Trucks cannot be booked or dispatched without a verified Client DI uploaded and mapped to the specific PO line.",
                "Gangs & Supplier Bill Ageing: Bills are stamped with receipt dates; system automatically categorizes payables into Current, Due, and Overdue (>60 days)."
            ]
        },
        {
            "id": "MODULE 05",
            "name": "Credit Control Module (Invoicing to Collections / MIS / Ageing / Milestones MIS)",
            "lead": "Mr. Arnab Bose / Mr. Piyush Shah (Credit Control & Commercial)",
            "benchmark": "Cash Liquidity, Client Billing (GETCO/KPTCL) & Receivable Management",
            "scope_desc": "Controls billing milestones, client tax invoicing, payment collections reconciliation, retention tracking, and debtor ageing analysis.",
            "docs": [
                ("M5-DOC-01", "Client Running Account (RA) Tax Invoices", "Monthly / Stage", "PDF / XML", "Generated & Uploaded by Arnab Bose / Piyush Shah", "Verified JMCs & Store Material Receipts"),
                ("M5-DOC-02", "Bill-to-Collection Mapping Reconciliation Sheet", "Weekly", "XLSX", "Live editable ledger mapping receipts to invoice numbers", "Bank payment advice credits"),
                ("M5-DOC-03", "Debtor Ageing MIS (Not Due, Due 1-30, 31-60, >90 Days)", "Weekly / Monthly", "XLSX / PDF", "System generated; Reviewed & verified by Leads", "Invoice issue dates & credit tenure"),
                ("M5-DOC-04", "Client Payment Advices & Deduction Reconciliation", "Per Payment", "PDF / Scan", "Uploaded by Credit Control; Tracks TDS, Retention, LDs", "Client remittance intimation"),
                ("M5-DOC-05", "Billing Milestones Compliance MIS", "Monthly", "XLSX", "Tracks milestone gates (Supply 70%, Erection 20%, TOC 10%)", "Contract billing schedule terms"),
            ],
            "rules": [
                "Invoice Lock: Once an RA bill is submitted to GETCO or KPTCL with official acknowledgement, the bill is locked. Disallowances or deductions are recorded via Credit Notes or Deduction Ledgers.",
                "Collection FIFO Allocation: Incoming client payments are reconciled against specific invoice line items (Principal, GST, Price Variation) to maintain exact ageing accuracy."
            ]
        },
        {
            "id": "MODULE 06",
            "name": "Finance Module (Unbilled MIS / Creditors MIS / Budget vs Actual / Profitability / GFI & NFI Days)",
            "lead": "Mr. Milind Soni / Mr. Piyush Gohil (Corporate Finance & Accounts)",
            "benchmark": "Corporate Cost Accounting, Working Capital & Project Profitability",
            "scope_desc": "Provides executive management visibility into project gross margin, budget variance, unbilled work-in-progress, vendor liabilities, and working capital cycle days.",
            "docs": [
                ("M6-DOC-01", "Project Baseline Cost Budget (CBS - Cost Breakdown Structure)", "Day 15 Post-LOA", "XLSX", "Locked baseline; Revisions require Director Approval", "Signed contract & tender cost model"),
                ("M6-DOC-02", "Project-wise Unbilled Revenue MIS (WIP & Store Stocks)", "Monthly", "XLSX / PDF", "Compiled by Finance; verified with Site & Credit Control", "Material received but not yet billed"),
                ("M6-DOC-03", "Creditors MIS & Trade Payables Ageing Schedule", "Monthly", "XLSX / PDF", "Accounts payable ledger; tracks vendor liabilities", "Approved supplier/gang bills"),
                ("M6-DOC-04", "Bid Profitability vs. Actual Profitability Variance MIS", "Quarterly", "XLSX / PDF", "Calculates actual cost incurred vs estimated bid margins", "GL expenditure & recognized revenue"),
                ("M6-DOC-05", "Working Capital Cycle Report (GFI / NFI Days)", "Monthly", "XLSX / PDF", "Monitors Gross Funds Invested (GFI) & Net Funds Invested (NFI)", "Debtors, Creditors, Inventory, WIP"),
            ],
            "rules": [
                "Budget Overrun Interlock: If any procurement PO or subcontract exceeds the approved CBS line item budget by >5%, the system triggers an automated lock requiring Milind Soni / Piyush Gohil sign-off.",
                "NFI Days Formula: System computes NFI Days = (Debtor Days + Inventory Days + Unbilled WIP Days) - Creditor Days, alerting management when working capital expands beyond target thresholds."
            ]
        },
        {
            "id": "MODULE 07",
            "name": "Document Management System Module (Time Limit Extension / PTW / Idling Claims)",
            "lead": "Mr. Kamal Gandhi (Document Control, Contracts & Claims)",
            "benchmark": "Contractual Claims, EOT Defense, Outage Permits & Project Records",
            "scope_desc": "Central repository for contractual legal defense, delay notices, statutory power shutdown permits, and idling equipment claims.",
            "docs": [
                ("M7-DOC-01", "Extension of Time (EOT) Claim Packages & Delay Impact Analysis", "Per Event", "PDF / MPP", "Drafted & Uploaded by Kamal Gandhi; Legal reviewed", "Documented delay logs & L2 impacts"),
                ("M7-DOC-02", "Notice of Delay Events & Force Majeure Intimations", "Within 48 hrs", "PDF", "Uploaded with client delivery acknowledgement", "Site ROW, weather, or utility delays"),
                ("M7-DOC-03", "Permit to Work (PTW) / Transmission Outage Clearances", "Per Shutdown", "PDF / Scan", "Uploaded by Site; Verified by Kamal Gandhi", "Utility approval for line crossing shutdown"),
                ("M7-DOC-04", "Idling Machinery & Gang Claims (Log Sheets & Photographs)", "Weekly", "PDF / Scan", "Uploaded from site; Verified by Kamal Gandhi", "Equipment idling due to client delays"),
                ("M7-DOC-05", "Official Project Correspondence Register (Incoming / Outgoing)", "Daily / Live", "PDF Archive", "Immutable logbook; auto-numbered tracking", "All official emails, letters, transmittals"),
            ],
            "rules": [
                "Strict Timelines on Delay Notices: Contract clauses require delay notices within 7 to 14 days of occurrence. System triggers compliance warnings to prevent claim repudiation.",
                "PTW Shutdown Integrity: HTLS re-conductoring and OPGW stringing require live-line crossing shutdowns. PTW approvals must be verified in the module before stringing gangs mobilize."
            ]
        },
        {
            "id": "MODULE 08",
            "name": "Inventory Management Module (Stock Inventory / Reconciliation / STO / Tools, Plants & TSE)",
            "lead": "Mr. Gopal Nair / Mr. Sunil Mishra (Stores & Heavy Asset Logistics)",
            "benchmark": "Store Custody, Material Balancing, Inter-Site Transfers & Stringing Machinery",
            "scope_desc": "Maintains 100% custody of project inventory, conducts monthly material reconciliations, manages inter-project stock transfers (STO), and tracks heavy tension stringing equipment.",
            "docs": [
                ("M8-DOC-01", "Daily Stock Ledger & Digital Bin Cards", "Daily / Live", "System / XLSX", "Live updates on Material Inward (MRN) and Issue (MIN)", "Approved DIs & Site requisitions"),
                ("M8-DOC-02", "Monthly Material Reconciliation Report (Supply vs Installed vs Balance)", "Monthly", "XLSX / PDF", "Compiled by Stores; Dual verified by Site In-charge", "Actual measured JMC vs physical stock"),
                ("M8-DOC-03", "Stock Transfer Orders (STO) & Inter-Project Transfer Manifests", "Per Transfer", "PDF / Data", "Requires dual approval (Sending Store + Receiving Store)", "Surplus / emergency site stock balancing"),
                ("M8-DOC-04", "Tools & Plants (T&P) and TSE Machines Maintenance & Allocation Log", "Weekly", "XLSX / PDF", "Tracks Hydra Cranes, Winches, Pullers, Tensioners, OTDRs", "Equipment deployment schedules"),
                ("M8-DOC-05", "Scrap, Salvage & Surplus Material Disposal Certificates", "Project Close", "PDF / Scan", "Audited by Gopal Nair / Sunil Mishra; Sign-off by Client", "Cut pieces, empty drums, leftover items"),
            ],
            "rules": [
                "MRN Inwarding Rule: Inventory is only credited upon matching 3-way check: Physical Delivery Challan + Road E-Way Bill + Official Client DI.",
                "TSE Machinery Readiness: High-capacity tensioners and pullers (critical for HTLS sag-tensioning and OPGW damage-free pulling) must carry valid calibration and maintenance certificates logged in this module."
            ]
        }
    ]

    for mod in detailed_modules:
        h3 = doc.add_heading(f"{mod['id']}: {mod['name']}", level=2)
        h3.paragraph_format.space_before = Pt(14)
        h3.paragraph_format.space_after = Pt(2)
        for r in h3.runs:
            r.font.size = Pt(11)
            r.font.color.rgb = BLUE

        meta_p = doc.add_paragraph()
        meta_p.paragraph_format.space_after = Pt(4)
        
        r1 = meta_p.add_run("Lead Owner: ")
        r1.font.bold = True
        r1.font.size = Pt(8.5)
        r2 = meta_p.add_run(mod["lead"] + "\n")
        r2.font.size = Pt(8.5)

        r3 = meta_p.add_run("Project Benchmarks: ")
        r3.font.bold = True
        r3.font.size = Pt(8.5)
        r4 = meta_p.add_run(mod["benchmark"] + "\n")
        r4.font.size = Pt(8.5)
        r4.font.color.rgb = TEAL

        r5 = meta_p.add_run("Core Operational Scope: ")
        r5.font.bold = True
        r5.font.size = Pt(8.5)
        r6 = meta_p.add_run(mod["scope_desc"])
        r6.font.size = Pt(8.5)
        r6.font.color.rgb = SLATE

        # Docs table
        t = doc.add_table(rows=1, cols=6)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        t_widths = [Inches(0.8), Inches(1.8), Inches(0.8), Inches(0.5), Inches(1.7), Inches(1.6)]
        t_headers = ["Code", "Document Title", "Target SLA", "Format", "Editing & Lock Conditions", "Input Prerequisite"]

        hdr = t.rows[0].cells
        for idx, head_text in enumerate(t_headers):
            hdr[idx].text = head_text
            hdr[idx].width = t_widths[idx]
            set_cell_background(hdr[idx], "1E293B")
            set_cell_margins(hdr[idx], top=70, bottom=70, left=70, right=70)
            p = hdr[idx].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(7.5)
                r.font.bold = True
                r.font.color.rgb = WHITE

        for d_idx, doc_row in enumerate(mod["docs"]):
            row_cells = t.add_row().cells
            bg = "F8FAFC" if d_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(doc_row):
                row_cells[c_idx].text = cell_value
                row_cells[c_idx].width = t_widths[c_idx]
                set_cell_background(row_cells[c_idx], bg)
                set_cell_margins(row_cells[c_idx], top=50, bottom=50, left=70, right=70)
                p = row_cells[c_idx].paragraphs[0]
                for r in p.runs:
                    r.font.size = Pt(7.5)
                    if c_idx == 0:
                        r.font.bold = True
                    elif c_idx == 1:
                        r.font.bold = True
                        r.font.color.rgb = DARK

        # Governance & Lock Rules
        rule_p = doc.add_paragraph()
        rule_p.paragraph_format.space_before = Pt(5)
        rule_p.paragraph_format.space_after = Pt(2)
        r_head = rule_p.add_run("Governance, System Locks & Operational Rules:")
        r_head.font.bold = True
        r_head.font.size = Pt(8)
        r_head.font.color.rgb = NAVY

        for rule in mod["rules"]:
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_after = Pt(2)
            brun = bp.add_run(rule)
            brun.font.size = Pt(8)
            brun.font.color.rgb = DARK

    # Sign-off Page
    doc.add_page_break()
    h_sign = doc.add_heading("3. PMO Tool Operational Sign-Off & Implementation Approvals", level=1)
    h_sign.paragraph_format.space_before = Pt(14)
    h_sign.paragraph_format.space_after = Pt(8)
    for r in h_sign.runs:
        r.font.size = Pt(13)
        r.font.color.rgb = NAVY

    p_app = doc.add_paragraph()
    p_app.add_run(
        "By signing below, each designated module lead confirms agreement with the defined documentation workflows, "
        "system lock conditions, and upload schedules for deployment across the HTLS (GETCO 414) and OPGW (KPTCL) "
        "demonstration benchmarks."
    )
    p_app.runs[0].font.size = Pt(9)

    sign_table = doc.add_table(rows=1, cols=4)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_table.autofit = False
    s_widths = [Inches(1.8), Inches(2.0), Inches(1.8), Inches(1.6)]
    s_headers = ["Module Ref & Name", "Designated Lead Owner", "Signature", "Date"]

    s_hdr = sign_table.rows[0].cells
    for i, h in enumerate(s_headers):
        s_hdr[i].text = h
        s_hdr[i].width = s_widths[i]
        set_cell_background(s_hdr[i], "0F172A")
        set_cell_margins(s_hdr[i], top=80, bottom=80, left=70, right=70)
        p = s_hdr[i].paragraphs[0]
        for r in p.runs:
            r.font.size = Pt(8)
            r.font.bold = True
            r.font.color.rgb = WHITE

    sign_rows = [
        ("M-01: Commercial & BGs", "Mr. Nilesh Tiwari", "", ""),
        ("M-02: Golden Activity Period", "Mr. Rakesh Sinha / Mr. Suvesh Pahwa", "", ""),
        ("M-03: Construction Dashboard", "Mr. Rakesh Sinha / Mr. Suvesh Pahwa", "", ""),
        ("M-04: Procurement Module", "Mr. Anand Raval / Mr. Sanjay Sharma", "", ""),
        ("M-05: Credit Control Module", "Mr. Arnab Bose / Mr. Piyush Shah", "", ""),
        ("M-06: Finance Module", "Mr. Milind Soni / Mr. Piyush Gohil", "", ""),
        ("M-07: Document Management", "Mr. Kamal Gandhi", "", ""),
        ("M-08: Inventory Management", "Mr. Gopal Nair / Mr. Sunil Mishra", "", ""),
    ]

    for s_idx, s_data in enumerate(sign_rows):
        cells = sign_table.add_row().cells
        bg = "F8FAFC" if s_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(s_data):
            cells[i].text = val
            cells[i].width = s_widths[i]
            set_cell_background(cells[i], bg)
            set_cell_margins(cells[i], top=120, bottom=120, left=70, right=70)
            p = cells[i].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8)
                if i in [0, 1]:
                    r.font.bold = True

    # Save
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(docs_dir, "ROLE_WISE_DOCUMENT_RESPONSIBILITY_MATRIX.docx")
    doc.save(out_path)
    print(f"SUCCESS: Generated updated DOCX at {out_path} (Size: {os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_streamlined_docx()
