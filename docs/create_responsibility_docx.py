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

def set_cell_margins(cell, top=70, bottom=70, left=80, right=80):
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

def generate_precise_pmo_docx():
    doc = Document()

    # Margins (0.6 in for wide table layout)
    for section in doc.sections:
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)
        section.left_margin = Inches(0.6)
        section.right_margin = Inches(0.6)

    NAVY = RGBColor(15, 23, 42)      # #0f172a
    BLUE = RGBColor(37, 99, 235)     # #2563eb
    SLATE = RGBColor(71, 85, 105)    # #475569
    DARK = RGBColor(30, 41, 59)      # #1e293b
    WHITE = RGBColor(255, 255, 255)

    # Document Header
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_org = title_p.add_run("APAR INDUSTRIES LIMITED — EPC INFRASTRUCTURE PMO\n")
    run_org.font.size = Pt(10)
    run_org.font.bold = True
    run_org.font.color.rgb = BLUE

    run_title = title_p.add_run("IN-HOUSE PMO TOOL: DATA ENTRY FIELDS & DOCUMENT MAPPING MANUAL")
    run_title.font.size = Pt(15)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(8)
    run_sub = sub_p.add_run(
        "Standardized Module Data Entry Schema & Attachment Requirements for EPC Projects\n"
        "Document Ref: APAR-PMO-SCHEMA-2026-REV7 | Version 7.0"
    )
    run_sub.font.size = Pt(9)
    run_sub.font.italic = True
    run_sub.font.color.rgb = SLATE

    # Overview
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(8)
    intro_run = intro_p.add_run(
        "Operational Architecture & Field Specification: This document outlines the comprehensive data entry fields, "
        "document attachments, and user interface screens for each core module of the In-House PMO Tool. "
        "Specific dummy numbers and sample figures have been eliminated to provide a pure, production-ready schema "
        "definition that lead owners can apply across any EPC transmission line, substation, or cabling project."
    )
    intro_run.font.size = Pt(8.5)
    intro_run.font.color.rgb = DARK

    # Master Table (Strict 4 Columns)
    h1 = doc.add_heading("1. Master Module-Wise Data Entry & Document Mapping Matrix", level=1)
    h1.paragraph_format.space_before = Pt(10)
    h1.paragraph_format.space_after = Pt(4)
    for r in h1.runs:
        r.font.size = Pt(11.5)
        r.font.color.rgb = NAVY

    master_data = [
        (
            "1. Commercial & Bank Guarantees Module",
            "Mr. Nilesh Tiwari",
            "• DATA ENTRY FIELDS:\n"
            "  - Bid Evaluation: Bid ID, Client Name, Project Classification/Type, Total Quoted Tender Value, L1 Evaluation Status, Competitor Names, Competitor Quoted Rates & Variance.\n"
            "  - LOA / LOI Ingestion: Award ID, Award Letter Ref Number, Award Date, Total Contract Value, Project Tenure (Months), Defect Liability Period (DLP).\n"
            "  - Contract Master & Mother BOQ: Contract Ref Number, Execution Date, Liquidated Damages (LD) %, Retention %, Mother BOQ Grid (Item Code, Description, UOM, Contracted Qty, Basic Rate, Amount, GST %).\n"
            "  - Contract Performance BG (CPBG): BG Number, Issuing Bank & Branch, BG Amount (Value & % of Contract), Issue Date, Expiry/Validity Date, Claim Expiry Date.\n"
            "  - Advance Payment BG (APBG): BG Number, Issuing Bank & Branch, Advance Amount Covered, Expiry Date, Recovery Milestone / Threshold.\n"
            "  - Contract Scope Variations: Addendum Ref Number, Reason for Variation, Quantity Revisions (+/-) per Mother BOQ Item, Approved Financial Variance.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Commercial Bid Opening Summary / Evaluation Sheet\n"
            "  - Official Client Letter of Award (LOA) / Letter of Intent (LOI)\n"
            "  - Executed Contract Agreement with Signed GCC & SCC\n"
            "  - Scanned Bank Guarantee Bonds (CPBG & APBG) with Bank Confirmation Letters\n"
            "  - Client Approved Scope Variation Orders & Addendums",
            "• /bidding (BidDetail.tsx): Stage 0 Bidding Win/Loss status card & Cost estimate breakdown\n\n"
            "• /award/new (NewAward.tsx): Wizard Step 1 'Award Receipt' & Step 2 'Acceptance Letter'\n\n"
            "• /contracts (ContractList.tsx): Contract Master Record & 'Client BOQ Items' dynamic tab (locks budget ceilings)\n\n"
            "• /golden-period/bank-guarantees (BankGuaranteeTracker.tsx): '+ Submit BG' modal with 60/30/15-day automated expiry alerts\n\n"
            "• /po-amendments (POAmendmentList.tsx): Scope Variation & Contract Addendum ledger"
        ),
        (
            "2. Golden Activity Period Module (30+60 Days)",
            "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "• DATA ENTRY FIELDS:\n"
            "  - 30-Day Pre-LOA Walkover: Route Alignment Length, Terrain Breakdown (Plain, Hilly, Forest, Highway/River Crossings), Prequalified Subcontractor Gang IDs, Raw Material Ingot Hedging Status.\n"
            "  - 60-Day Milestone Action Plan: Milestone WBS Code, Sequence Number, Activity Description, Duration (Days), Planned Start Date, Planned Finish Date, Predecessor Dependencies, Critical Path Flag.\n"
            "  - Advance Manufacturing Clearance: Mother BOQ Line Item Selection, Cleared Manufacturing Quantity, Designated Manufacturing Plant / Unit, Target Dispatch Week.\n"
            "  - CEIG Electrical Sanction: Application Ref Number, Submission Date, Electrical Contractor License Number & Validity, Approved Crossings (Railways, Highways, Power Lines).\n"
            "  - Principal Employer Form V & CLRA: Form V Ref Number, Issue Date, Maximum Approved Contract Labour Capacity, CLRA License Number, Validity Period.\n"
            "  - Central Store Readiness: Storage Yard Land Area, Perimeter Fencing Type, Security Guard Headcount, Handling Equipment / Crane Details, Sleeper Bed Capacity.\n"
            "  - Day-60 Stage Gate Sign-Off: Review Date, Prerequisite Checklist Status (BOQ, CPBG, Stubs, CEIG, Form V, Store), Readiness Verdict (Approved / Conditional / Rejected), Signatory Remarks.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Pre-Award Walkover Survey Report & Risk Assessment Matrix\n"
            "  - Baseline 60-Day Master Milestone Schedule (.mpp / Gantt)\n"
            "  - Advance Manufacturing Clearance Letters / LOIs\n"
            "  - CEIG Scheme Approval Letter & Electrical Drawing Schemes\n"
            "  - Principal Employer Form V & Labour Commissioner CLRA License\n"
            "  - Central Store Infrastructure Audit Report & Geo-tagged Site Photos\n"
            "  - Day-60 Stage Gate Readiness Sign-Off Memo\n"
            "  - CAR & Workmen Compensation Insurance Policy Copies",
            "• /golden-period (GoldenPeriodDashboard.tsx): Live 60-Day countdown timer banner & BRD 2.1 to 2.10 readiness checklist\n\n"
            "• /golden-period/manufacturing-clearance: Dynamic BOQ allocation cards (computes ordered vs remaining balances)\n\n"
            "• /golden-period/statutory (StatutoryVerification.tsx): 2-Track Statutory Vault (Track A: CEIG, Track B: Form V/CLRA)\n\n"
            "• /golden-period/stores (StoreSetupTracker.tsx): Yard infrastructure checklist with photo upload proof\n\n"
            "• /golden-period/insurance (InsuranceTracker.tsx): CAR & Workmen Compensation policy register\n\n"
            "• Gate Interlock Engine: System physically blocks DPR #01 (Excavation) until Gate Sign-off is executed"
        ),
        (
            "3. Construction Dashboard Module",
            "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "• DATA ENTRY FIELDS:\n"
            "  - L2 Master Schedule Baseline: WBS Activity Codes, Stage Categorization (Civil, Erection, Stringing, Testing), Planned Start & End Dates, Planned Daily Productive Rates, Resource Allocations.\n"
            "  - Daily Progress Reports (DPR): DPR Date, Project Section / Segment, Gang ID, Activity Executed, Tower / Location ID, Daily Executed Quantity, Manpower Headcount, Equipment Operating Hours, Weather Condition, Idle Hours & Stoppage Reason, GPS Coordinates (Latitude/Longitude).\n"
            "  - Quality Check Sheets (QCS): QCS Record ID, Tower Location ID, Activity Stage, Inspection Parameters (Diagonal Tolerances, Pit Depth, Slump, Cube Crushing Strength 7d/28d, Torque Values), Verdict (Pass/Fail/Conditional).\n"
            "  - Joint Measurement Certificate (JMC): JMC Ref Number, Certification Period (From/To), Tower Location Range, Cumulative Executed Quantities by BOQ Item, Signatory Names & Designations (Contractor Lead & Utility AE/EE).\n"
            "  - Pre-Commissioning Protocols: Protocol ID, Substation / Feeder Name, Insulation Resistance (Mega-Ohm) Readings, Phase Continuity Checks, OTDR Optical Loss (dB/km), Splice Attenuation Loss.\n"
            "  - Taking Over Certificate (TOC): Handover Ref Number, Trial Run Completion Date & Duration, Punch List Item Count & Clearance Status, Final Handover Sign-off Date.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Approved L2 Baseline Construction Schedule (.mpp / PDF)\n"
            "  - Daily Site Photo Dossiers (Geo-tagged & Timestamped)\n"
            "  - Signed Field Quality Check Sheets (QCS) & Third-Party Lab Test Reports\n"
            "  - Dual-Signed Joint Measurement Certificates (JMC) with Measurement Sheets\n"
            "  - Completed Pre-Commissioning & OTDR Attenuation Trace Reports\n"
            "  - Utility Taking Over Certificate (TOC) & Trial Operation Acceptance Letter",
            "• /wbs (WBSManager.tsx): Interactive Gantt Engine with Critical Path tracking & Milestone variance indicators\n\n"
            "• /installation/dpr (DPRList.tsx): Multi-gang digital DPR entry form with weather impact & idling logs (locked daily at 20:00 hrs)\n\n"
            "• /qa-qc/inspections (InspectionList.tsx): Field quality stage-wise QCS verification cards\n\n"
            "• /installation/jmc (JMCList.tsx): Dual-signature JMC modal (mandatory prerequisite for client billing)\n\n"
            "• /commissioning (CommissioningDashboard.tsx): Pre-commissioning test log vault, OTDR loss curves & TOC handover sign-off"
        ),
        (
            "4. Procurement Module",
            "Mr. Anand Raval /\nMr. Sanjay Sharma",
            "• DATA ENTRY FIELDS:\n"
            "  - Quotation Comparison (QCS): Sourcing Category, Internal Budgetary Estimate, Participating Vendor Names, Quoted Base Rates, Freight & Packaging Terms, Evaluated Landed Costs, Recommended Vendor & Selection Justification.\n"
            "  - Purchase Orders (PO): Purchase Order Number, Vendor ID & Legal Entity, Mapped Mother BOQ Item Reference, Ordered Item Code & Description, Quantity Ordered, Unit Basic Price, Applicable Taxes / Freight, Total PO Value, Delivery Warehouse Location, Delivery Due Date.\n"
            "  - Inspection Call Notice: Inspection Call Reference, Manufacturing Plant Location, Ready Inspection Lot Quantity, Offered Inspection Dates, Nominated Client / Third-Party Inspector Details.\n"
            "  - Joint FAT Report & MTC: FAT Report ID, Inspected Parameters (Galvanizing Thickness, Tensile Strength, Chemical Composition, Dimension Checks), Heat / Batch Numbers, Inspection Verdict (Accepted/Rejected/Rectification Needed).\n"
            "  - Utility Dispatch Instruction (DI): Official Dispatch Instruction Reference, Authorized Dispatch Quantities by Item, Approved Destination Store / Consignee Details.\n"
            "  - Delivery Proofs & E-Way Bills: Lorry Receipt (LR) Number, Transporter Name, Vehicle Registration Number, E-Way Bill Number & Validity, Invoiced Material Quantity, Net Weighed Metric Tonnage, Arrival Date at Yard.\n"
            "  - Supplier & Contractor Bills: Vendor Invoice Number, Vendor Name, Linked PO Reference, Invoice Date, Basic Value, GST Amount, Gross Invoice Value, Payment Terms, Due Date.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Approved Commercial Quotation Comparison Sheet (QCS)\n"
            "  - Digitally Signed Supplier Purchase Orders (PO) & Amendments\n"
            "  - Official Inspection Call Notices sent to Utility / TPIA\n"
            "  - Joint FAT Inspection Reports, Mill Test Certificates (MTC) & Calibration Reports\n"
            "  - Approved Utility Dispatch Instructions (DI)\n"
            "  - Transporter Lorry Receipts (LR), E-Way Bills & Weighbridge Slips\n"
            "  - Vendor & Subcontractor Tax Invoices with Delivery Proofs (POD)",
            "• /procurement/vendors (VendorList.tsx): QCS Evaluation Matrix (compares 3+ vendor quotes)\n\n"
            "• /procurement/purchase-orders (POList.tsx & POLineItemList.tsx): PO Generator engine locked strictly to Mother BOQ balance\n\n"
            "• /qa-qc/inspections (InspectionList.tsx): Inspection Call scheduler & FAT test report mapping card\n\n"
            "• /golden-period/dispatches (DispatchTracker.tsx): Utility DI register & truck loading gate clearance\n\n"
            "• /inventory/dispatch (InventoryDashboard.tsx): Consignment tracker with LR and weighbridge verification\n\n"
            "• /finance/bills (BillList.tsx): Subcontractor & vendor bill processing with 30/60/90-day payables ageing grid"
        ),
        (
            "5. Credit Control Module",
            "Mr. Arnab Bose /\nMr. Piyush Shah",
            "• DATA ENTRY FIELDS:\n"
            "  - Client RA Tax Invoices: Invoice Reference Number, Project Name, Billing Milestone Stage (Supply, Erection, Testing, TOC), Linked JMC / DI References, Gross Certified Work Value, Applicable GST (%), Retention Deductions (%), Net Receivable Amount, Contractual Payment Due Date.\n"
            "  - Invoicing-to-Collections Allocation: Bank Remittance Reference, Bank Transaction UTR Number, Value Date of Credit, Amount Realized in Bank Account, Allocated Invoice Number(s), TDS Deducted (Sec 194C), GST TDS Deducted, Unallocated Balance.\n"
            "  - Debtor Payment Ageing: Project Master ID, Invoice Ageing Buckets (Not Due, 1–30 Days, 31–60 Days, 61–90 Days, >90 Days Overdue), Outstanding Debtor Balance, Weighted Average Collection Days.\n"
            "  - Client Deductions & Withholdings: Deduction Entry ID, Mapped RA Invoice Number, Deduction Category (TDS, GST-TDS, Retention, Liquidated Damages, Defect Withholding), Deduction Amount, Recovery / Clearance Status.\n"
            "  - Contractual Milestones Compliance: Milestone ID, Milestone Description, Milestone Percentage Weightage, Target Billing Value, Certified Billed Amount, Realized Collection Amount, Pending Milestone Balance.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Signed Client RA Tax Invoices with Supporting Measurement Sheets\n"
            "  - Official Bank Remittance Advices & Credit Confirmation Statements\n"
            "  - Periodic Debtor Ageing & Payment Realization Summary Reports\n"
            "  - TDS Certificates (Form 16A) & Utility Payment Deduction Vouchers\n"
            "  - Milestone Achievement Verification & Billing Compliance Schedules",
            "• /collections/invoices (InvoiceList.tsx): Milestone Tax Invoice Generator (Supply 70% / Erection 20% / TOC 10%)\n\n"
            "• /collections (CollectionsDashboard.tsx): Real-time collection FIFO mapping ledger (reconciles gross billing vs bank credits)\n\n"
            "• /collections (Dashboard Tabs): Debtor Ageing Filter Tabs (Current, 1-30, 31-60, 61-90, >90 Days overdue)\n\n"
            "• /collections/invoices: Deductions & Liquidated Damages (LD) reconciliation ledger\n\n"
            "• /contracts (ContractList.tsx): Contractual billing milestones realization velocity tracker"
        ),
        (
            "6. Finance Module",
            "Mr. Milind Soni /\nMr. Piyush Gohil",
            "• DATA ENTRY FIELDS:\n"
            "  - Baseline Cost Budget (CBS): CBS Node Codes, Budget Categories (Conductor, Structural Steel, Buyouts, Civil Works, Erection Services, Project Overheads, Contingency), Tender Cost Baseline, Approved Revised Budget, Target Gross Margin (%).\n"
            "  - Unbilled WIP MIS: Reporting Period (Month/Quarter), Material Delivered at Site Unbilled, Foundations/Erection Executed Uncertified, Total Work-in-Progress Valuation, Estimated Certification Date.\n"
            "  - Creditors MIS & Payables Ageing: Vendor Master ID, Creditor Invoice Balances, Ageing Classification (Not Due, 1–30 Days, 31–60 Days, >60 Days Overdue), Projected Cash Outflow (15/30 Days), Hold/Disputed Amounts.\n"
            "  - Bid vs Actual Profitability: Cumulative Recognized Revenue, Cumulative Actual Cost Incurred, Material Variance, Labour Variance, Logistics Variance, Actual Margin (%) vs Bid Baseline Margin (%), Profitability Deviation.\n"
            "  - Working Capital GFI / NFI Days: Gross Funds Invested (GFI), Trade Receivables, Total Site Inventory & WIP, Trade Payables / Creditors, Net Funds Invested (NFI), Days Sales Outstanding (DSO / Debtor Days), Days Inventory Outstanding (DIO), Days Payable Outstanding (DPO), Net Working Capital Cycle (NFI Days).\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Approved Project Baseline CBS Budget Sheet\n"
            "  - Monthly Unbilled Revenue & Work-in-Progress (WIP) Valuation Schedules\n"
            "  - Accounts Payable Creditors Ageing & Cash Outflow Forecast Reports\n"
            "  - Monthly Bid vs Actual Cost Variance & Margin Deviation Reports\n"
            "  - Working Capital Computation Worksheets (GFI, NFI & Working Capital Cycle)",
            "• /finance/budgets (BudgetList.tsx): Cost Breakdown Structure (CBS) Baseline Budget Ledger with >5% overrun alert lock\n\n"
            "• /finance (FinanceDashboard.tsx): Unbilled WIP & Delivered Material Revenue Tracker\n\n"
            "• /finance/bills (BillList.tsx): Trade Payables liability schedule & creditor ageing dashboard\n\n"
            "• /finance (Dashboard): Budget vs Actual Cost Variance Analyzer (Material/Labour/Logistics)\n\n"
            "• /finance (Dashboard): Automated Working Capital GFI & NFI Day Computation Engine"
        ),
        (
            "7. Document Management System Module",
            "Mr. Kamal Gandhi",
            "• DATA ENTRY FIELDS:\n"
            "  - Time Limit Extension (EOT): EOT Claim ID, Linked Delay Event ID, Contractual Clause Invoked (Employer Delay / Force Majeure), Extension Days Claimed, Impacted Critical Path Milestone, Financial Prolongation Cost Claimed, Claim Submission Date, Utility Determination Status.\n"
            "  - Notice of Delay (NOD) Events: Event Identification Code, Delay Cause Categorization (Right of Way, Severe Weather, Drawing Approval Delay, Utility Shutdown Delay), Date of Event Occurrence, Affected Tower Location / Span Range, Contractual Notice Due Date (7/14-Day Limit), Date Notice Served to Client.\n"
            "  - Permit to Work (PTW Shutdown): PTW Reference Number, Line Crossing Span Details, Crossing Voltage / Circuit Classification, Requested Outage Date & Time Window, Granted Shutdown Window, Site Safety Supervisor Assigned, Earthing Protocol Compliance.\n"
            "  - Idling Machinery & Gang Claims: Idling Log ID, Impacted Subcontractor Gang ID, Idled Equipment Type & Machine ID, Date & Duration of Stoppage (Hours/Days), Root Cause of Stoppage, Calculated Idling Expense, Client Site Verification Status.\n"
            "  - Project Correspondence Register: Transmittal Reference Number, Document Number, Drawing Title, Revision Level, Purpose of Issue (For Review, For Approval, For Construction), Submission Date, Client Comment Code (A1, A2, A3), Client Response Date.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Formal EOT Claim Dossiers with Time Impact Schedule Analysis (.mpp / PDF)\n"
            "  - Contractual Notice of Delay (NOD) Letters with Delivery Proofs\n"
            "  - Approved Utility Permit to Work (PTW) & Line Outage Sanction Memos\n"
            "  - Jointly Verified Machinery & Subcontractor Idling Log Sheets\n"
            "  - Transmittal Packages, Drawing Submission Sets & Comment Response Sheets (CRS)",
            "• /eot/claims (EOTClaimList.tsx): Contractual Delay Impact Assessment Engine & L2 Impact analyzer\n\n"
            "• /eot/events (DelayEventList.tsx): Notice Deadline Expiry Warnings (preserves mandatory 7/14-day contractual notice rights)\n\n"
            "• /safety (SafetyDashboard.tsx): PTW Live-Line Grid Outage Permit Vault (mandatory prerequisite for stringing)\n\n"
            "• /eot/events: Idle Plant & Subcontractor Log Sheet Attacher with joint site verification proofs\n\n"
            "• /transmittals & /crs (CRSList.tsx): Central Master Document Register (MDR), Transmittals & Comment Response Sheets"
        ),
        (
            "8. Inventory Management Module",
            "Mr. Gopal Nair /\nMr. Sunil Mishra",
            "• DATA ENTRY FIELDS:\n"
            "  - Daily Stock Ledger & Bin Cards: Material Item Master Code, Item Description, Store / Yard Storage Bay Location, Unit of Measurement (UOM), Inwarded Quantity, Quantity Issued to Subcontractor Gang, Gang ID, Current Available Stock Balance, Minimum Reorder Level.\n"
            "  - Monthly Material Reconciliation: Reconciliation Period (Month/Year), Material Received under Utility DIs, Material Certified in Client JMCs, Permissible Scrap %, Actual Scrap Generated, Uninstalled Yard Stock, Material Variance / Reconciliation Balance.\n"
            "  - Stock Transfer Orders (STO): STO Reference Number, Originating / Dispatching Store, Destination / Receiving Store, Material Item Codes & Transfer Quantities, Assigned Transporter Name, Vehicle Registration Number, Transfer Date, Receiving Yard Inward Confirmation.\n"
            "  - Tools & Plants (T&P) Inventory: Equipment Asset Code, Asset Description, Deployed Quantity, Physical Condition Rating, Assigned Subcontractor Gang ID, Last Load/Safety Test Date, Next Periodic Inspection Due Date.\n"
            "  - Tension Stringing Equipment (TSE): TSE Machine Code (Tensioner / Puller), Machine Serial Number, Operating Hours (Run Hours), Line Segment / Span Deployed, Machine Operator Name, Last Calibration Date, Hydraulic / Engine Service Due Date.\n"
            "  - Scrap & Surplus Disposal: Disposal Lot ID, Material Category (Aluminium Conductor Cuts, Structural Steel Offcuts, Wooden Cable Drums), Disposed Quantity & Weight (kg), Disposal Authorization Reference, Buyer / Auction Details, Gate Pass Number.\n\n"
            "• REQUIRED ATTACHMENTS:\n"
            "  - Daily Digital Bin Card Stock Balance Sheets\n"
            "  - Monthly Material Reconciliation Reports (MRR) signed with Utility Representative\n"
            "  - Inter-Project Stock Transfer (STO) Manifests & Material Gate Passes\n"
            "  - Tools & Plants (T&P) Site Allocation Registers & Safety Inspection Certificates\n"
            "  - TSE Machine Calibration Reports, Maintenance Logs & Load Test Certifications\n"
            "  - Scrap Disposal Authorization Certificates & Salvage Gate Passes",
            "• /inventory (InventoryList.tsx): Real-time Digital Bin Card Ledger with inward/issue balance tracking\n\n"
            "• /inventory/dispatch (InventoryDashboard.tsx): 3-Way Inwarding Verification Engine (Challan + DI + E-Way Bill)\n\n"
            "• /inventory: Monthly Physical vs JMC Material Balancing Engine\n\n"
            "• /inventory: Dual-Confirmation Inter-Project Stock Transfer (STO) Form\n\n"
            "• /resources (ResourceList.tsx): Tension Stringing Equipment (TSE) Machinery Deployment & Calibration Tracker\n\n"
            "• /inventory: Scrap, Surplus & Wooden Drum Salvage Disposal Sign-off Form"
        )
    ]

    t = doc.add_table(rows=1, cols=4)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    col_widths = [Inches(1.5), Inches(1.2), Inches(2.5), Inches(2.0)]
    headers = ["Module Name", "Lead Owner", "Required Data Entry Fields & Attached Documents", "Specific Screen & UI Features"]

    hdr_cells = t.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        hdr_cells[i].width = col_widths[i]
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=90, bottom=90, left=70, right=70)
        p = hdr_cells[i].paragraphs[0]
        for r in p.runs:
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = WHITE

    for row_idx, row_data in enumerate(master_data):
        cells = t.add_row().cells
        bg = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for i, val in enumerate(row_data):
            cells[i].text = val
            cells[i].width = col_widths[i]
            set_cell_background(cells[i], bg)
            set_cell_margins(cells[i], top=60, bottom=60, left=70, right=70)
            p = cells[i].paragraphs[0]
            for r in p.runs:
                r.font.size = Pt(7.5)
                if i in [0, 1]:
                    r.font.bold = True
                if i == 0:
                    r.font.color.rgb = DARK

    # Sign-off Page
    doc.add_page_break()
    h_sign = doc.add_heading("2. Operational Governance & Lead Owner Implementation Sign-Off", level=1)
    h_sign.paragraph_format.space_before = Pt(14)
    h_sign.paragraph_format.space_after = Pt(8)
    for r in h_sign.runs:
        r.font.size = Pt(12)
        r.font.color.rgb = NAVY

    p_app = doc.add_paragraph()
    p_app.add_run(
        "By signing below, each designated module lead confirms that the standardized data entry fields, "
        "document attachments, and UI screen mappings defined above accurately represent their operational "
        "requirements for executing EPC projects within the PMO Tool."
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

    # Output file
    docs_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(docs_dir, "ROLE_WISE_DOCUMENT_RESPONSIBILITY_MATRIX.docx")
    doc.save(out_path)
    print(f"SUCCESS: Generated schema-only DOCX at {out_path} (Size: {os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    generate_precise_pmo_docx()
