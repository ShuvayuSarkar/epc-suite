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

    run_title = title_p.add_run("IN-HOUSE PMO TOOL: PRECISE DATA ENTRY & DOCUMENT MAPPING MANUAL")
    run_title.font.size = Pt(15)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(8)
    run_sub = sub_p.add_run(
        "Step-by-Step Portal Execution Guide with Form Fields & Document Attachments for HTLS (GETCO 414) & OPGW (KPTCL)\n"
        "Document Ref: APAR-PMO-EXEC-2026-REV6 | Version 6.0"
    )
    run_sub.font.size = Pt(9)
    run_sub.font.italic = True
    run_sub.font.color.rgb = SLATE

    # Overview
    intro_p = doc.add_paragraph()
    intro_p.paragraph_format.space_after = Pt(8)
    intro_run = intro_p.add_run(
        "Purpose & Portal Alignment: All abstract document titles have been replaced with the exact data entry fields "
        "and physical file attachments required by the active EPC Suite portal screens. This allows any user or "
        "project team to take an example project (such as GETCO 414 or KPTCL OPGW) and execute it end-to-end through the portal."
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
            "1. L1 Bid Evaluation: Form [Bid ID 'BID-2026-GETCO-001', Client 'GETCO', Type 'Type A HTLS', Value '₹54.20 Cr', Status 'Won', Competitor Bids table (L1 APAR ₹54.2Cr, L2 KEC ₹58.1Cr)] + File: Commercial_Bid_Opening_Memo.pdf\n\n"
            "2. LOA / LOI Ingestion: Form [Award ID 'AWD-2026-001', Award Ref 'GETCO/LOA/092', Date '2026-09-01', Value '₹54.20 Cr', Tenure '18 Months'] + File: Official_LOA_Letter_GETCO.pdf\n\n"
            "3. Contract Signing & Mother BOQ: Form [Contract Ref 'CTR-2026-001', Date '2026-09-10', LD '10%', Retention '5%', Mother BOQ Grid: Items 01-10 (Conductor 450KM, HW 1200 Sets, Towers 3600MT, Stubs 280MT, OPGW 85KM, Foundations 240 Locs)] + File: Executed_Contract_Agreement.pdf\n\n"
            "4. Bank Guarantee (CPBG): Form [BG '00234BG26000142', Bank 'SBI CAG Mumbai', Amount '₹5,42,00,000' (10%), Valid '28-Feb-2029', Claim '31-Aug-2029'] + File: Scanned_CPBG_Bond.pdf\n\n"
            "5. Advance Payment BG (APBG): Form [BG 'HDFC26APBG019', Bank 'HDFC', Amount '₹5,42,00,000', Valid '10-Sep-2027'] + File: Scanned_APBG_Bond.pdf\n\n"
            "6. Scope Variation Addendums: Form [Addendum Ref 'AMD-01', Reason 'Route diversion +3 KM', Revised BOQ Qty] + File: Client_Variation_Order.pdf",
            "• /bidding (BidDetail.tsx): Stage 0 Bidding Win/Loss status card & Cost estimate breakdown\n\n"
            "• /award/new (NewAward.tsx): Wizard Step 1 'Award Receipt' & Step 2 'Acceptance Letter'\n\n"
            "• /contracts (ContractList.tsx): Contract Master Record & 'Client BOQ Items' dynamic tab (locks budget ceilings)\n\n"
            "• /golden-period/bank-guarantees (BankGuaranteeTracker.tsx): '+ Submit BG' modal with 60/30/15-day automated expiry alerts\n\n"
            "• /po-amendments (POAmendmentList.tsx): Scope Variation & Contract Addendum ledger"
        ),
        (
            "2. Golden Activity Period Module (30+60 Days)",
            "Mr. Rakesh Sinha /\nMr. Suvesh Pahwa",
            "1. 30-Day Pre-LOA Walkover: Form [Route Length '85 KM', Terrain '55km Plain, 20km Hilly, 10km Forest', Subcontractors Prequalified 'Gangs G01-G06', Ingot Hedging 'Complete'] + File: Pre_Award_Risk_Matrix.xlsx\n\n"
            "2. 60-Day Master Action Plan: Form [Milestones L2-01 to L2-14, Target Ground Break 'Day 60', Critical Path 'Survey -> Stubs -> Store -> Excavation'] + File: 60D_Action_Plan.mpp\n\n"
            "3. Advance Mfg Clearance: Form [Select Mother BOQ Item 01 Conductor '450 KM' to Apar Silvassa; Item 05 Stubs '240 Sets' to Utkarsh Steel] + File: Advance_Mfg_Clearance_LOI.pdf\n\n"
            "4. CEIG Electrical Sanction: Form [App Ref 'CEIG/2026/894', Date '2026-10-05', Contractor License Class-A, Approved Crossing 'NH-44 & Central Rly'] + File: CEIG_Scheme_Approval.pdf\n\n"
            "5. Principal Employer Form V & CLRA: Form [Form V No 'MSETCL/FV/14', Date '2026-09-20', Max Labour '150', CLRA Lic 'CLRA/2026/048', Valid '29-Sep-2027'] + File: Form_V_and_CLRA_License.pdf\n\n"
            "6. Central Store Readiness: Form [Yard Area '5.2 Acres', Fencing '100% 2.4m GI', Security 'SIS 6 Guards', Crane '20T Hydra', Sleepers '100 Beds'] + File: Store_Readiness_Audit.pdf\n\n"
            "7. 60-Day Gate Sign-off: Form [Review Date 'Day 59', 6 Criteria Green (BOQ, CPBG, Stubs, CEIG, Form V, Store), Decision 'Approved'] + File: Day60_Gate_Signoff.pdf",
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
            "1. L2 Master Schedule: Form [WBS Codes L2-01 to L2-14, Durations (Civil 90d, Erection 120d, Stringing 90d), Resource Loading, Milestone Rev-0 Lock] + File: WBS_L2_Baseline_Rev0.mpp\n\n"
            "2. Daily Progress Reports (DPR): Form [Date '2026-10-31', Segment 'Seg-01', Gang 'Gang-01', Activity 'Foundation Excavation & Stub Setting', Location 'AP-01', Qty '4 Pits / 1 Stub set', Manpower '18', Hours '8', GPS Tag '21.24°N, 79.15°E'] + File: DPR_Site_Photos.pdf\n\n"
            "3. Quality Check Sheets (QCS): Form [QCS ID 'QCS-CIV-001', Loc 'AP-01', Diagonal Tolerance '±2mm Pass', Pit Depth '3.2m Pass', Slump '100mm Pass', 7d/28d Cube Strength '16.5/24.2 N/mm² Pass'] + File: Signed_QCS_Field_Sheet.pdf\n\n"
            "4. Joint Measurement Certificate: Form [JMC Ref 'JMC-2026-NOV-01', Period 'Nov-2026', Towers 'AP-01 to AP-25', Work '25 Foundations Cast', Signatories 'Suresh Yadav / APAR + Er. Patil / Utility AE'] + File: Signed_JMC_Certificate.pdf\n\n"
            "5. Pre-Commissioning Protocols: Form [Pre-charging test, Mega-Ohm test '>1000 MΩ Pass', KPTCL OTDR Attenuation Log 'Avg 0.198 dB/km Pass (spec ≤0.21)', Splice Loss '<0.05 dB Pass'] + File: OTDR_Loss_Trace_Report.pdf\n\n"
            "6. Taking Over Certificate (TOC): Form [TOC Ref 'TOC-2028-014', 24-hr Trial Operation 'Passed 14-Feb-2028', Punch List '100% Cleared'] + File: Utility_TOC_Certificate.pdf",
            "• /wbs (WBSManager.tsx): Interactive Gantt Engine with Critical Path tracking & Milestone variance indicators\n\n"
            "• /installation/dpr (DPRList.tsx): Multi-gang digital DPR entry form with weather impact & idling logs (locked daily at 20:00 hrs)\n\n"
            "• /qa-qc/inspections (InspectionList.tsx): Field quality stage-wise QCS verification cards\n\n"
            "• /installation/jmc (JMCList.tsx): Dual-signature JMC modal (mandatory prerequisite for client billing)\n\n"
            "• /commissioning (CommissioningDashboard.tsx): Pre-commissioning test log vault, OTDR loss curves & TOC handover sign-off"
        ),
        (
            "4. Procurement Module",
            "Mr. Anand Raval /\nMr. Sanjay Sharma",
            "1. Quotation Comparison (QCS): Form [Category 'Tower Stubs', Estimate '₹2.74 Cr', Vendors: Utkarsh ₹2.56 Cr (L1), Goodluck ₹2.68 Cr (L2), Skipper ₹2.72 Cr (L3), Decision 'Award to Utkarsh'] + File: QCS_Commercial_Summary.xlsx\n\n"
            "2. Supplier Purchase Orders: Form [PO 'PO-TWR-2026-001', Vendor 'Utkarsh India', Mother BOQ Item 05 Stubs, Qty '240 Sets / 280 MT', Rate '₹91,714/set', Value '₹2,56,80,000', Delivery Site 'Koradi Store', Due '18-Oct-2026'] + File: Signed_Purchase_Order.pdf\n\n"
            "3. Inspection Call Notice: Form [Call Ref 'INSP-2026-01', Plant 'Utkarsh Steel', Lot '240 Stub Sets ready', Date '07-Oct-2026', Nominated Inspector 'Er. Deshmukh / EE MSETCL'] + File: Inspection_Call_Notice.pdf\n\n"
            "4. Joint FAT Report & MTC: Form [FAT Ref 'FAT-UTK-01', Tests (Galvanizing '88.4 μm Pass', Steel Grade 'E250/E350 Pass', Hole Pitch 'Pass'), Verdict 'Accepted'] + File: Signed_FAT_Report_and_MTC.pdf\n\n"
            "5. Utility Dispatch Instruction: Form [DI Ref 'DI-MSETCL-2026-088', Authorized Qty '200 KM Conductor + 240 Stub Sets', Consignee 'Koradi Central Store'] + File: Client_DI_Signed.pdf\n\n"
            "6. Delivery Proofs & E-Way Bills: Form [LR 'LR-TCI-9412', Vehicle 'MH-40-BL-4811', E-Way Bill '2418-9410-0211', Material '80 Stub Sets', Net Wt '24,150 kg'] + File: Challan_and_EWayBill.pdf\n\n"
            "7. Supplier & Gang Bills: Form [Bill ID 'BILL-UTK-001', Vendor 'Utkarsh', Inv No 'INV-901', Gross '₹85,60,000', GST '₹15,40,800', Net '₹1,01,00,800', Due Date '21-Nov-2026'] + File: Vendor_Tax_Invoice.pdf",
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
            "1. Client RA Tax Invoices: Form [Invoice No 'INV-RA-01-GETCO', Milestone '70% Supply on Site Delivery', Gross '₹17,28,00,000', GST 18% '₹3,11,04,000', Retention 5% '₹86,40,000', Net Receivable '₹19,52,64,000', Due '45 days'] + File: Client_Tax_Invoice_RA01.pdf\n\n"
            "2. Invoicing-to-Collections Mapping: Form [Remittance 'REMIT-2026-08', Bank UTR 'SBIN263041920', Credit Date '2026-11-15', Realized '₹18,50,00,000', Mapped Inv 'INV-RA-01', TDS '₹38,00,000', Balance '₹64,64,000'] + File: Bank_Credit_Advice.pdf\n\n"
            "3. Debtor Payment Ageing: Form [Project 'GETCO 414', Buckets (Not Due '₹19.52 Cr', 1-30d '₹0', 31-60d '₹0', >90d '₹0'), Total Debtor Book '₹19.52 Cr', Wtd Avg Collection '38 Days'] + File: Debtor_Ageing_MIS.xlsx\n\n"
            "4. Client Deductions Reconciliation: Form [Deduction Ref 'DED-RA-01', TDS Sec 194C '₹34,56,000', GST TDS '₹3,45,600', Retention '₹86,40,000', Liquidated Damages '₹0 Nil'] + File: TDS_Certificate_and_Voucher.pdf\n\n"
            "5. Billing Milestones Compliance: Form [Milestone 'M1 Conductor Supply 80%', Billed '₹17.28 Cr', Realized '₹18.50 Cr', Next Milestone 'M2 Foundations JMC 10%'] + File: Milestone_Billing_MIS.xlsx",
            "• /collections/invoices (InvoiceList.tsx): Milestone Tax Invoice Generator (Supply 70% / Erection 20% / TOC 10%)\n\n"
            "• /collections (CollectionsDashboard.tsx): Real-time collection FIFO mapping ledger (reconciles gross billing vs bank credits)\n\n"
            "• /collections (Dashboard Tabs): Debtor Ageing Filter Tabs (Current, 1-30, 31-60, 61-90, >90 Days overdue)\n\n"
            "• /collections/invoices: Deductions & Liquidated Damages (LD) reconciliation ledger\n\n"
            "• /contracts (ContractList.tsx): Contractual billing milestones realization velocity tracker"
        ),
        (
            "6. Finance Module",
            "Mr. Milind Soni /\nMr. Piyush Gohil",
            "1. Baseline Cost Budget (CBS): Form [Tender Budget '₹46,07,00,000', Cost Ceilings: Conductor '₹18.50 Cr', Buyout '₹14.20 Cr', Civil '₹6.80 Cr', Services '₹4.10 Cr', Overheads '₹2.47 Cr', Planned Margin '15.0% ₹8.13 Cr'] + File: Project_Baseline_CBS_Budget.xlsx\n\n"
            "2. Unbilled Revenue MIS (WIP): Form [Month 'Nov-2026', Delivered Material Unbilled '₹2.56 Cr Stubs', Executed Foundations Uncertified '₹42.0 Lakhs Loc AP01-AP10', Total WIP '₹2.98 Cr'] + File: Unbilled_Revenue_Schedule.xlsx\n\n"
            "3. Creditors MIS & Payables Ageing: Form [Accounts Payable '₹4.12 Cr', Not Due '₹3.10 Cr', Due 1-30d '₹1.02 Cr', Overdue >60d '₹0 Nil', 15-day Projected Outflow '₹1.50 Cr'] + File: Creditors_Ageing_Schedule.xlsx\n\n"
            "4. Bid vs Actual Profitability: Form [Revenue Recognized '₹19.52 Cr', Actual Cost '₹16.20 Cr', Realized Margin '17.0% vs Planned 15.0%', Favorable Variance '+2.0%'] + File: Profitability_Variance_Report.xlsx\n\n"
            "5. Working Capital GFI / NFI Days: Form [Gross Funds GFI '₹22.50 Cr', Debtors '₹19.52 Cr', Inventory/WIP '₹5.10 Cr', Creditors '₹4.12 Cr', Net Funds NFI '₹20.50 Cr', Debtor Days '38', Inventory Days '18', Creditor Days '32', Net NFI Days '24 Days'] + File: GFI_NFI_Days_Worksheet.xlsx",
            "• /finance/budgets (BudgetList.tsx): Cost Breakdown Structure (CBS) Baseline Budget Ledger with >5% overrun alert lock\n\n"
            "• /finance (FinanceDashboard.tsx): Unbilled WIP & Delivered Material Revenue Tracker\n\n"
            "• /finance/bills (BillList.tsx): Trade Payables liability schedule & creditor ageing dashboard\n\n"
            "• /finance (Dashboard): Budget vs Actual Cost Variance Analyzer (Material/Labour/Logistics)\n\n"
            "• /finance (Dashboard): Automated Working Capital GFI & NFI Day Computation Engine"
        ),
        (
            "7. Document Management System Module",
            "Mr. Kamal Gandhi",
            "1. Time Limit Extension (EOT): Form [Claim 'EOT-CLM-001', Event 'EVT-ROW-02', Days Claimed '45 Days', Milestone 'Foundations', Cost Claimed '₹34,50,000', Clause 'Clause 38.2 Employer Delay'] + File: EOT_Claim_Dossier_with_Time_Impact.pdf\n\n"
            "2. Notice of Delay Events: Form [Event 'EVT-ROW-02', Type 'Right of Way Dispute', Date '2026-10-14', Chainage 'AP-18 to AP-22', Status 'NOD_ISSUED', Notice Served Date '2026-10-16'] + File: Contractual_Notice_of_Delay_Letter.pdf\n\n"
            "3. Permit to Work (PTW Shutdown): Form [PTW 'PTW-2026-OUT-14', Crossing 'Span AP44-AP45', Crossed Line '132kV Feeder', Outage Date '2026-11-20', Window '08:00-17:00', Safety Earthing 'Confirmed'] + File: Approved_PTW_Shutdown_Memo.pdf\n\n"
            "4. Idling Machinery & Gang Claims: Form [Log 'IDL-2026-05', Gang 'Gang-03', Equipment Idled '1x 20T Hydra Crane + 1x JCB', Idle Hours '48 Hours', Idle Cost '₹1,85,000'] + File: Plant_and_Gang_Idling_Log_Sheets.pdf\n\n"
            "5. Project Correspondence Register: Form [Transmittal 'APAR-TR-003', Subject 'OPGW Drum Length Schedule Rev B', Recipient 'Mr. Desai / GETCO', Status 'A1 Approved'] + File: Signed_Transmittal_Package_and_CRS.pdf",
            "• /eot/claims (EOTClaimList.tsx): Contractual Delay Impact Assessment Engine & L2 Impact analyzer\n\n"
            "• /eot/events (DelayEventList.tsx): Notice Deadline Expiry Warnings (preserves mandatory 7/14-day contractual notice rights)\n\n"
            "• /safety (SafetyDashboard.tsx): PTW Live-Line Grid Outage Permit Vault (mandatory prerequisite for stringing)\n\n"
            "• /eot/events: Idle Plant & Subcontractor Log Sheet Attacher with joint site verification proofs\n\n"
            "• /transmittals & /crs (CRSList.tsx): Central Master Document Register (MDR), Transmittals & Comment Response Sheets"
        ),
        (
            "8. Inventory Management Module",
            "Mr. Gopal Nair /\nMr. Sunil Mishra",
            "1. Daily Stock Ledger & Bin Cards: Form [Item 'MSETCL-MAT-05 Stubs ST-DA', Location 'Yard Bay S-01', Inwarded '140 Sets', Issued to Gang '16 Sets Gang-01', Store Balance '124 Sets', UOM 'Sets'] + File: Digital_Bin_Card_Stock_Extract.xlsx\n\n"
            "2. Monthly Material Reconciliation: Form [Month 'Nov-2026', HTLS Conductor: Received Under DI '200.00 KM', Certified in JMC '42.50 KM', Scrap '0.35 KM', Store Balance '157.15 KM', Variance '0.00 KM Balanced'] + File: Monthly_Material_Reconciliation_MRR.xlsx\n\n"
            "3. Stock Transfer Orders (STO): Form [STO 'STO-2026-04', Sending Store 'GETCO 414 Store', Receiving Store 'KPTCL OPGW Store Hubli', Material '12x Joint Boxes + 50x Suspension Clamps', Vehicle 'KA-25-A-8114'] + File: Inter_Project_STO_Manifest.pdf\n\n"
            "4. Tools & Plants (T&P) Inventory: Form [Asset 'TP-SL-041 Come-Along Clamps', Qty '24 Nos', Condition 'Load Tested Good', Gang Assigned 'Gang-02 Erection', Test Date '2026-09-15'] + File: TP_Site_Allocation_Register.xlsx\n\n"
            "5. Tension Stringing Equipment (TSE): Form [Asset 'TSE-TEN-002', Description 'OMAC 40kN Tensioner', Serial 'OM-8941', Run Hours '412 hrs', Status 'Active Segment-01 Stringing', Operator 'Rameshwar Singh'] + File: TSE_Calibration_and_Maintenance_Log.pdf\n\n"
            "6. Scrap & Surplus Disposal: Form [Lot 'SCR-2027-01', Scrap 'Aluminium conductor cut pieces & empty wooden drums', Qty '1,420 kg Al + 45 drums', Witness 'Er. Patil / Utility AE'] + File: Scrap_Disposal_Certificate.pdf",
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
    col_widths = [Inches(1.6), Inches(1.2), Inches(2.3), Inches(2.1)]
    headers = ["Module Name", "Lead Owner", "Precise Data Entry Fields & Attached Documents", "Specific Screen & UI Features"]

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
        "By signing below, each designated module lead confirms that the exact portal data entry fields, "
        "document attachments, and UI screen mappings defined above accurately represent their operational "
        "requirements for executing HTLS (GETCO 414) and OPGW (KPTCL) projects."
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
    print(f"SUCCESS: Generated precise field-mapped DOCX at {out_path} (Size: {os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    generate_precise_pmo_docx()
