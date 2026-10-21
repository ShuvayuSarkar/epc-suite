# ROLE-WISE DOCUMENT RESPONSIBILITY & MAINTENANCE MATRIX
**Project Framework:** 60-Day Golden Period & Turnkey EPC Execution  
**Standard Operating Procedure:** `SOP-EPC-DOC-01` | **Version:** 2.0  
**Repository Location:** `docs/ROLE_WISE_DOCUMENT_RESPONSIBILITY_MATRIX.md`

---

## Quick Reference Summary

| # | Role | Primary Persona | System Module Route | Primary Documents Uploaded |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Bid & Marketing Manager** | Amit Patel | `/contracts`, `/golden-period/dispatches` | LOA, Utility Nomination Letter, Client DI |
| **2** | **Contracts & Legal Manager**| Rahul Mehta | `/contracts` *(Client BOQ Tab)* | Signed Contract Agreement, Mother BOQ Schedule |
| **3** | **Treasury & Finance** | Gaurav Chawla | `/golden-period/bank-guarantees` | Contract Performance BG (CPBG), Mobilization Advance BG |
| **4** | **Project Director / Manager** | Sunil Verma / Priya Sharma | `/wbs`, `/golden-period` | L2 Baseline Schedule, 60-Day Gate Sign-off |
| **5** | **Lead Design & Survey** | Vikram Singh / Arun Mishra | `/site-surveys`, `/transmittals`, `/crs` | Check Survey, Tower Spotting Schedule, Profile Drawings |
| **6** | **SCM & Procurement** | Ravi Tiwari / Shuv Sarkar | `/golden-period/manufacturing-clearance` | Internal Plant LOI, Vendor POs, Inspection Calls |
| **7** | **Statutory & Compliance** | Meera Pillai | `/golden-period/statutory` | Form V, CLRA Labour License, CEIG Electrical Approval |
| **8** | **HSE & Safety Officer** | Anita Reddy | `/golden-period/insurance`, `/safety` | Workmen Compensation (WC), CAR Insurance, Safety Logs |
| **9** | **QA/QC Inspector** | Deepa Nair | `/qa-qc/inspections`, `/qa-qc/ncr` | FAT Reports, Stage Inspection Reports, MTCs |
| **10**| **Store / Inventory Controller**| Manoj Desai | `/golden-period/stores`, `/inventory` | Store Readiness Certificate, Material Receipt Notes (MRN) |
| **11**| **Site Gang Supervisor** | Suresh Yadav | `/installation/dpr`, `/gangs` | Daily Progress Reports (DPR), Gang Attendance, JMC |

---

## Detailed Role-by-Role Document Responsibilities

### 1. Bid & Marketing Manager
* **Assigned Persona:** `Amit Patel` (Marketing & Bids)
* **System Modules:** [`/contracts`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/contracts/ContractList.tsx), [`/golden-period/dispatches`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/DispatchTracker.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-01** | **Letter of Award (LOA)** | **Day 1** | L1 Bid Opening & Commercial Declaration | Unlocks Project creation, 60-Day countdown & CPBG application |
| **DOC-11** | **Utility Inspector Nomination** | **Day 30** | Inspection Call raised by SCM | Fixes joint factory FAT date with Client Inspecting Officer |
| **DOC-13** | **Utility Dispatch Instruction (DI)**| **Day 48** | Signed FAT Report submitted to Client | **Authorizes factory gates to dispatch trucks to site store** |

* **Ongoing Maintenance:**
  * Track client correspondence, letters of intent, and tender amendments.
  * Follow up with the utility for timely inspector nominations and DI releases.

---

### 2. Contracts & Legal Manager
* **Assigned Persona:** `Rahul Mehta` / `Akash Dubey` (Contracts / Legal)
* **System Modules:** [`/contracts`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/contracts/ContractList.tsx) *(Client BOQ Items Tab)*

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-03** | **Signed Contract & Mother BOQ** | **Day 10** | LOA + Verified CPBG submission | **LOCKS MOTHER BOQ**: Sets hard contract ceilings for all downstream POs |
| **DOC-VAR** | **Contract Amendments / Variations** | As needed | Client-approved scope or quantity revisions | Dynamically updates BOQ quantities and contract values in system |

* **Ongoing Maintenance:**
  * Reconcile cumulative PO orders against authorized Mother BOQ line balances.
  * Maintain contract clauses, LD waivers, and price variation (PV) billing formulas.

---

### 3. Treasury & Finance Manager
* **Assigned Persona:** `Gaurav Chawla` / `Neha Gupta` (Treasury / Finance)
* **System Modules:** [`/golden-period/bank-guarantees`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/BankGuaranteeTracker.tsx), [`/finance`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/finance/BillList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-02** | **Contract Performance BG (CPBG)** | **Day 7** *(≤15d LOA)* | LOA commercial terms & Bank sanction line | Unlocks formal Contract signing & Mobilization Advance claim |
| **DOC-ABG** | **Advance Payment BG (APBG)** | **Day 15** | Mobilization advance clause in contract | Unlocks release of 10% mobilization advance from utility |

* **Ongoing Maintenance:**
  * Monitor BG expiry dates, renewal notices, and claim periods.
  * Reconcile client mobilization deductions from running bills.

---

### 4. Project Director & Project Manager
* **Assigned Personas:** `Sunil Verma` (Project Director) / `Priya Sharma` (Project Manager)
* **System Modules:** [`/wbs`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/wbs/WBSManager.tsx), [`/golden-period`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/GoldenPeriodDashboard.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-04** | **L2 Baseline WBS Schedule** | **Day 12** | Contract milestones & Mother BOQ | Establishes project critical path & milestone tracking baselines |
| **DOC-16A** | **60-Day Golden Period Gate Sign-off** | **Day 60** | Verification of all 15 prerequisites (100% green) | **OFFICIAL GROUND BREAK**: Grants site permission to excavate and cast foundations |

* **Ongoing Maintenance:**
  * Update weekly physical and financial S-curves.
  * Track delay events, notices of delay (EOT claims), and monthly progress reports (MPR).

---

### 5. Lead Design Engineer & Survey Team
* **Assigned Personas:** `Vikram Singh` (Design Lead) / `Arun Mishra` (Survey Lead)
* **System Modules:** [`/site-surveys`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/site-surveys/SiteSurveyList.tsx), [`/transmittals`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/transmittals/TransmittalList.tsx), [`/crs`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/crs/CRSList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-05** | **Check Survey & Tower Spotting** | **Day 15–25** | Walkover survey & GPS corridor alignment | Freezes tower bill of materials, stub types, and pit excavation coordinates |
| **DOC-TR** | **Drawing Transmittal Packages** | Continuous | Profile, foundation design, and structural drawings | Formal document control flow to Client / PMC for review and approval |
| **DOC-CRS** | **Comment Response Sheets (CRS)**| Within 7 days of comments | Client/PMC review remarks on drawings | Closes engineering comments and secures "Approved for Construction" (AFC) stamp |

* **Ongoing Maintenance:**
  * Maintain master drawing register (MDR) and revision histories (Rev 0, Rev A, Rev B).
  * Update tower spotting profiles upon encountering site hindrances or route diversions.

---

### 6. SCM & Procurement Manager
* **Assigned Persona:** `Ravi Tiwari` / `Shuv Sarkar` (Procurement / SCM)
* **System Modules:** [`/golden-period/manufacturing-clearance`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/ManufacturingClearance.tsx), [`/golden-period/vendors`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/VendorFinalization.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-06** | **Internal LOI (Apar Plant)** | **Day 15** | Locked Mother BOQ Item 01 (Conductor) | Books aluminium ingot allocation, wire rod rolling & stranding plant slots |
| **DOC-07** | **Vendor Buyout POs (Stubs/Hardware)**| **Day 20** | Approved vendor nomination & BOQ validation | Authorizes factory fabrication of 240 stub sets and long-lead hardware |
| **DOC-CALL**| **Factory Inspection Call Notice** | When factory batch is ready | Vendor/Plant internal test pass | Triggers nomination of utility inspecting officer |

* **Ongoing Maintenance:**
  * Track factory production runs, raw material hedging, and milestone delivery schedules.
  * Reconcile ordered quantities against remaining Mother BOQ balances.

---

### 7. Statutory & Compliance Officer
* **Assigned Persona:** `Meera Pillai` (Compliance Officer)
* **System Modules:** [`/golden-period/statutory`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/StatutoryApprovals.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-08** | **Principal Employer Form V** | **Day 20** | Signed Contract with Utility (MSETCL) | Mandatory prerequisite to file for State Labour Commissioner CLRA license |
| **DOC-09A**| **Labour License (CLRA)** | **Day 35** | Form V certificate + valid WC & CAR Insurance | Legal authorization to mobilize and deploy contract workmen on site |
| **DOC-10** | **CEIG Electrical Scheme Approval** | **Day 35** | Class-A Electrical Contractor License & SLD | Statutory clearance to construct high-voltage lines and execute crossings |

* **Ongoing Maintenance:**
  * Maintain monthly statutory compliance registers (muster rolls, wage registers, EPF/ESIC challans).
  * Monitor validity periods of CEIG approvals, forest clearances, and railway crossing permits.

---

### 8. HSE & Safety Officer
* **Assigned Persona:** `Anita Reddy` (Safety / HSE Officer)
* **System Modules:** [`/golden-period/insurance`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/InsuranceTracker.tsx), [`/safety`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/safety/IncidentList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-09B**| **Workmen Compensation (WC) Policy**| **Day 25** | Mobilization plan & labour headcount | Mandatory attachment for CLRA license; covers worker accident liabilities |
| **DOC-CAR** | **Contractor's All Risk (CAR) Policy**| **Day 25** | Contract award value | Comprehensive insurance covering site plant, stubs, and third-party damage |
| **DOC-TBT** | **Toolbox Talk & Safety Audits** | Daily / Weekly | Site activity initiation | Tracks safety briefing attendance, PPE compliance, and hazard mitigations |

* **Ongoing Maintenance:**
  * Maintain zero-incident registers, near-miss logs, and daily PPE compliance checklists.
  * Ensure insurance policies are endorsed whenever subcontractor manpower scales up.

---

### 9. QA/QC Inspector
* **Assigned Persona:** `Deepa Nair` (QA/QC Inspector)
* **System Modules:** [`/qa-qc/inspections`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/qa-qc/InspectionList.tsx), [`/qa-qc/ncr`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/qa-qc/NCRList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-12** | **Factory Acceptance Test (FAT) Report**| **Day 42** | Joint testing witnessed with Utility Inspector | Delivered to Marketing to apply for official Client Dispatch Instruction (DI) |
| **DOC-MTC** | **Manufacturer Test Certificates (MTC)**| With FAT Report | Mill test certificates for steel, zinc, aluminium | Validates chemical composition, UTS, and galvanizing standards |
| **DOC-NCR** | **Non-Conformance Reports (NCR)** | Upon defect detection | QA deviation observed during inspection | Blocks dispatch or site installation until vendor submits corrective action |

* **Ongoing Maintenance:**
  * Maintain inspection call registers, FAT archives, and calibration certificates for test equipment.
  * Conduct site stage inspections (pit dimensions, slump tests, concrete cube testing).

---

### 10. Store Manager & Inventory Controller
* **Assigned Persona:** `Manoj Desai` (Store Manager / Inventory Controller)
* **System Modules:** [`/golden-period/stores`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/golden-period/StoreSetupTracker.tsx), [`/inventory`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/inventory/InventoryList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-14** | **Site Store Readiness Certificate**| **Day 50** | Fencing, 24x7 security, hydra crane, sleepers | Certifies central yard ready for receipt; clears physical store gate |
| **DOC-15** | **Material Receipt Note (MRN)** | **Day 55** | Arrival of trucks under DI + e-way bills | Inwards stubs, conductor, and cement into inventory for site gang issue |
| **DOC-MIN** | **Material Issue Note (MIN)** | Daily from Day 60 | Requisition signed by Gang Supervisor | Issues stubs and template bars to specific tower location gangs |

* **Ongoing Maintenance:**
  * Maintain bin cards, daily physical inventory ledgers, and scrap registers.
  * Conduct periodic physical vs. ERP stock reconciliation.

---

### 11. Site Gang Supervisor & Execution Team
* **Assigned Persona:** `Suresh Yadav` (Site Gang Supervisor)
* **System Modules:** [`/installation/dpr`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/installation/DPRList.tsx), [`/gangs`](file:///d:/OneDrive%20-%20Apar%20Industries%20Limited/Documents/EPC/epc-suite/apps/web/src/pages/installation/GangList.tsx)

| Document Code | Document Title | When to Upload / SLA | Input Trigger (Prerequisite) | What It Unlocks (Downstream Gate) |
| :--- | :--- | :---: | :--- | :--- |
| **DOC-16B**| **Daily Progress Report (DPR #01)** | **Day 60** *(Daily thereafter)* | Day 60 Gate sign-off + Stubs in Store | Records center marking, pit excavation, and stub alignment at Location AP-01 |
| **DOC-STUB**| **Stub Setting & Leveling Record** | Upon stub alignment | Pit excavation complete + stubs issued | Ensures diagonal, level, and template pitch verification before concrete pour |
| **DOC-JMC** | **Joint Measurement Certificate (JMC)**| Monthly | Completed excavation, RCC, erection, stringing | Signed jointly with Utility Site Engineer; primary backup for monthly billing |

* **Ongoing Maintenance:**
  * Log daily gang headcount, machine utilization, weather hindrances, and executed quantities.
  * Maintain concrete cube test registers (7-day and 28-day compressive strengths).
