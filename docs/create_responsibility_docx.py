import os
import sys

try:
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml import OxmlElement, parse_xml
    from docx.oxml.ns import nsdecls, qn
except ImportError:
    print("python-docx not yet available.")
    sys.exit(1)

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_document():
    doc = Document()

    # Set page margins (Normal - 0.75 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Palette
    NAVY = RGBColor(15, 23, 42)      # #0f172a
    BLUE = RGBColor(37, 99, 235)     # #2563eb
    SLATE = RGBColor(71, 85, 105)    # #475569
    DARK = RGBColor(30, 41, 59)      # #1e293b
    WHITE = RGBColor(255, 255, 255)

    # Document Header Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_org = title_p.add_run("APAR INDUSTRIES LIMITED — EPC INFRASTRUCTURE DIVISION\n")
    run_org.font.size = Pt(10)
    run_org.font.bold = True
    run_org.font.color.rgb = BLUE

    run_title = title_p.add_run("ROLE-WISE DOCUMENT RESPONSIBILITY & MAINTENANCE MATRIX")
    run_title.font.size = Pt(18)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Standard Operating Procedure for 60-Day Golden Period & Turnkey Execution · SOP-EPC-DOC-01")
    run_sub.font.size = Pt(10)
    run_sub.font.italic = True
    run_sub.font.color.rgb = SLATE

    # Overview box / Callout
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(12)
    intro_run = intro_p.add_run(
        "Purpose: This document defines the definitive mapping between project roles, designated personas, "
        "and the critical contractual, technical, and statutory documents that must be uploaded, tracked, "
        "and maintained within the EPC Suite system to clear gate clearances and hit the ground in 60 days."
    )
    intro_run.font.size = Pt(9.5)
    intro_run.font.color.rgb = DARK

    # Heading 1: Summary Table
    h1 = doc.add_heading("1. Master Role-to-Document Quick Reference", level=1)
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    for r in h1.runs:
        r.font.size = Pt(13)
        r.font.color.rgb = NAVY

    summary_data = [
        ("1", "Bid & Marketing Manager", "Amit Patel", "/contracts, /golden-period/dispatches", "Letter of Award (LOA), Utility Inspector Nomination, Dispatch Instruction (DI)"),
        ("2", "Contracts & Legal Manager", "Rahul Mehta / Akash Dubey", "/contracts (Client BOQ)", "Signed Contract Agreement, Mother BOQ Schedule, Scope Variations"),
        ("3", "Treasury & Finance Manager", "Gaurav Chawla / Neha Gupta", "/golden-period/bank-guarantees", "Contract Performance BG (CPBG), Mobilization Advance BG (APBG)"),
        ("4", "Project Director / Manager", "Sunil Verma / Priya Sharma", "/wbs, /golden-period", "L2 Baseline WBS Schedule, 60-Day Gate Sign-off, EOT Delay Claims"),
        ("5", "Lead Design & Survey", "Vikram Singh / Arun Mishra", "/site-surveys, /transmittals, /crs", "Check Survey, Tower Spotting Schedule, Profile Drawings, CRS Sheets"),
        ("6", "SCM & Procurement Manager", "Ravi Tiwari / Shuv Sarkar", "/golden-period/manufacturing-clearance", "Internal Plant LOI (Conductor), Buyout POs (Stubs, Towers, HW), Inspection Calls"),
        ("7", "Statutory & Compliance Officer", "Meera Pillai", "/golden-period/statutory", "Principal Employer Form V, CLRA Labour License, CEIG Electrical Approval"),
        ("8", "HSE & Safety Officer", "Anita Reddy", "/golden-period/insurance, /safety", "Workmen Compensation (WC), CAR Insurance, Toolbox Talks (TBT), Safety Audits"),
        ("9", "QA/QC Inspector", "Deepa Nair", "/qa-qc/inspections, /qa-qc/ncr", "Factory Acceptance Test (FAT) Reports, MTC Certificates, NCR Quality Logs"),
        ("10", "Store / Inventory Controller", "Manoj Desai", "/golden-period/stores, /inventory", "Site Store Readiness Certificate, Material Receipt Notes (MRN), Issue Slips"),
        ("11", "Site Gang Supervisor", "Suresh Yadav", "/installation/dpr, /gangs", "Daily Progress Reports (DPR #01), Stub Setting & Leveling Logs, JMCs"),
    ]

    table = doc.add_table(rows=1, cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(0.4), Inches(1.6), Inches(1.4), Inches(1.6), Inches(2.0)]
    headers = ["#", "Role Title", "Persona / User", "System Module Route", "Primary Documents Handled"]

    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = WHITE

    for row_idx, row_data in enumerate(summary_data):
        row_cells = table.add_row().cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(row_data):
            row_cells[i].text = val
            row_cells[i].width = col_widths[i]
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i], top=80, bottom=80, left=100, right=100)
            p = row_cells[i].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8.5)
                if i == 0:
                    r.font.bold = True
                elif i == 1:
                    r.font.bold = True
                    r.font.color.rgb = DARK

    # Detailed Roles Breakdown
    h2_master = doc.add_heading("2. Detailed Role-Wise Document & Maintenance Breakdown", level=1)
    h2_master.paragraph_format.space_before = Pt(18)
    h2_master.paragraph_format.space_after = Pt(8)
    for r in h2_master.runs:
        r.font.size = Pt(13)
        r.font.color.rgb = NAVY

    role_details = [
        {
            "role": "1. Bid & Marketing Manager",
            "persona": "Amit Patel (Head - Tendering & Bids)",
            "module": "/contracts, /golden-period/dispatches",
            "docs": [
                ("DOC-01", "Letter of Award (LOA)", "Day 1", "L1 Bid Opening & Commercial Declaration", "Initializes Project container, starts 60-Day countdown, unlocks CPBG & contract drafting"),
                ("DOC-11", "Utility Inspector Nomination", "Day 30", "Inspection Call notice raised by SCM", "Fixes joint factory FAT date with Client Inspecting Officer"),
                ("DOC-13", "Utility Dispatch Instruction (DI)", "Day 48", "Signed FAT Report submitted to Client", "CORE LOCK: Authorizes factory gates to dispatch trucks to central site store"),
            ],
            "maintenance": [
                "Maintain active client communications and record official utility clarification letters.",
                "Follow up with utility Chief Engineer for timely inspector nominations and DI release.",
                "Reconcile authorized DI quantities against Mother BOQ items and factory packing lists."
            ]
        },
        {
            "role": "2. Contracts & Legal Manager",
            "persona": "Rahul Mehta / Akash Dubey (Contracts & Legal)",
            "module": "/contracts (Client BOQ Items Tab)",
            "docs": [
                ("DOC-03", "Signed Contract & Mother BOQ", "Day 10", "LOA + Verified CPBG submission", "CORE LOCK: Locks Mother BOQ in system; sets hard budget ceiling for all downstream POs"),
                ("DOC-VAR", "Scope Amendments & Variations", "As needed", "Client-approved scope/alignment variation", "Updates contract item quantities, rates, and values dynamically"),
            ],
            "maintenance": [
                "Reconcile cumulative internal LOIs and supplier POs against authorized Mother BOQ line balances.",
                "Maintain contract clauses, LD waiver records, and price variation (PV) billing index formulas."
            ]
        },
        {
            "role": "3. Treasury & Finance Manager",
            "persona": "Gaurav Chawla / Neha Gupta (Treasury & Finance)",
            "module": "/golden-period/bank-guarantees, /finance",
            "docs": [
                ("DOC-02", "Contract Performance BG (CPBG)", "Day 7 (≤15d)", "LOA terms & Bank credit sanction limit", "Unlocks formal Contract Agreement signing & 10% Mobilization Advance claim"),
                ("DOC-ABG", "Advance Payment BG (APBG)", "Day 15", "Contract mobilization advance clause", "Enables release of mobilization advance from utility into project account"),
            ],
            "maintenance": [
                "Monitor Bank Guarantee expiry dates, extension requirements, and 6-month claim periods.",
                "Track progressive recovery of mobilization advance from monthly running account (RA) bills."
            ]
        },
        {
            "role": "4. Project Director & Project Manager",
            "persona": "Sunil Verma (Project Director) / Priya Sharma (Project Manager)",
            "module": "/wbs, /golden-period",
            "docs": [
                ("DOC-04", "L2 Baseline WBS Schedule", "Day 12", "Contract milestones & Mother BOQ", "Establishes project critical path & milestone tracking baselines"),
                ("DOC-16A", "60-Day Golden Period Gate Sign-off", "Day 60", "Verification of all 15 prerequisites (100% green)", "DAY 60 GATE: Formal authorization to commence excavation and stub setting"),
            ],
            "maintenance": [
                "Conduct weekly physical vs. financial progress S-curve reviews.",
                "Manage delay event logs, critical path shifts, and contractual Extension of Time (EOT) notices."
            ]
        },
        {
            "role": "5. Lead Design Engineer & Survey Team",
            "persona": "Vikram Singh (Lead Design) / Arun Mishra (Lead Surveyor)",
            "module": "/site-surveys, /transmittals, /crs",
            "docs": [
                ("DOC-05", "Check Survey & Tower Spotting", "Day 15-25", "Walkover survey & GPS corridor alignment", "Freezes tower type BOM, stub lengths, and pit excavation coordinates"),
                ("DOC-TR", "Drawing Transmittals (Rev 0 / A)", "Continuous", "Profile, foundation, and structural designs", "Submits design deliverables to Client/PMC under document control numbering"),
                ("DOC-CRS", "Comment Response Sheets (CRS)", "≤7 days", "Client review comments on drawings", "Formally closes technical remarks to achieve Approved for Construction (AFC) status"),
            ],
            "maintenance": [
                "Maintain Master Drawing Register (MDR) and revision history logs.",
                "Revise tower spotting profiles and stub extensions upon encountering site terrain variations."
            ]
        },
        {
            "role": "6. SCM & Procurement Manager",
            "persona": "Ravi Tiwari / Shuv Sarkar (SCM & Procurement)",
            "module": "/golden-period/manufacturing-clearance, /golden-period/vendors",
            "docs": [
                ("DOC-06", "Internal Plant LOI (Conductor)", "Day 15", "Locked Mother BOQ Item 01 (Conductor)", "Reserves aluminium ingot allocation, wire rod rolling & stranding plant slots"),
                ("DOC-07", "Vendor Buyout POs (Stubs/Hardware)", "Day 20", "Approved vendor nomination & BOQ validation", "Authorizes factory fabrication of 240 stub sets and long-lead hardware"),
                ("DOC-CALL", "Factory Inspection Call Notice", "Lot ready", "Vendor/Plant internal quality clearance", "Triggers formal nomination of utility inspecting officer"),
            ],
            "maintenance": [
                "Track vendor manufacturing progress, factory slot commitments, and delivery dispatch dates.",
                "Ensure cumulative PO commitments do not breach authorized Mother BOQ line limits."
            ]
        },
        {
            "role": "7. Statutory & Compliance Officer",
            "persona": "Meera Pillai (Compliance Officer)",
            "module": "/golden-period/statutory",
            "docs": [
                ("DOC-08", "Principal Employer Form V", "Day 20", "Signed Contract with Utility (MSETCL)", "Mandatory statutory prerequisite to file for State Labour Commissioner CLRA license"),
                ("DOC-09A", "Labour License (CLRA)", "Day 35", "Form V certificate + valid WC & CAR Insurance", "STATUTORY GATE: Legal authorization to mobilize and deploy contract workmen on site"),
                ("DOC-10", "CEIG Electrical Scheme Approval", "Day 35", "Class-A Electrical Contractor License & SLD", "STATUTORY GATE: Clearance to construct high-voltage lines and execute crossings"),
            ],
            "maintenance": [
                "Maintain monthly statutory registers (muster rolls, wage registers, EPF/ESIC remittance receipts).",
                "Monitor validity of CEIG clearances, forest permissions, and railway crossing approvals."
            ]
        },
        {
            "role": "8. HSE & Safety Officer",
            "persona": "Anita Reddy (Safety / HSE Officer)",
            "module": "/golden-period/insurance, /safety",
            "docs": [
                ("DOC-09B", "Workmen Compensation (WC) Policy", "Day 25", "Manpower deployment plan & headcount", "Mandatory attachment for CLRA license; covers worker accident liabilities"),
                ("DOC-CAR", "Contractor's All Risk (CAR) Policy", "Day 25", "Total contract award value", "Insurance covering damage to site materials, stubs, and third-party liabilities"),
                ("DOC-TBT", "Toolbox Talks & Safety Audits", "Daily/Weekly", "Site work activity initiation", "Logs safety briefings, PPE enforcement, and incident prevention protocols"),
            ],
            "maintenance": [
                "Maintain zero-incident safety logs, near-miss incident registers, and PPE compliance records.",
                "Ensure insurance policy endorsements are executed whenever contractor manpower expands."
            ]
        },
        {
            "role": "9. QA/QC Inspector",
            "persona": "Deepa Nair (Lead QA/QC Inspector)",
            "module": "/qa-qc/inspections, /qa-qc/ncr",
            "docs": [
                ("DOC-12", "Factory Acceptance Test (FAT) Report", "Day 42", "Joint testing witnessed with Utility Inspector", "Delivered to Marketing to apply for official Client Dispatch Instruction (DI)"),
                ("DOC-MTC", "Manufacturer Test Certificates (MTC)", "With FAT", "Mill test certificates for steel, zinc, aluminium", "Validates raw material chemical composition, UTS, and galvanizing quality"),
                ("DOC-NCR", "Non-Conformance Reports (NCR)", "On defect", "Quality deviation during factory/site testing", "Blocks material dispatch or site work until corrective action is verified"),
            ],
            "maintenance": [
                "Maintain inspection call records, signed FAT certificates, and calibration test sheets.",
                "Conduct site quality audits (pit dimensions, concrete slump tests, 7/28-day cube strength tests)."
            ]
        },
        {
            "role": "10. Store Manager & Inventory Controller",
            "persona": "Manoj Desai (Store Manager / Inventory Controller)",
            "module": "/golden-period/stores, /inventory",
            "docs": [
                ("DOC-14", "Site Store Readiness Certificate", "Day 50", "Yard lease, fencing, 24x7 guards, crane, shed", "Certifies central yard ready for receipt; clears physical store gate"),
                ("DOC-15", "Material Receipt Note (MRN)", "Day 55", "Arrival of trucks under DI + e-way bills", "Inwards stubs, conductor, and cement into inventory for site gang issue"),
                ("DOC-MIN", "Material Issue Note (MIN)", "Daily", "Requisition signed by Gang Supervisor", "Formally issues stubs and template fixtures to specific tower locations"),
            ],
            "maintenance": [
                "Maintain digital bin cards, daily physical stock ledgers, and scrap registers.",
                "Conduct weekly physical vs. ERP system inventory reconciliations."
            ]
        },
        {
            "role": "11. Site Gang Supervisor & Execution Team",
            "persona": "Suresh Yadav (Site Gang Supervisor)",
            "module": "/installation/dpr, /gangs",
            "docs": [
                ("DOC-16B", "Daily Progress Report (DPR #01)", "Day 60", "Day 60 Gate sign-off + Stubs in Store", "Records center marking, pit excavation, and stub alignment at Location AP-01"),
                ("DOC-STUB", "Stub Setting & Leveling Record", "On setting", "Pit excavation complete + stubs issued", "Ensures diagonal, level, and template pitch verification before concrete pour"),
                ("DOC-JMC", "Joint Measurement Certificate (JMC)", "Monthly", "Completed excavation, RCC, erection, stringing", "Signed jointly with Utility Site Engineer; primary backup for monthly billing"),
            ],
            "maintenance": [
                "Log daily gang manpower, machine utilization, weather hindrances, and executed quantities.",
                "Maintain concrete cube test registers (7-day and 28-day compressive strengths)."
            ]
        }
    ]

    for role_info in role_details:
        h3 = doc.add_heading(role_info["role"], level=2)
        h3.paragraph_format.space_before = Pt(14)
        h3.paragraph_format.space_after = Pt(4)
        for r in h3.runs:
            r.font.size = Pt(11.5)
            r.font.color.rgb = BLUE

        meta_p = doc.add_paragraph()
        meta_p.paragraph_format.space_after = Pt(4)
        m_run1 = meta_p.add_run("Assigned Persona: ")
        m_run1.font.bold = True
        m_run1.font.size = Pt(9)
        m_run2 = meta_p.add_run(role_info["persona"] + "  |  ")
        m_run2.font.size = Pt(9)
        m_run3 = meta_p.add_run("Module Route: ")
        m_run3.font.bold = True
        m_run3.font.size = Pt(9)
        m_run4 = meta_p.add_run(role_info["module"])
        m_run4.font.size = Pt(9)
        m_run4.font.color.rgb = SLATE

        t = doc.add_table(rows=1, cols=5)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        t_widths = [Inches(0.8), Inches(1.8), Inches(0.8), Inches(1.8), Inches(2.0)]
        t_headers = ["Code", "Document Name", "Target SLA", "Prerequisite (Input)", "Downstream Output / Gate"]

        hdr = t.rows[0].cells
        for idx, head_text in enumerate(t_headers):
            hdr[idx].text = head_text
            hdr[idx].width = t_widths[idx]
            set_cell_background(hdr[idx], "1E293B")
            set_cell_margins(hdr[idx], top=80, bottom=80, left=80, right=80)
            p = hdr[idx].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8)
                r.font.bold = True
                r.font.color.rgb = WHITE

        for d_idx, doc_row in enumerate(role_info["docs"]):
            row_cells = t.add_row().cells
            bg = "F8FAFC" if d_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell_value in enumerate(doc_row):
                row_cells[c_idx].text = cell_value
                row_cells[c_idx].width = t_widths[c_idx]
                set_cell_background(row_cells[c_idx], bg)
                set_cell_margins(row_cells[c_idx], top=60, bottom=60, left=80, right=80)
                p = row_cells[c_idx].paragraphs[0]
                for r in p.runs:
                    r.font.size = Pt(8)
                    if c_idx == 0:
                        r.font.bold = True
                    elif c_idx == 1:
                        r.font.bold = True
                        r.font.color.rgb = DARK

        # Ongoing Maintenance
        maint_head = doc.add_paragraph()
        maint_head.paragraph_format.space_before = Pt(6)
        maint_head.paragraph_format.space_after = Pt(2)
        m_run = maint_head.add_run("Ongoing Maintenance & System Audit Responsibilities:")
        m_run.font.bold = True
        m_run.font.size = Pt(8.5)
        m_run.font.color.rgb = DARK

        for item in role_info["maintenance"]:
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_after = Pt(2)
            brun = bp.add_run(item)
            brun.font.size = Pt(8)
            brun.font.color.rgb = DARK

    # Save
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(docs_dir, "ROLE_WISE_DOCUMENT_RESPONSIBILITY_MATRIX.docx")
    doc.save(out_path)
    print(f"SUCCESS: Generated DOCX at {out_path} (Size: {os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_document()
