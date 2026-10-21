import os

DOCS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "golden_period_dossier")
os.makedirs(DOCS_DIR, exist_ok=True)

documents = {
    "DOC-01_Letter_of_Award_LOA.md": """# LETTER OF AWARD (LOA)
**MAHARASHTRA STATE ELECTRICITY TRANSMISSION CO. LTD. (MSETCL)**
*Office of the Chief Engineer (Transmission Projects), Prakashganga, Bandra (East), Mumbai - 400 051*

---

**Ref No:** MSETCL/CE/TR-PROJ/220KV-KC/LOA/2026/092  
**Date:** 01-September-2026  

**To:**  
M/s APAR Industries Limited  
(EPC & Infrastructure Division)  
Apar House, Corporate Park, Sion-Trombay Road,  
Chembur, Mumbai - 400 071, Maharashtra.  

**Attention:** Mr. Amit Patel (Head - Tendering & Bids)  

---

### SUBJECT: Letter of Award for Turnkey EPC Package: Design, Supply, Survey, Foundation, Erection, Stringing and Commissioning of 220kV D/C Koradi - Chandrapur Transmission Line (85 km) along with 2x220kV Terminal Bay Augmentation (Package 04).

**Reference:**
1. Tender Notice No: MSETCL/CORP/TR-220/2026/ET-14
2. APAR Technical & Price Bid Submission Ref: APAR/EPC/MSETCL/2026/T-04
3. L1 Declaration & Pre-Award Meeting: 25-August-2026

Dear Sir,

MSETCL is pleased to accept your competitive offer and award the subject contract to **M/s APAR Industries Limited** on a turnkey EPC basis subject to the following agreed terms and conditions:

1. **Total Contract Price**:
   The accepted total contract price is **₹54,20,00,000/- (Rupees Fifty-Four Crores Twenty Lakhs Only)** inclusive of all taxes, duties, GST, freight, insurance, and handling charges.

2. **Project Completion Tenure**:
   The entire scope of work shall be completed within **18 (Eighteen) Months** from the date of this Letter of Award (i.e. Target Energization Date: 28-February-2028).

3. **Golden Period Execution Target (Day 60 Ground Break)**:
   As agreed during pre-award discussions, APAR shall achieve physical site ground break (foundation excavation and stub setting) within **60 days** of LOA issuance (by **31-October-2026**).

4. **Contract Performance Bank Guarantee (CPBG)**:
   Within fifteen (15) days of this LOA, APAR shall furnish an unconditional, irrevocable Bank Guarantee for **10% of the total contract value**, amounting to **₹5,42,00,000/- (Rupees Five Crores Forty-Two Lakhs Only)** from an approved scheduled commercial bank, valid up to 28-February-2029 plus 6 months claim period.

5. **Formal Contract Signing**:
   You are requested to attend our corporate office within 15 days of CPBG submission to execute the formal Contract Agreement on non-judicial stamp paper of appropriate value.

Kindly return the duplicate copy of this Letter of Award duly signed and stamped on each page by your authorized signatory as an unconditional token of acceptance.

Yours faithfully,  
For and on behalf of **MSETCL**

*(Signed & Sealed)*  
**Chief Engineer (Transmission Projects)**  
MSETCL, Corporate Office, Mumbai
""",

    "DOC-02_Contract_Performance_Bank_Guarantee_CPBG.md": """# CONTRACT PERFORMANCE BANK GUARANTEE (CPBG)
**STATE BANK OF INDIA**  
*Corporate Accounts Group (CAG) Branch, Nariman Point, Mumbai - 400 021*

---

**Bank Guarantee No:** 00234BG26000142  
**Date of Issue:** 07-September-2026  
**Guarantee Amount:** ₹5,42,00,000/- (Rupees Five Crores Forty-Two Lakhs Only)  
**Validity Period:** 07-September-2026 to 28-February-2029  
**Claim Expiry Date:** 31-August-2029  

**To:**  
The Chief Engineer (Transmission Projects),  
Maharashtra State Electricity Transmission Co. Ltd. (MSETCL),  
Prakashganga, Plot No. C-19, E-Block, Bandra-Kurla Complex,  
Bandra (East), Mumbai - 400 051.  

---

### GUARANTEE BOND

1. **WHEREAS** M/s **APAR Industries Limited** (hereinafter called the "Contractor") has undertaken, in pursuance of Letter of Award No: `MSETCL/CE/TR-PROJ/220KV-KC/LOA/2026/092` dated 01-September-2026 to execute the Turnkey EPC Contract for the 220kV D/C Koradi - Chandrapur Transmission Line & Substation Bay Augmentation.

2. **AND WHEREAS** it was stipulated by MSETCL in the said LOA that the Contractor shall furnish a Bank Guarantee by a Scheduled Commercial Bank for a sum equal to 10% (Ten percent) of the total contract value as security for compliance with its performance obligations in accordance with the Contract.

3. **THEREFORE**, We, **STATE BANK OF INDIA**, hereby affirm that we are the Guarantors and responsible to you, on behalf of the Contractor, up to a total of **₹5,42,00,000/- (Rupees Five Crores Forty-Two Lakhs Only)**, and we undertake to pay you, upon your first written demand declaring the Contractor to be in default under the Contract, without cavil or argument, any sum within the limit of ₹5,42,00,000/- without your needing to prove or show grounds or reasons for your demand.

4. This Guarantee shall remain valid until **28-February-2029**, with an additional claim period of six months expiring on **31-August-2029**.

IN WITNESS WHEREOF, the Bank, through its authorized officers, has set its hand and stamp on this 07th day of September 2026.

*(Signed & Sealed)*  
**Assistant General Manager (Credit & Guarantees)**  
State Bank of India, CAG Branch, Mumbai  
Employee Code: SBI-98421
""",

    "DOC-03_Signed_Contract_Agreement_and_Mother_BOQ.md": """# CONTRACT AGREEMENT & MOTHER ORDER CLIENT BOQ
**CONTRACT NO:** CTR-2026-001  
**CLIENT:** Maharashtra State Electricity Transmission Co. Ltd. (MSETCL)  
**CONTRACTOR:** APAR Industries Limited (EPC Division)  
**EXECUTION DATE:** 10-September-2026  

---

### ARTICLES OF AGREEMENT
This Contract Agreement entered into this 10th day of September 2026 between MSETCL (Employer) and APAR Industries Limited (Contractor).

**Article 1: Scope of Work**: Execution of 220kV D/C Koradi-Chandrapur Transmission Line (85 km) + 2 Bays.  
**Article 2: Contract Value**: ₹54,20,00,000/- (Rupees Fifty-Four Crores Twenty Lakhs Only).  
**Article 3: Governing Mother BOQ Rule**: Downstream procurement and manufacturing orders are legally and contractually bounded to the line items, quantities, and ceiling rates tabulated below.

---

### SCHEDULE A: AUTHORIZED CLIENT MOTHER BOQ (SCHEDULE OF RATES)

| Item # | BOQ Code | Description of Supply & Works | UOM | Contract Qty | Unit Rate (₹ Lakhs) | Total Amount (₹ Lakhs) |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **01** | `MSETCL-MAT-01` | HTLS Zebra Equivalent High-Temp Low-Sag Conductor | KM | 450.00 | 4.80 | 2,160.00 |
| **02** | `MSETCL-MAT-02` | 220kV Double Tension / Suspension Hardware Fitting Sets | Sets | 1,200.00 | 0.45 | 540.00 |
| **03** | `MSETCL-MAT-03` | 120kN / 160kN Disc Porcelain / Composite Insulators | Nos | 4,800.00 | 0.08 | 384.00 |
| **04** | `MSETCL-MAT-04` | Galvanized Steel Tower Superstructures & Extensions | MT | 3,600.00 | 0.92 | 3,312.00 |
| **05** | `MSETCL-MAT-05` | Galvanized Tower Stubs, Cleats & Foundation Templates | MT | 280.00 | 0.98 | 274.40 |
| **06** | `MSETCL-MAT-06` | 24-Fiber Optical Ground Wire (OPGW) & Joint Enclosures | KM | 85.00 | 1.60 | 136.00 |
| **07** | `MSETCL-MAT-07` | Substation Bay Terminal Equipment (220kV CB, CT, PT, Isolator) | Bays | 2.00 | 320.00 | 640.00 |
| **08** | `MSETCL-SRV-01` | Check Survey, Route Alignment, Soil Investigation & Spotting | KM | 85.00 | 0.60 | 51.00 |
| **09** | `MSETCL-CIV-01` | Tower Foundation Civil Works (Excavation, Stub Setting, RCC) | Locs | 240.00 | 4.20 | 1,008.00 |
| **10** | `MSETCL-INS-01` | Tower Erection, HTLS Stringing, Clamping & Pre-Comm Testing | KM | 85.00 | 6.50 | 552.50 |
| **TOTAL**| | **GRAND TOTAL MOTHER CONTRACT CEILING** | | | | **₹54,20,00,000** |

*(Signed for Employer: Chief Engineer, MSETCL)*  
*(Signed for Contractor: Executive Director, APAR Industries Ltd)*
""",

    "DOC-04_L2_Baseline_WBS_Schedule.md": """# L2 BASELINE PROJECT SCHEDULE (WBS)
**PROJECT:** 220kV D/C Koradi - Chandrapur Transmission Line  
**BASELINE REVISION:** Rev-0 (Approved Post-Contract Signing)  
**PLANNING ENGINEER:** Priya Sharma (Project Manager)  
**DATE:** 12-September-2026  

---

### MASTER L2 MILESTONE TABLE

| WBS Code | Activity Name | Duration | Start Date | Finish Date | Predecessors | Critical Path? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **L2-01** | LOA Acceptance & Project Inception | 1 d | 01-Sep-2026 | 01-Sep-2026 | - | YES |
| **L2-02** | CPBG Submission & Mother BOQ System Lock | 7 d | 02-Sep-2026 | 08-Sep-2026 | L2-01 | YES |
| **L2-03** | Advance Mfg Clearances & Internal Plant LOI | 10 d | 08-Sep-2026 | 18-Sep-2026 | L2-02 | YES |
| **L2-04** | Check Survey, Tower Spotting & Profile Approval | 20 d | 05-Sep-2026 | 25-Sep-2026 | L2-01 | YES |
| **L2-05** | Form V Labour Registration (Principal Employer) | 12 d | 08-Sep-2026 | 20-Sep-2026 | L2-02 | NO |
| **L2-06** | CLRA Labour License & CAR / WC Insurance | 15 d | 20-Sep-2026 | 05-Oct-2026 | L2-05 | YES |
| **L2-07** | CEIG Statutory Electrical Scheme Approval | 20 d | 15-Sep-2026 | 05-Oct-2026 | L2-04 | YES |
| **L2-08** | Factory Inspection Call & Utility Nominations | 10 d | 20-Sep-2026 | 30-Sep-2026 | L2-03 | YES |
| **L2-09** | Joint Factory Acceptance Testing (FAT - Stubs/Cond) | 12 d | 30-Sep-2026 | 12-Oct-2026 | L2-08 | YES |
| **L2-10** | Utility Dispatch Instruction (DI) Clearance | 6 d | 12-Oct-2026 | 18-Oct-2026 | L2-09 | YES |
| **L2-11** | Central Site Store Lease, Fencing & Certification | 15 d | 05-Oct-2026 | 20-Oct-2026 | L2-02 | YES |
| **L2-12** | Transit Inwarding & Material Receipt Note (MRN) | 7 d | 18-Oct-2026 | 25-Oct-2026 | L2-10, L2-11 | YES |
| **L2-13** | **Day 60 Golden Period Gate Review Sign-off** | 2 d | 28-Oct-2026 | 30-Oct-2026 | L2-06, L2-07, L2-12 | **GATE** |
| **L2-14** | **Ground Break: Foundation Excavation & Stub Setting**| 90 d | 31-Oct-2026 | 28-Jan-2027 | L2-13 | **SITE BREAK**|
""",

    "DOC-05_Check_Survey_and_Tower_Spotting_Schedule.md": """# CHECK SURVEY & TOWER SPOTTING SCHEDULE
**LINE NAME:** 220kV D/C Koradi - Chandrapur Transmission Line (85 km)  
**DOCUMENT REF:** APAR-MSETCL-SRV-REP-01 (Rev 0)  
**SURVEYOR:** Arun Mishra (Lead Surveyor) | **CHECKED BY:** Vikram Singh (Lead Design Engineer)  
**SUBMISSION DATE:** 22-September-2026  

---

### TOWER SCHEDULE (SAMPLE SECTION: AP-01 TO AP-08)

| Loc No | Tower Type | Angle of Dev | Ahead Span (m) | Ground Clearance (m) | Stub Type | Soil Type | Foundation Type | GPS Coordinates |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AP-01** | `2DA` (Gantry) | 00° 00' 00" | 285.0 | 12.5 | ST-DA+0 | Hard Murrum | Normal Dry (FR-1) | 21°14'48.2"N 79°09'32.1"E |
| **AP-02** | `2DB` (Angle) | 14° 12' 30" | 340.0 | 9.8 | ST-DB+3 | Medium Soil | Wet / Waterlogged | 21°14'38.5"N 79°09'45.4"E |
| **AP-03** | `2DA` (Tangent)| 00° 00' 00" | 355.0 | 10.2 | ST-DA+0 | Hard Rock | Hard Rock Fissured | 21°14'26.1"N 79°10'01.8"E |
| **AP-04** | `2DC` (Heavy) | 32° 45' 10" | 310.0 | 11.0 | ST-DC+0 | Soft Soil | Submerged Under-reamed | 21°14'15.4"N 79°10'18.2"E |
| **AP-05** | `2DA` (Tangent)| 00° 00' 00" | 365.0 | 8.9 | ST-DA+0 | Medium Soil | Normal Dry | 21°14'02.9"N 79°10'36.5"E |
| **AP-06** | `2DD` (Dead End)| 58° 10' 00" | 290.0 | 12.0 | ST-DD+6 | Hard Murrum | Heavy Angle Dry | 21°13'49.2"N 79°10'54.1"E |
| **AP-07** | `2DA` (Tangent)| 00° 00' 00" | 350.0 | 9.5 | ST-DA+0 | Medium Soil | Normal Dry | 21°13'36.8"N 79°11'12.4"E |
| **AP-08** | `2DA` (Tangent)| 00° 00' 00" | 345.0 | 10.1 | ST-DA+0 | Hard Rock | Rock Anchor | 21°13'24.0"N 79°11'30.7"E |

*Total Tower Locations Identified Across 85 km:* **240 Locations**  
*Recommendation:* Release 240 Stub Sets (`ST-DA`, `ST-DB`, `ST-DC`, `ST-DD`) for immediate factory fabrication to enable Day-60 ground break.
""",

    "DOC-06_Internal_LOI_Apar_Conductor_Division.md": """# INTERNAL LETTER OF INTENT (LOI)
**APAR INDUSTRIES LIMITED (EPC DIVISION)**  
*Sion-Trombay Road, Chembur, Mumbai - 400 071*

---

**LOI Ref No:** APAR-EPC/LOI/MSETCL-KC/COND/2026/001  
**Date:** 15-September-2026  

**To:**  
The Vice President (Manufacturing & Commercial),  
**APAR Industries Limited — Conductor Division**,  
Silvassa / Jharsuguda Manufacturing Works.  

**Attention:** Plant Head & Production Planning Control (PPC)  

---

### SUBJECT: Internal Manufacturing Clearance & Advance Factory Slot Booking for 450 KM HTLS Conductor for MSETCL 220kV Koradi - Chandrapur Package.

**Project Ref:** MSETCL Contract No: `CTR-2026-001` (Mother BOQ Item 01)  

Dear Sir,

The EPC Division has been awarded the 220kV Koradi - Chandrapur line. You are hereby issued this formal **Internal Letter of Intent (LOI)** to commence raw material procurement and allocate manufacturing line slots for:

1. **Item Description**: HTLS Zebra Equivalent High-Temperature Low-Sag Conductor (Gap-type / INVAR core).
2. **Total Quantity Authorized**: **450.00 KM** (Full contract quantity).
3. **Target Factory Inspection (Lot-1)**: 200 KM ready for joint FAT by **30-September-2026**.
4. **Lot-2 Dispatch**: Remaining 250 KM by **15-December-2026**.
5. **Technical Specifications**: Strict compliance with MSETCL Technical Specification TS-220-COND-REV2.
6. **Billing / Transfer Price**: As per approved inter-divisional transfer pricing matrix (₹4.20 Lakhs / KM ex-works).

Please confirm line slot allocation and share your production run schedule within 48 hours.

Yours sincerely,  
For **APAR Industries Limited (EPC Division)**  

*(Signed)*  
**Ravi Tiwari**  
Head - SCM & Procurement
""",

    "DOC-07_Vendor_Purchase_Order_Tower_Stubs_Hardware.md": """# PURCHASE ORDER (PO)
**APAR INDUSTRIES LIMITED**  
*EPC Division, Corporate Office, Mumbai*

---

**PO Number:** PO-TWR-2026-001  
**PO Date:** 18-September-2026  
**Mother BOQ Line Item:** Item 05 (`MSETCL-MAT-05` — Tower Stubs & Cleats)  

**Vendor:**  
M/s Utkarsh India Limited  
Tower & Structural Steel Division, Kolkata / Nagpur Plant.  
GSTIN: 19AAACU4921K1ZV  

---

### ORDER SPECIFICATION

| Line | Description | Qty | UOM | Unit Rate (₹) | Total Value (₹) | Delivery Due Date |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | Tower Stubs (Grade E250 / E350 galvanized structural steel) for 2DA, 2DB, 2DC, 2DD towers | 240.00 | Sets | 95,000 | 2,28,00,000 | 15-October-2026 |
| 2 | Foundation Template Fixtures & Base Cleat Sets | 240.00 | Sets | 12,000 | 28,80,000 | 15-October-2026 |
| **TOTAL** | *(Inclusive of hot-dip galvanizing 610 g/m²)* | | | | **₹2,56,80,000** | |

**Special Terms:**
1. **Inspection**: Joint Factory Inspection by MSETCL and APAR QA/QC prior to dispatch.
2. **Delivery Site**: Central Site Store, APAR Industries Ltd, Koradi Substation Yard, Nagpur, Maharashtra.
3. **Criticality**: These stubs are required to achieve the **Day 60 Ground Break Gate**. Non-negotiable dispatch by 18-October-2026.

*(Authorized Signatory - APAR SCM)*  
*(Vendor Acceptance: Utkarsh India Ltd)*
""",

    "DOC-08_Principal_Employer_Form_V.md": """# FORM V
*(See Rule 21(2) of Maharashtra Contract Labour (Regulation and Abolition) Rules, 1971)*  
**CERTIFICATE BY PRINCIPAL EMPLOYER**

---

**Certificate No:** MSETCL/SE/TR-KORADI/CLRA/FORM-V/2026/14  
**Date:** 20-September-2026  

Certified that:

1. The Maharashtra State Electricity Transmission Co. Ltd. (MSETCL) has engaged **M/s APAR Industries Limited**, Apar House, Chembur, Mumbai as a Contractor on our works.

2. **Nature of Work**: Turnkey EPC execution of 220kV D/C Koradi - Chandrapur Transmission Line & Substation Bay Augmentation under Contract No: `CTR-2026-001` dated 10-September-2026.

3. **Location of Work**: Koradi to Chandrapur (Districts: Nagpur & Chandrapur, Maharashtra).

4. **Tenure of Contract**: From **10-September-2026 to 28-February-2028**.

5. **Maximum Number of Contract Labour Authorized**: **150 (One Hundred and Fifty) Workmen**.

6. The said Contractor has undertaken not to employ child labour and to comply with all statutory provisions under the Contract Labour (R&A) Act, 1970 and Interstate Migrant Workmen Act.

This certificate is issued to enable the Contractor to obtain a Labour License from the Assistant Labour Commissioner (State), Chandrapur Circle.

*(Official Seal & Signature)*  
**Superintending Engineer (EHV Projects)**  
MSETCL, Nagpur Circle  
(Principal Employer Registration No: PE-MSETCL-NGP-044)
""",

    "DOC-09_Contract_Labour_CLRA_License_and_CAR_WC_Policy.md": """# STATUTORY LABOUR LICENSE (CLRA) & INSURANCE ENDORSEMENT
**GOVERNMENT OF MAHARASHTRA**  
*Office of the Licensing Officer & Assistant Commissioner of Labour, Chandrapur*

---

**License No:** CLRA/LIC/2026/CHAND-APAR/048  
**Date of Issue:** 30-September-2026  
**Valid Up To:** 29-September-2027  

**Licensee:** M/s APAR Industries Limited  
**Principal Employer:** MSETCL, Nagpur Circle  
**Licensed Labour Strength:** Up to **150 Contract Workmen**  

---

### ASSOCIATED STATUTORY INSURANCE POLICIES ATTACHED

1. **Workmen Compensation (WC) Policy**:
   * Insurer: The New India Assurance Co. Ltd.
   * Policy No: `12040028260100000412`
   * Cover: 150 Workers (100% on-site coverage for civil excavation, stub setting, tower erection, stringing).
   * Valid: 15-Sep-2026 to 14-Sep-2027.

2. **Contractor's All Risk (CAR) Policy**:
   * Insurer: ICICI Lombard General Insurance
   * Policy No: `CAR-2026-MSETCL-APAR-09`
   * Sum Insured: ₹54.20 Crores (Full contract value) + Third Party Liability ₹5.0 Crores.

*Certified by:* **Meera Pillai** (Compliance Officer) & **Anita Reddy** (HSE Officer)  
*Status:* **100% Compliant — Statutory Labour Gate Cleared**.
""",

    "DOC-10_CEIG_Electrical_Scheme_Approval.md": """# CEIG ELECTRICAL SCHEME APPROVAL
**GOVERNMENT OF MAHARASHTRA — ENERGY DEPARTMENT**  
*Office of the Chief Electrical Inspector to Government (CEIG), Vidharbha Region, Nagpur*

---

**Approval Ref No:** CEIG/NGP/220KV-LINE/APAR/2026/894  
**Date of Sanction:** 05-October-2026  

**To:**  
The Executive Director (Transmission),  
MSETCL, Nagpur / Mumbai.  

**Copy to:** M/s APAR Industries Limited (EPC Contractor).  

---

### SUBJECT: Statutory Approval under Regulation 43 of CEA (Measures Relating to Safety and Electric Supply) Regulations 2010 for Route Alignment, Clearances, and Crossing Schemes of 220kV D/C Koradi - Chandrapur Transmission Line.

Reference is made to your application dated 15-September-2026 and subsequent joint field inspections conducted on 28-September-2026.

1. **Scheme Approval**:
   Approval is hereby accorded for the electrical design, single-line diagram, clearance profiles, and earthing arrangements for the 85 km 220kV double-circuit transmission line connecting Koradi Gantry to Chandrapur Substation.

2. **Statutory Crossings Sanctioned**:
   * NH-44 Highway Crossing between Towers AP-18 & AP-19 (Min clearance: 14.5 m).
   * Central Railway Track Crossing between Towers AP-44 & AP-45 (Cradle guarding as per railway norms).
   * 132kV Existing Line Overhead Crossings at AP-92 & AP-142.

3. **Condition Precedent**:
   All stub earthing (pipe/counterpoise) must achieve earth resistance $\le 10\ \Omega$ before tower erection commences.

*(Signed & Sealed)*  
**Chief Electrical Inspector to Government (CEIG)**  
Energy Department, Government of Maharashtra
""",

    "DOC-11_Utility_Inspector_Nomination_Letter.md": """# UTILITY INSPECTOR NOMINATION MEMO
**MAHARASHTRA STATE ELECTRICITY TRANSMISSION CO. LTD. (MSETCL)**  
*Quality & Testing Cell, Corporate Office, Mumbai*

---

**Memo Ref:** MSETCL/QC/NOM/APAR/2026/042  
**Date:** 26-September-2026  

**To:**  
The Chief Engineer (Transmission Projects),  
MSETCL, Mumbai.  

**Copy To:**  
M/s APAR Industries Limited  
Attention: Mr. Amit Patel (Marketing) / Mr. Ravi Tiwari (SCM)  

---

### SUBJECT: Nomination of Inspecting Officer for Joint Factory Acceptance Testing (FAT) of Conductor Lot-1 and Tower Stubs (Pkg 04).

**Reference:** APAR Inspection Call Notice Ref: `APAR/QC/CALL/2026/01` dated 20-Sep-2026.

The following officer is hereby officially nominated to carry out joint Stage & Factory Acceptance Testing (FAT) on behalf of MSETCL:

* **Nominated Officer**: **Er. V. R. Deshmukh**
* **Designation**: Executive Engineer (Testing & Quality Control), MSETCL Nagpur Zone.
* **Contact**: ee.tqc.ngp@msetcl.in | +91-94221-XXXXX.
* **Factories to Visit**:
  1. *APAR Conductor Works, Silvassa*: Lot-1 (200 KM HTLS Conductor) — **03 to 05-October-2026**.
  2. *Utkarsh Structural Works, Nagpur/Kolkata*: Lot-1 (240 Tower Stub Sets) — **07 to 08-October-2026**.

The inspecting officer is directed to submit the signed joint inspection report within 48 hours of test completion to facilitate Dispatch Instruction (DI) issuance.

*(Signed)*  
**Chief Engineer (Quality & Inspection)**  
MSETCL Corporate Office
""",

    "DOC-12_Factory_Acceptance_Test_FAT_Report.md": """# FACTORY ACCEPTANCE TEST (FAT) REPORT
**JOINT INSPECTION & QUALITY CLEARANCE CERTIFICATE**  
**LOCATION:** APAR Conductor Works, Silvassa | **DATE:** 05-October-2026  

---

**Report Ref:** FAT-APAR-HTLS-LOT1-2026-01  
**Project:** MSETCL 220kV D/C Koradi - Chandrapur Transmission Line  
**Client / Employer:** MSETCL  
**Material Tested:** HTLS Zebra Equivalent High-Temperature Low-Sag Conductor  
**Inspected Lot Size:** 200.00 KM (Drums #001 to #080)  

---

### TEST RESULTS SUMMARY TABLE

| Test Parameter | Specification Requirement | Measured Value (Average) | Result |
| :--- | :--- | :--- | :---: |
| 1. Ultimate Tensile Strength (UTS) | Min 130.5 kN | 134.8 kN | **PASS** |
| 2. DC Resistance at 20°C | Max 0.0682 $\Omega$/km | 0.0671 $\Omega$/km | **PASS** |
| 3. Core Elongation & Torsion | Min 1.5% / Min 20 twists | 1.8% / 24 twists | **PASS** |
| 4. Outer Aluminium Layer Wrap Test| No cracks after 8 turns | Smooth surface, no microfissures | **PASS** |
| 5. Surface Finish & Drum Sealing | Heavy-duty wooden drums, sealed | Verified all 80 drums labeled | **PASS** |

### TOWER STUBS FAT CONCURRENT INSPECTION (08-OCT-2026)
* 240 Stub Sets (`ST-DA`, `ST-DB`, `ST-DC`, `ST-DD`) inspected at Utkarsh Steel Plant.
* Zinc Coating Thickness: Measured average **88.4 $\mu$m** (Req: min 86 $\mu$m / 610 g/m²). **PASS**.
* Dimension & Cleat Hole Pitch Verification: **PASS**.

**Joint Verdict**: The materials meet MSETCL specifications in all respects and are hereby **CLEARED FOR DISPATCH**.

*(Signed)*  
**Er. V. R. Deshmukh** (Executive Engineer, MSETCL)  
*(Signed)*  
**Deepa Nair** (Lead QA/QC Inspector, APAR Industries)  
*(Signed)*  
**PPC Head** (APAR Silvassa Works)
""",

    "DOC-13_Utility_Dispatch_Instruction_DI.md": """# DISPATCH INSTRUCTION (DI)
**MAHARASHTRA STATE ELECTRICITY TRANSMISSION CO. LTD. (MSETCL)**  
*Office of the Chief Engineer (Transmission Projects), Bandra (E), Mumbai*

---

**DI Number:** MSETCL/CE/TR/220KV-KC/DI/2026/088  
**Date of Issue:** 16-October-2026  

**To:**  
M/s APAR Industries Limited  
Apar House, Chembur, Mumbai - 400 071.  

**Attention:** Mr. Amit Patel (Marketing) / Mr. Ravi Tiwari (SCM)  

---

### SUBJECT: Dispatch Instruction for Lot-1 Materials (200 KM HTLS Conductor & 240 Tower Stub Sets) for 220kV Koradi - Chandrapur Package (CTR-2026-001).

**Reference:**
1. Joint FAT Report Ref: `FAT-APAR-HTLS-LOT1-2026-01` dated 05-Oct-2026
2. Stub Inspection Report Ref: `FAT-UTK-STUBS-2026-01` dated 08-Oct-2026
3. Submission of Manufacturer Test Certificates & Warranties: 12-Oct-2026

Dear Sir,

Consequent to the successful joint Factory Acceptance Testing witnessed by our nominated engineer, MSETCL hereby accords formal clearance for the dispatch of the following materials:

1. **Authorized Consignment**:
   * **Item 01 (Conductor)**: 200.00 KM HTLS Zebra Conductor (80 Drums).
   * **Item 05 (Tower Stubs)**: 240.00 Complete Sets of Tower Stubs & Base Templates.

2. **Consignee & Destination**:
   * **Consignee**: The Executive Engineer / Store In-Charge, APAR Central Site Store, Koradi 220kV Substation Yard, Koradi, Dist: Nagpur, Maharashtra.

3. **Mandatory Documentation to Accompany Trucks**:
   * Copy of this Dispatch Instruction (DI-088).
   * Manufacturer Test Certificate (MTC) & Warranty Certificate.
   * GST Tax Invoice & Road E-Way Bills.

You are requested to intimate the expected truck arrival schedule to our site engineer for physical receipt verification.

*(Signed & Sealed)*  
**Chief Engineer (Transmission Projects)**  
MSETCL, Corporate Office, Mumbai
""",

    "DOC-14_Site_Store_Readiness_Certificate.md": """# SITE STORE READINESS CERTIFICATE
**APAR INDUSTRIES LIMITED (EPC DIVISION)**  
*Project Site Office, Koradi, Nagpur District, Maharashtra*

---

**Certificate Ref:** STORE-CERT-KORADI-2026-REV0  
**Inspection Date:** 20-October-2026  
**Auditor / Inspector:** Manoj Desai (Store Manager / Inventory Controller)  

---

### STORE INFRASTRUCTURE AUDIT REPORT

| Audit Parameter | Verification Standard | Site Inspection Observation | Status |
| :--- | :--- | :--- | :---: |
| 1. Yard Land Area & Lease | Min 4.0 Acres for drum & steel stacking | 5.2 Acres leased adjacent to Koradi Gantry | **COMPLIANT** |
| 2. Perimeter Security | 2.4m GI chainlink fencing + barbed wire | 100% fencing completed; guard cabin set | **COMPLIANT** |
| 3. Security Deployment | 24x7 Security Guards (3 shifts) | SIS Security Agency deployed (6 guards) | **COMPLIANT** |
| 4. Heavy Handling Equipment | 20T Hydra Crane & 5T Forklift on site | 1 Hydra Crane & 1 Forklift mobilized | **COMPLIANT** |
| 5. Conductor Drum Sleepers | Treated timber sleeper runners | 100 drum sleeper runners installed | **COMPLIANT** |
| 6. Weather-proof Shed | Min 500 MT covered capacity for cement/HW | Pre-engineered covered shed erected | **COMPLIANT** |
| 7. Digital IT / ERP Connectivity | High-speed link & barcode scanner | ERP/Inventory system online at store | **COMPLIANT** |

**Official Sign-off**:
The Koradi Central Store is officially declared **FIT AND READY** to inward high-voltage conductors, tower stubs, template fixtures, and civil materials under MSETCL DI-088.

*(Signed)*  
**Manoj Desai**  
Inventory Controller & Store Manager  
APAR Industries Limited (Koradi EPC Project)
""",

    "DOC-15_Material_Receipt_Note_MRN.md": """# MATERIAL RECEIPT NOTE (MRN)
**APAR INDUSTRIES LIMITED (KORADI CENTRAL STORE)**  
*Inventory Management & Stores Department*

---

**MRN Number:** MRN-2026-001  
**Receipt Date:** 25-October-2026  
**Matching DI Ref:** `MSETCL-DI-2026-HTLS-088`  
**Consignment Vehicle Nos:** MH-40-BL-4811, MH-40-CD-9214, MH-31-AP-7002 (3 Trailers)  

**Vendor / Source**: M/s Utkarsh India Ltd (Stubs) & APAR Silvassa Works (Conductor)  

---

### INWARDED MATERIAL RECONCILIATION

| Item # | Material Description | Delivery Challan Qty | Physical Count Received | Rejected / Damaged | Good Stock Accepted | Bin / Yard Location |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 01 | 2DA Tower Stubs & Cleats | 140 Sets | 140 Sets | 0 | 140 Sets | Yard Bay S-01 |
| 02 | 2DB Tower Stubs & Cleats | 45 Sets | 45 Sets | 0 | 45 Sets | Yard Bay S-02 |
| 03 | 2DC Tower Stubs & Cleats | 35 Sets | 35 Sets | 0 | 35 Sets | Yard Bay S-03 |
| 04 | 2DD Dead-End Stubs & Cleats | 20 Sets | 20 Sets | 0 | 20 Sets | Yard Bay S-04 |
| 05 | Base Template Fixtures | 240 Sets | 240 Sets | 0 | 240 Sets | Shed Bin T-12 |
| 06 | HTLS Zebra Conductor | 80 Drums (200 KM)| 80 Drums (200 KM)| 0 | 80 Drums | Sleeper Row A-D |

**Verification Confirmation**:
* Physical seals checked and intact on all trucks.
* Heat numbers stamped on stubs match MTC certificates.
* **All 240 stub sets for the line are physically in stock and ready for site gang issue.**

*(Signed)*  
**Manoj Desai** (Store Manager)  
*(Verified)*  
**Suresh Yadav** (Site Gang Supervisor)
""",

    "DOC-16_Day_60_Gate_Signoff_and_Foundation_DPR_01.md": """# DAY 60 GATE SIGN-OFF & DAILY PROGRESS REPORT (DPR #01)
**APAR INDUSTRIES LIMITED — 220kV KORADI-CHANDRAPUR PROJECT**  

---

### PART A: 60-DAY GOLDEN PERIOD GATE REVIEW SIGN-OFF
**Gate Review Date:** 29-October-2026 (Day 59 from LOA)  
**Presiding Authority:** Sunil Verma (Project Director)  

| # | Readiness Gate Criteria | Verifying Document | Cleared? |
| :---: | :--- | :--- | :---: |
| 1 | Mother BOQ Ingested & Locked in EPC Suite | `CTR-2026-001-MotherBOQ.xlsx` (DOC-03) | **YES** |
| 2 | Contract Performance BG (₹5.42 Cr) Submitted | `00234BG26000142` (DOC-02) | **YES** |
| 3 | Advance Manufacturing Clearances Issued | `LOI-APAR-COND-001` & `PO-TWR-01` (DOC-06, 07) | **YES** |
| 4 | Check Survey & Tower Spotting Approved | `APAR-MSETCL-SRV-REP-01` (DOC-05) | **YES** |
| 5 | Labour License Form V & CLRA Obtained | `CLRA/LIC/2026/CHAND-APAR/048` (DOC-09) | **YES** |
| 6 | CEIG Statutory Electrical Scheme Cleared | `CEIG/NGP/220KV-LINE/894` (DOC-10) | **YES** |
| 7 | Joint FAT Completed & MSETCL DI Issued | `MSETCL-DI-2026-HTLS-088` (DOC-13) | **YES** |
| 8 | Central Site Store Certified & Stubs in Yard | `MRN-2026-001` (DOC-15) | **YES** |

**GATE VERDICT:** **ALL 8 CRITERIA 100% GREEN. GATE SIGNED OFF. PERMISSION TO BREAK GROUND GRANTED.**

*(Signed)* **Sunil Verma** (Project Director) | *(Countersigned)* **Priya Sharma** (Project Manager)

---

### PART B: DAILY PROGRESS REPORT #01 (DPR-01)
**Date:** 31-October-2026 (**Day 60 — GROUND BREAK ACHIEVED**)  
**Reporting Officer:** Suresh Yadav (Gang Supervisor) | **Location:** Tower Location AP-01  

* **Activity Conducted**: Center line marking, pit excavation, stub setting and base template alignment at Location AP-01 (Type 2DA Gantry Tower).
* **Gang Mobilized**: Gang 01 (18 skilled and semi-skilled workmen under Gang Leader Rameshwar).
* **Equipment Deployed**: 1 JCB Excavator, 1 DG Set, 1 Stub Setting Template, 2 Immersion Vibrators.
* **Excavation Achieved**: 4 Pits excavated to 3.2m depth in hard murrum. All 4 stub legs set to exact level and template clamped.
* **Target for Tomorrow (Day 61)**: Concrete pouring (M20 grade RCC pad and chimney) at AP-01; start excavation at AP-02.

*(Signed)* **Suresh Yadav** (Gang Supervisor)  
*(Approved)* **Priya Sharma** (Project Manager)
"""
}

for filename, content in documents.items():
    file_path = os.path.join(DOCS_DIR, filename)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Generated: {filename} ({len(content)} chars)")

print(f"\nSuccessfully created all {len(documents)} documents in: {DOCS_DIR}")
