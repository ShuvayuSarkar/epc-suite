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

def set_cell_margins(cell, top=80, bottom=80, left=90, right=90):
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

def generate_simplified_pmo_docx():
    doc = Document()

    # Margins (0.65 in)
    for section in doc.sections:
        section.top_margin = Inches(0.65)
        section.bottom_margin = Inches(0.65)
        section.left_margin = Inches(0.65)
        section.right_margin = Inches(0.65)

    NAVY = RGBColor(15, 23, 42)      # #0f172a
    BLUE = RGBColor(37, 99, 235)     # #2563eb
    SLATE = RGBColor(71, 85, 105)    # #475569
    DARK = RGBColor(30, 41, 59)      # #1e293b
    WHITE = RGBColor(255, 255, 255)

    # Document Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_org = title_p.add_run("APAR INDUSTRIES LIMITED — EPC INFRASTRUCTURE PMO\n")
    run_org.font.size = Pt(10)
    run_org.font.bold = True
    run_org.font.color.rgb = BLUE

    run_title = title_p.add_run("IN-HOUSE PMO TOOL: MODULE-WISE DOCUMENTATION & UI FEATURE MATRIX")
    run_title.font.size = Pt(15)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(10)
    run_sub = sub_p.add_run(
        "Standardized 4-Column Governance Structure for HTLS (GETCO 414) & OPGW (KPTCL) Projects\n"
        "Document Ref: APAR-PMO-SOP-2026-SIMPLIFIED | Version 5.0"
    )
    run_sub.font.size = Pt(9.5)
    run_sub.font.italic = True
    run_sub.font.color.rgb = SLATE

    # Overview
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(10)
    intro_run = intro_p.add_run(
        "Simplified Table Structure: As per management directive, all documentation requirements and system "
        "capabilities are consolidated strictly into four core columns across all modules: Module Name, "
        "Lead Owner, Primary Documentation Scope, and Specific Screen & UI Features."
    )
    intro_run.font.size = Pt(9)
    intro_run.font.color.rgb = DARK

    # Master Simplified Table Data
    master_rows = [
        (
            "1. L1 / LOI / LOA / Contract Agreement / Bank Guarantees Module",
            "Mr. Nilesh Tiwari",
            "• L1 Intimation & Price Bid Evaluation\n• Letter of Award (LOA) / Letter of Intent (LOI)\n• Formal Signed Contract Agreement\n• Authorized Client Mother BOQ Schedule\n• Contract Performance BG (CPBG)\n• Advance Payment BG (APBG)\n• Contract Amendments, Addendums & Variations",
            "• Stage 0 Bidding Win/Loss status card\n• LOA Ingestion modal & Award acceptance form\n• Client Mother BOQ Dynamic Grid (N arbitrary line items)\n• BG Tracker with 60/30/15-day automated expiry alerts\n• Scope Addendum & Variation Order ledger"
        ),
        (
            "2. Golden Activity Period Module (30+60 Days to Ground Break)",
            "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "• 30-Day Pre-LOA Readiness Checklist & Risk Register\n• 60-Day Golden Period Master Action Plan\n• Advance Manufacturing Clearance (Conductor & Stubs)\n• CEIG Statutory Electrical Scheme Approval\n• Principal Employer Form V & CLRA Labour License\n• Central Site Store Readiness Sign-off Certificate\n• 60-Day Ground Break Gate Sign-off Certificate",
            "• 60-Day Live Countdown Progress Banner\n• Readiness Gate Checklist (BRD 2.1 to 2.10 interlocks)\n• Dynamic BOQ Item Advance Allocation Cards\n• Statutory Compliance Vault (CEIG & Form V upload)\n• Central Store Infrastructure Audit Checklist\n• Gate Interlock Engine (Blocks DPR #01 until 100% green)"
        ),
        (
            "3. Construction Dashboard Module",
            "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "• WBS L2 Master Baseline Project Schedule\n• Daily Progress Reports (DPRs - Civil, Erection, Stringing, Splicing)\n• Quality Check Sheets (QCS - Pit, Concreting, Torque, Sagging)\n• Joint Measurement Certificates (JMC)\n• Pre-Commissioning Test Protocols (HTLS / OTDR for OPGW)\n• Taking Over Certificate (TOC) / Operational Handover",
            "• Interactive L2 Gantt Engine with Critical Path tracking\n• Multi-gang DPR Form (Civil/Erection/HTLS Stringing/OPGW)\n• Dual-sign JMC Attachment Modal (APAR + Utility AE)\n• QCS Field Quality Matrix (Cube test, Torque, Sag logs)\n• KPTCL OTDR Attenuation Loss Log Vault (≤0.21 dB/km)\n• TOC Operational Handover Certificate Sign-off"
        ),
        (
            "4. Procurement Module",
            "Mr. Anand Raval /\nMr. Sanjay Sharma",
            "• Quotation Comparison Statement (QCS)\n• Supplier Purchase Orders (PO) & Internal Plant LOIs\n• Factory Inspection Call Notices\n• Factory Acceptance Test (FAT) Reports & MTC Certificates\n• Client Dispatch Instructions (DI)\n• Delivery Proofs, Lorry Receipts (LR) & E-Way Bills\n• Supplier & Labour Gang Invoices with Ageing",
            "• QCS Commercial Bid Evaluator (Compares 3+ vendor quotes)\n• PO Generator locked strictly to Mother BOQ item balances\n• Joint FAT Inspection Scheduler & Nomination Tracker\n• Official Client DI Register & Truck Gate Clearance\n• Transporter Proof Vault (LR, weighbridge slips & e-way bills)\n• 30/60/90-Day Subcontractor & Vendor Payables Ageing Grid"
        ),
        (
            "5. Credit Control Module",
            "Mr. Arnab Bose /\nMr. Piyush Shah",
            "• Client Running Account (RA) Tax Invoices\n• Invoicing to Collections Mapping & Reconciliation Sheet\n• Payment Ageing MIS (Not Due, Due 1-30, 31-60, >90 Days)\n• Bill-wise & Project-wise Receivables MIS\n• Client Payment Advices & Deductions Reconciliation\n• Contractual Billing Milestones Compliance MIS",
            "• Milestone Tax Invoice Generator (Supply 70%/Erection 20%/TOC 10%)\n• Real-time Collection FIFO Mapping Ledger (Principal & GST)\n• Debtor Ageing Filter Tabs (Not Due, 1-30, 31-60, >90 Days)\n• Deductions & Liquidated Damages (LD) Reconciliation Card\n• Client Billing Milestone Realization Velocity Tracker"
        ),
        (
            "6. Finance Module",
            "Mr. Milind Soni /\nMr. Piyush Gohil",
            "• Baseline Cost Budget (CBS - Cost Breakdown Structure)\n• Project-wise Unbilled Revenue MIS (Delivered & WIP)\n• Creditors MIS & Trade Payables Ageing Schedule\n• Bid vs Actual Profitability Variance Analysis Report\n• Business Working Capital GFI & NFI Days Working Sheet",
            "• Cost Breakdown Structure (CBS) Baseline Budget Ledger\n• Unbilled WIP & Delivered Material Revenue Tracker\n• Creditor Trade Payables Ageing & Outflow Schedule\n• Budget vs Actual Cost Variance Analyzer (Material/Labour/Logistics)\n• Automated Working Capital GFI & NFI Day Computation Engine"
        ),
        (
            "7. Document Management System Module",
            "Mr. Kamal Gandhi",
            "• Time Limit Extension (EOT) Claim Packages\n• Notice of Delay Events & Force Majeure Intimations\n• Permit to Work (PTW) / Grid Outage Shutdown Sanctions\n• Subcontractor, Plant & Gang Idling Claims\n• Project Correspondence Register & Master Transmittals",
            "• Contractual Delay Impact Assessment Engine\n• Notice Deadline Expiry Warnings (Preserves 7/14-day notice rights)\n• PTW Live-Line Grid Outage Permit Vault (Mandatory for stringing)\n• Idle Plant & Subcontractor Log Sheet Attacher\n• Central Master Document Register (MDR), Transmittals & CRS Sheets"
        ),
        (
            "8. Inventory Management Module",
            "Mr. Gopal Nair /\nMr. Sunil Mishra",
            "• Daily Stock Ledger & Digital Bin Cards\n• Monthly Material Reconciliation Reports (MRR)\n• Stock Transfer Orders (STO) & Inter-Project Transfer Manifests\n• Tools & Plants (T&P) Inventory Asset Register\n• Tension Stringing Equipment (TSE) Machinery Logs\n• Scrap, Salvage & Surplus Material Disposal Certificates",
            "• Digital Bin Card Ledger with real-time inward/issue balances\n• 3-Way Inwarding Verification Engine (Challan + DI + E-Way Bill)\n• Monthly Physical vs JMC Material Balancing Engine\n• Dual-Confirmation Inter-Project Stock Transfer (STO) Form\n• Tension Stringing Equipment (TSE) Machinery & Calibration Log"
        )
    ]

    # Section 1: Master Overview Table
    h1 = doc.add_heading("1. Master Simplified Module & Feature Matrix", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)
    for r in h1.runs:
        r.font.size = Pt(12)
        r.font.color.rgb = NAVY

    t = doc.add_table(rows=1, cols=4)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    col_widths = [Inches(1.8), Inches(1.3), Inches(2.1), Inches(2.0)]
    headers = ["Module Name", "Lead Owner", "Primary Documentation Scope", "Specific Screen & UI Features"]

    hdr_cells = t.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=90, bottom=90, left=80, right=80)
        p = hdr_cells[i].paragraphs[0]
        for r in p.runs:
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = WHITE

    for row_idx, row_data in enumerate(master_rows):
        cells = t.add_row().cells
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(row_data):
            cells[i].text = val
            cells[i].width = col_widths[i]
            set_cell_background(cells[i], bg)
            set_cell_margins(cells[i], top=60, bottom=60, left=80, right=80)
            p = cells[i].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8)
                if i in [0, 1]:
                    r.font.bold = True
                if i == 0:
                    r.font.color.rgb = DARK

    # Section 2: Individual Module Tables (Strictly 4 Columns)
    h2 = doc.add_heading("2. Granular Module-Wise Tables (Strict 4-Column Format)", level=1)
    h2.paragraph_format.space_before = Pt(16)
    h2.paragraph_format.space_after = Pt(6)
    for r in h2.runs:
        r.font.size = Pt(12)
        r.font.color.rgb = NAVY

    granular_data = [
        {
            "mod_name": "Module 01: L1 / LOI / LOA / Contract Agreement / Bank Guarantees Module",
            "lead": "Mr. Nilesh Tiwari",
            "items": [
                ("L1 Intimation & Price Bid Evaluation", "Stage 0 Bidding Win/Loss status card & evaluation report"),
                ("Letter of Award (LOA) / Letter of Intent (LOI)", "LOA Ingestion modal & Award acceptance form"),
                ("Formal Signed Contract Agreement", "Contract Master Record & Execution metadata"),
                ("Authorized Client Mother BOQ Schedule", "Client Mother BOQ Dynamic Grid (N arbitrary line items)"),
                ("Contract Performance Bank Guarantee (CPBG)", "BG Tracker with 60/30/15-day automated expiry alerts"),
                ("Advance Payment Bank Guarantee (APBG)", "APBG Progressive Mobilization Recovery Ledger"),
                ("Contract Amendments, Addendums & Variations", "Scope Addendum & Variation Order ledger"),
            ]
        },
        {
            "mod_name": "Module 02: Golden Activity Period Module (30+60 Days to Ground Break)",
            "lead": "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "items": [
                ("30-Day Pre-LOA Readiness Checklist & Risk Register", "Pre-LOA Risk Matrix & Subcontractor Readiness Card"),
                ("60-Day Golden Period Master Action Plan", "60-Day Live Countdown Progress Banner & Milestone tracker"),
                ("Advance Manufacturing Clearance (Conductor & Stubs)", "Dynamic BOQ Item Advance Allocation Cards"),
                ("CEIG Statutory Electrical Scheme Approval", "Statutory Compliance Vault (CEIG & Scheme Approval upload)"),
                ("Principal Employer Form V & CLRA Labour License", "Labour Compliance Tab (Form V & 150-Workmen CLRA license)"),
                ("Central Site Store Readiness Sign-off Certificate", "Central Store Infrastructure Audit Checklist (5-acre yard, fence, crane)"),
                ("60-Day Ground Break Gate Sign-off Certificate", "Gate Interlock Engine (Blocks DPR #01 until 100% green)"),
            ]
        },
        {
            "mod_name": "Module 03: Construction Dashboard Module",
            "lead": "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "items": [
                ("WBS L2 Master Baseline Project Schedule", "Interactive L2 Gantt Engine with Critical Path tracking"),
                ("Daily Progress Reports (DPRs - Civil, Erection, Stringing, Splicing)", "Multi-gang DPR Form (Civil/Erection/HTLS Stringing/OPGW)"),
                ("Quality Check Sheets (QCS - Pit, Concreting, Torque, Sagging)", "QCS Field Quality Matrix (Cube test, Torque, Sag logs)"),
                ("Joint Measurement Certificates (JMC)", "Dual-sign JMC Attachment Modal (APAR + Utility AE)"),
                ("Pre-Commissioning Test Protocols (HTLS / OTDR for OPGW)", "KPTCL OTDR Attenuation Loss Log Vault (≤0.21 dB/km) & Pre-charging"),
                ("Taking Over Certificate (TOC) / Operational Handover", "TOC Operational Handover Certificate Sign-off"),
            ]
        },
        {
            "mod_name": "Module 04: Procurement Module",
            "lead": "Mr. Anand Raval /\nMr. Sanjay Sharma",
            "items": [
                ("Quotation Comparison Statement (QCS)", "QCS Commercial Bid Evaluator (Compares 3+ vendor quotes)"),
                ("Supplier Purchase Orders (PO) & Internal Plant LOIs", "PO Generator locked strictly to Mother BOQ item balances"),
                ("Factory Inspection Call Notices", "Joint FAT Inspection Scheduler & Nomination Tracker"),
                ("Factory Acceptance Test (FAT) Reports & MTC Certificates", "FAT Mapping Card (Validates UTS, resistance, galvanizing)"),
                ("Client Dispatch Instructions (DI)", "Official Client DI Register & Truck Gate Clearance"),
                ("Delivery Proofs, Lorry Receipts (LR) & E-Way Bills", "Transporter Proof Vault (LR, weighbridge slips & e-way bills)"),
                ("Supplier & Labour Gang Invoices with Ageing", "30/60/90-Day Subcontractor & Vendor Payables Ageing Grid"),
            ]
        },
        {
            "mod_name": "Module 05: Credit Control Module",
            "lead": "Mr. Arnab Bose /\nMr. Piyush Shah",
            "items": [
                ("Client Running Account (RA) Tax Invoices", "Milestone Tax Invoice Generator (Supply 70%/Erection 20%/TOC 10%)"),
                ("Invoicing to Collections Mapping & Reconciliation Sheet", "Real-time Collection FIFO Mapping Ledger (Principal & GST)"),
                ("Payment Ageing MIS (Not Due, Due 1-30, 31-60, >90 Days)", "Debtor Ageing Filter Tabs (Not Due, 1-30, 31-60, >90 Days)"),
                ("Bill-wise & Project-wise Receivables MIS", "Receivables Velocity Card & Project-wise Realization MIS"),
                ("Client Payment Advices & Deductions Reconciliation", "Deductions & Liquidated Damages (LD) Reconciliation Card"),
                ("Contractual Billing Milestones Compliance MIS", "Client Billing Milestone Realization Velocity Tracker"),
            ]
        },
        {
            "mod_name": "Module 06: Finance Module",
            "lead": "Mr. Milind Soni /\nMr. Piyush Gohil",
            "items": [
                ("Baseline Cost Budget (CBS - Cost Breakdown Structure)", "Cost Breakdown Structure (CBS) Baseline Budget Ledger"),
                ("Project-wise Unbilled Revenue MIS (Delivered & WIP)", "Unbilled WIP & Delivered Material Revenue Tracker"),
                ("Creditors MIS & Trade Payables Ageing Schedule", "Creditor Trade Payables Ageing & Outflow Schedule"),
                ("Bid vs Actual Profitability Variance Analysis Report", "Budget vs Actual Cost Variance Analyzer (Material/Labour/Logistics)"),
                ("Business Working Capital GFI & NFI Days Working Sheet", "Automated Working Capital GFI & NFI Day Computation Engine"),
            ]
        },
        {
            "mod_name": "Module 07: Document Management System Module",
            "lead": "Mr. Kamal Gandhi",
            "items": [
                ("Time Limit Extension (EOT) Claim Packages", "Contractual Delay Impact Assessment Engine & L2 Impact"),
                ("Notice of Delay Events & Force Majeure Intimations", "Notice Deadline Expiry Warnings (Preserves 7/14-day notice rights)"),
                ("Permit to Work (PTW) / Grid Outage Shutdown Sanctions", "PTW Live-Line Grid Outage Permit Vault (Mandatory for stringing)"),
                ("Subcontractor, Plant & Gang Idling Claims", "Idle Plant & Subcontractor Log Sheet Attacher"),
                ("Project Correspondence Register & Master Transmittals", "Central Master Document Register (MDR), Transmittals & CRS Sheets"),
            ]
        },
        {
            "mod_name": "Module 08: Inventory Management Module",
            "lead": "Mr. Gopal Nair /\nMr. Sunil Mishra",
            "items": [
                ("Daily Stock Ledger & Digital Bin Cards", "Digital Bin Card Ledger with real-time inward/issue balances"),
                ("Monthly Material Reconciliation Reports (MRR)", "Monthly Physical vs JMC Material Balancing Engine"),
                ("Stock Transfer Orders (STO) & Inter-Project Transfer Manifests", "Dual-Confirmation Inter-Project Stock Transfer (STO) Form"),
                ("Tools & Plants (T&P) Inventory Asset Register", "T&P Light Equipment & Safety Gear Tracking Register"),
                ("Tension Stringing Equipment (TSE) Machinery Logs", "TSE Heavy Machinery Deployment & Calibration Tracker"),
                ("Scrap, Salvage & Surplus Material Disposal Certificates", "Scrap & Empty Wooden Drum Disposal Sign-off Form"),
            ]
        }
    ]

    for g in granular_data:
        h3 = doc.add_heading(g["mod_name"], level=2)
        h3.paragraph_format.space_before = Pt(10)
        h3.paragraph_format.space_after = Pt(2)
        for r in h3.runs:
            r.font.size = Pt(10)
            r.font.color.rgb = BLUE

        t_sub = doc.add_table(rows=1, cols=4)
        t_sub.alignment = WD_TABLE_ALIGNMENT.CENTER
        t_sub.autofit = False

        hdr_sub = t_sub.rows[0].cells
        for idx, head_text in enumerate(headers):
            hdr_sub[idx].text = head_text
            hdr_sub[idx].width = col_widths[idx]
            set_cell_background(hdr_sub[idx], "1E293B")
            set_cell_margins(hdr_sub[idx], top=70, bottom=70, left=80, right=80)
            p = hdr_sub[idx].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(8)
                r.font.bold = True
                r.font.color.rgb = WHITE

        for idx, (doc_item, feat_item) in enumerate(g["items"]):
            cells = t_sub.add_row().cells
            bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
            
            cells[0].text = g["mod_name"] if idx == 0 else ""
            cells[1].text = g["lead"] if idx == 0 else ""
            cells[2].text = doc_item
            cells[3].text = feat_item

            for i in range(4):
                cells[i].width = col_widths[i]
                set_cell_background(cells[i], bg)
                set_cell_margins(cells[i], top=50, bottom=50, left=80, right=80)
                p = cells[i].paragraphs[0]
                for r in p.runs:
                    r.font.size = Pt(7.5)
                    if i in [0, 1] and idx == 0:
                        r.font.bold = True
                    elif i == 2:
                        r.font.bold = True
                        r.font.color.rgb = DARK

    # Section 3: Sign-off block
    doc.add_page_break()
    h_sign = doc.add_heading("3. Operational Governance & Lead Owner Implementation Sign-Off", level=1)
    h_sign.paragraph_format.space_before = Pt(14)
    h_sign.paragraph_format.space_after = Pt(8)
    for r in h_sign.runs:
        r.font.size = Pt(12)
        r.font.color.rgb = NAVY

    p_app = doc.add_paragraph()
    p_app.add_run(
        "By signing below, each designated module lead confirms agreement with the defined 4-column "
        "documentation and UI feature mapping for deployment across HTLS (GETCO 414) and OPGW (KPTCL) projects."
    )
    p_app.runs[0].font.size = Pt(9)

    sign_table = doc.add_table(rows=1, cols=4)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_table.autofit = False
    s_widths = [Inches(1.8), Inches(2.0), Inches(1.8), Inches(1.6)]
    s_headers = ["Module Name", "Lead Owner", "Signature", "Date"]

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
        ("1. Commercial & BGs Module", "Mr. Nilesh Tiwari", "", ""),
        ("2. Golden Activity Period Module", "Mr. Rakesh Sinha / Mr. Suvesh Pahwa", "", ""),
        ("3. Construction Dashboard Module", "Mr. Rakesh Sinha / Mr. Suvesh Pahwa", "", ""),
        ("4. Procurement Module", "Mr. Anand Raval / Mr. Sanjay Sharma", "", ""),
        ("5. Credit Control Module", "Mr. Arnab Bose / Mr. Piyush Shah", "", ""),
        ("6. Finance Module", "Mr. Milind Soni / Mr. Piyush Gohil", "", ""),
        ("7. Document Management System", "Mr. Kamal Gandhi", "", ""),
        ("8. Inventory Management Module", "Mr. Gopal Nair / Mr. Sunil Mishra", "", ""),
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
    print(f"SUCCESS: Generated simplified 4-column DOCX at {out_path} (Size: {os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    generate_simplified_pmo_docx()
