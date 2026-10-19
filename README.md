# EPC Suite — Enterprise EPC Project Management & Execution Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-blue)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2010%20%7C%20TypeORM-red)](https://nestjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Supabase-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-orange)](#license)

**EPC Suite** is a mission-critical, enterprise-grade Engineering, Procurement, and Construction (EPC) project execution platform engineered for high-voltage transmission lines, substations, and underground cabling projects. It covers end-to-end lifecycle governance from tender bidding to commissioning and financial closure.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Quickstart: Starting the Servers](#quickstart-starting-the-servers)
5. [Monorepo Workspace Structure](#monorepo-workspace-structure)
6. [Comprehensive Module Guide (27 Modules)](#comprehensive-module-guide-27-modules)
7. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
8. [Database & Seeding Utilities](#database--seeding-utilities)
9. [Available Scripts](#available-scripts)

---

## Architecture Overview

```mermaid
graph TD
    Client["Client Browser (React 18 + Vite SPA)"]
    WebRouter["React Router v6 + Zustand + React Query"]
    RBAC["BRD Role-Based Access Gate (22 Roles)"]
    API["NestJS 10 API Gateway (Port 3000)"]
    Auth["JWT Auth Guard + Request Log Interceptor"]
    TypeORM["TypeORM Data Access Layer"]
    DB[("PostgreSQL / Supabase Database")]

    Client --> WebRouter
    WebRouter --> RBAC
    RBAC -->|HTTP / REST API| API
    API --> Auth
    Auth --> TypeORM
    TypeORM --> DB
```

- **Frontend (`apps/web`)**: Vite + React 18 single-page application with TailwindCSS, Lucide icons, Recharts visualizations, and offline-first persistent caching.
- **Backend (`apps/api`)**: NestJS 10 enterprise REST API with TypeORM, class-validator DTOs, global request logging, and auto-seeding.
- **Shared Libraries (`libs/*`)**: Shared TypeScript interfaces, enums, and XState state machine contracts across the monorepo.

---

## Prerequisites

Before running the application, ensure the following are installed:
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL / Supabase**: PostgreSQL database instance (or a free Supabase project)

---

## Environment Configuration

### 1. Backend (`apps/api/.env`)
Create an `.env` file in `apps/api/` (or copy from `apps/api/.env.example`):

```bash
# In apps/api/.env
PORT=3000
DB_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
JWT_SECRET=epc_suite_jwt_secret_2026_dev
NODE_ENV=development
```

> **Note**: If using Supabase, obtain the direct or pooled connection string from **Project Settings -> Database -> Connection string**.

---

## Quickstart: Starting the Servers

### 1. Install Dependencies
Run from the repository root:
```bash
npm install
```

### 2. Start the Development Servers

You can start each server in separate terminal windows:

#### Terminal 1 — Frontend Web Application:
```bash
npm run dev:web
```
- **URL**: `http://localhost:5173`
- Default Vite development server with Hot Module Replacement (HMR).

#### Terminal 2 — Backend API:
```bash
npm run dev:api
```
- **URL**: `http://localhost:3000`
- **Audit Logbook**: `http://localhost:3000/api/admin/request-log`
- Auto-reloads on file changes using NestJS Watch mode.

---

## Monorepo Workspace Structure

```
epc-suite/
├── apps/
│   ├── web/                     # React 18 + Vite frontend
│   │   ├── src/
│   │   │   ├── components/      # Reusable UI components & layouts
│   │   │   ├── config/          # RBAC matrix, modules, and roles
│   │   │   ├── contexts/        # Auth and notification contexts
│   │   │   ├── pages/           # 27 functional module pages & dashboards
│   │   │   ├── types/           # Page-level types and data contracts
│   │   │   └── utils/           # Persistent storage, QR printing, revision engine
│   │   └── tailwind.config.js
│   └── api/                     # NestJS 10 backend API
│       ├── src/
│       │   ├── database/        # TypeORM database module & entities
│       │   ├── modules/         # Auth, RBAC, RequestLog, Seeder, and Domain modules
│       │   └── main.ts          # API entrypoint and global pipes
├── libs/
│   ├── shared-types/            # Shared data contracts and enums
│   └── state-machine-types/     # XState workflow definitions
├── tools/                       # Database sync, migration, and audit scripts
├── package.json                 # Monorepo scripts & workspaces
└── tsconfig.base.json           # Shared TypeScript configuration
```

---

## Comprehensive Module Guide (27 Modules)

The platform is partitioned into 27 functional modules aligned with the EPC Business Requirement Document (BRD):

| Module ID | Module Name | Primary Routes | Description |
|:---:|:---|:---|:---|
| **4.1** | **Project Mapping & DPR** | `/projects`, `/wbs`, `/installation/dpr` | Multi-level WBS structure, DPR approvals, tower-by-tower progress tracking. |
| **4.2** | **Collections Management** | `/collections` | Client invoicing, milestone billing, retention tracking, payment collections. |
| **4.3** | **Gang Management** | `/gangs`, `/installation/gangs` | Labor gangs, crew productivity, daily muster rolls, and site assignment. |
| **4.4** | **Hotspot & ROW Mapping** | `/hotspots`, `/site-surveys` | Right-of-Way (ROW) obstruction logs, landowner settlements, GPS coordinates. |
| **4.5** | **Resource & Golden Period** | `/resources`, `/golden-period/*` | Bank Guarantees (BG), Insurance policies, site licenses, tool allocations. |
| **4.6** | **EOT & Delay Claims** | `/eot` | Extension of Time (EOT) claims, delay event registers, liquidated damages risk. |
| **4.7** | **Finance Management** | `/finance`, `/finance/bills`, `/finance/budget` | Contractor billing, CBS cost node budgets, variance analysis, payment vouchers. |
| **4.8** | **PO Amendments** | `/po-amendments` | Quantity variations, price amendments, scope revisions on purchase orders. |
| **4.9** | **Risk Management** | `/risks` | Qualitative & quantitative risk register, impact assessment, mitigation plans. |
| **4.10** | **Contract Management** | `/contracts`, `/award` | Contract repository, milestones, payment terms, legal award documents. |
| **4.11** | **HR & Payroll** | `/hr` | Manpower deployments, site staff directory, attendance, regulatory payroll. |
| **4.12** | **Safety & HSE** | `/safety` | Incident reporting, hazard investigations, safety audits, daily toolbox talks. |
| **4.13** | **Quality Assurance & QC** | `/qa-qc` | Factory Acceptance Tests (FAT), TPIA coordination, Non-Conformance Reports (NCR). |
| **4.14** | **Procurement & Vendors** | `/procurement`, `/procurement/vendors`, `/procurement/purchase-orders` | Vendor empanelment, PO issuance, vendor scorecards, manufacturing clearance. |
| **4.15** | **Inventory & Warehouse** | `/inventory`, `/inventory/dispatch` | Central/Site stores, Material Receipt Notes (GRN), JVR, dispatch authorizations. |
| **4.16** | **Client Portal** | `/client-portal` | External client transparency dashboard with milestones and progress indicators. |
| **4.17** | **Correspondence** | `/correspondence` | Official client/PMC communication repository, incoming/outgoing letter logs. |
| **4.18** | **Engineering Doc Control** | `/engineering-docs`, `/engineering` | Drawing registers, revision control (Rev A, B, 0), GTP submittals, approval codes. |
| **4.19** | **Multi-Project Engine** | `/settings` | Dynamic template configuration for Transmission, Substation, and Cable lines. |
| **4.20** | **Commissioning & Handover**| `/commissioning`, `/stage6` | Pre-commissioning checklists, punch list resolution, energization certificates. |
| **4.21** | **RFI Management** | `/rfis` | Request for Information (RFI) lifecycle between site team, PMC, and design engineers. |
| **4.22** | **Minutes of Meeting (MOM)**| `/meetings` | Meeting records, attendee attendance, structured agenda items, linked action items. |
| **4.23** | **Transmittal Management** | `/transmittals` | Formal document transmittals, receipt acknowledgments, review SLA tracking. |
| **4.24** | **Deliverable Schedule** | `/deliverables`, `/deliverables/scurve` | Master Deliverables List (MDL), milestone weightages, planned vs. actual S-Curves. |
| **4.25** | **Comment Response Sheet** | `/crs` | Systematic sheet-by-sheet drawing review comments and resolution workflow. |
| **4.26** | **Statutory Approvals** | `/statutory-approvals` | Forest, Railway, NHAI, PTCC, and Aviation regulatory approvals register. |
| **4.27** | **Issue Tracker** | `/issues` | Cross-functional site obstruction, design conflict, and escalation board. |

---

## Role-Based Access Control (RBAC)

The application implements a strict **Role × Module matrix** supporting 22 discrete roles:

| Role ID | Role Title | Key Functional Scope |
|:---|:---|:---|
| `system_admin` | System Administrator | Full operational and administrative control across all 27 modules. |
| `project_director`| Project Director (PD) | Executive approvals, escalation handling, financial sign-offs. |
| `project_manager` | Project Manager (PM) | Execution management, DPR approvals, risk and schedule tracking. |
| `bid_manager` | Bid Manager | Tender proposals, BOQ estimation, pre-award milestones. |
| `lead_design_engineer`| Lead Design Engineer | Engineering drawings, GTPs, CRS comments, transmittals. |
| `vendor_manager` | Vendor Manager | Empanelment, vendor ratings, PO issuance, manufacturing clearance. |
| `quality_inspector`| Quality Inspector | FAT inspections, quality checklists, NCR issuance and closure. |
| `finance_controller`| Finance Controller | Client bill submissions, contractor bill pass-offs, budgets. |
| `store_manager` | Store Manager | Warehouse stock, GRN/JVR generation, dispatch acknowledgments. |
| `gang_supervisor` | Gang Supervisor | Site daily progress logging (DPR), crew attendance, site safety. |
| `safety_hse_officer`| Safety / HSE Officer | Safety audits, incident reporting, toolbox meeting compliance. |
| `document_controller`| Document Controller | Transmittal dispatch, CRS management, drawing registers. |
| `contract_manager`| Contract Manager | Contracts, PO amendments, delay logs, claim substantiation. |
| `compliance_officer`| Compliance Officer | Statutory permits, environmental and statutory clearances. |
| `client_stakeholder`| Client / Stakeholder | View-only portal access for monitoring progress and milestones. |

### Permission Hierarchy:
- **`F` (Full)**: Create, Read, Update, Delete, and configure.
- **`E` (Edit / Create)**: Create and update operational records.
- **`A` (Approve)**: Authority to approve or reject milestone submissions.
- **`R` (Read Only)**: View records without editing permissions.
- **`V` (View Portal)**: Restricted stakeholder summary views.
- **`null` (No Access)**: Hidden from navigation; unauthorized direct route access is blocked.

---

## Database & Seeding Utilities

The project includes pre-built audit and synchronization tools located in the `/tools` directory:

```bash
# Verify database connection and schema constraints
node tools/check-constraints.cjs

# Test full end-to-end sync between frontend storage and backend
node tools/test-end-to-end.cjs

# Seed all 52 core tables with master and sample transactional data
node tools/seed-all-data.cjs
```

---

## Available Scripts

From the repository root:

| Command | Action |
|:---|:---|
| `npm run dev` | Starts the frontend application on `http://localhost:5173` |
| `npm run dev:api` | Starts the backend NestJS API on `http://localhost:3000` |
| `npm run dev:web` | Alias for `npm run dev` |
| `npm run build` | Compiles both frontend and backend for production |
| `npm run build:web` | Builds the frontend bundle (`apps/web/dist`) |
| `npm run build:api` | Compiles the backend NestJS application (`apps/api/dist`) |
| `npm run test` | Executes unit and integration test suites |

---

## License

This software and its documentation are proprietary to **Apar Industries Limited**. All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.