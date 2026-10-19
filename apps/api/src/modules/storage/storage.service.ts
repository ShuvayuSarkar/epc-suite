import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StorageItem } from './entities/storage-item.entity';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(StorageItem)
    private readonly repo: Repository<StorageItem>,
    private readonly dataSource: DataSource,
  ) {}

  async getItem<T>(key: string): Promise<T | null> {
    const item = await this.repo.findOne({ where: { key } });
    if (key === 'epc_projects') {
      const projects = await this.loadProjectsFromRelational();
      if (projects.length > 0) {
        if (!item || !Array.isArray(item.data) || item.data.length < projects.length) {
          // Keep storage in sync with relational projects
          await this.setItem('epc_projects', projects);
          return projects as unknown as T;
        }
      }
    }
    return item ? (item.data as T) : null;
  }

  async setItem<T>(key: string, data: T): Promise<{ success: boolean; key: string }> {
    let item = await this.repo.findOne({ where: { key } });
    if (item) {
      item.data = data;
    } else {
      item = this.repo.create({ key, data });
    }
    await this.repo.save(item);

    // Asynchronously synchronize to respective relational tables in PostgreSQL / Supabase
    this.syncRelational(key, data).catch(err => {
      this.logger.warn(`Relational sync warning for "${key}": ${err.message}`);
    });

    return { success: true, key };
  }

  async removeItem(key: string): Promise<{ success: boolean }> {
    await this.repo.delete(key);
    return { success: true };
  }

  async getAllKeys(): Promise<string[]> {
    const items = await this.repo.find({ select: ['key'] });
    return items.map(i => i.key);
  }

  async bulkGet(keys?: string[]): Promise<Record<string, any>> {
    const items = await this.repo.find();
    const map = items.reduce((acc, curr) => {
      acc[curr.key] = curr.data;
      return acc;
    }, {} as Record<string, any>);

    // Ensure epc_projects always has all relational projects
    const relationalProjects = await this.loadProjectsFromRelational();
    if (relationalProjects.length > 0) {
      if (!map['epc_projects'] || (Array.isArray(map['epc_projects']) && map['epc_projects'].length < relationalProjects.length)) {
        map['epc_projects'] = relationalProjects;
        await this.repo.save(this.repo.create({ key: 'epc_projects', data: relationalProjects }));
      }
    }

    return map;
  }

  public async loadProjectsFromRelational(): Promise<any[]> {
    try {
      const rows = await this.dataSource.query(`
        SELECT 
          p."BidID" as id,
          p."CurrentSubState" as name,
          COALESCE(c."ShortName", c."LegalName", 'Client') as client,
          CONCAT('Type ', COALESCE(pt."Code"::text, 'A')) as type,
          CASE 
            WHEN p."CurrentStage" = 'S0_BIDDING' THEN 'S0: Tendering'
            WHEN p."CurrentStage" = 'S1_AWARD_RECEIPT' THEN 'S1: Pre-Award'
            WHEN p."CurrentStage" = 'S2_GOLDEN_PERIOD' THEN 'S2: Golden Period'
            WHEN p."CurrentStage" = 'S3_POST_AWARD_EXECUTION' THEN 'S3: Manufacturing'
            WHEN p."CurrentStage" = 'S4_MATERIAL_EXECUTION' THEN 'S4: Procurement'
            WHEN p."CurrentStage" = 'S5_INSTALLATION' THEN 'S5: Installation'
            WHEN p."CurrentStage" = 'S6_COMMISSIONING' THEN 'S6: Commissioning'
            WHEN p."CurrentStage" = 'S7_BILLING' THEN 'S7: Billing & Handover'
            ELSE REPLACE(p."CurrentStage"::text, '_', ': ')
          END as stage,
          CASE WHEN p."ContractValue" > 1000000000 THEN 'green' ELSE 'amber' END as health,
          CASE 
            WHEN p."CurrentStage" = 'S0_BIDDING' THEN 5
            WHEN p."CurrentStage" = 'S1_AWARD_RECEIPT' THEN 15
            WHEN p."CurrentStage" = 'S2_GOLDEN_PERIOD' THEN 25
            WHEN p."CurrentStage" = 'S3_POST_AWARD_EXECUTION' THEN 40
            WHEN p."CurrentStage" = 'S4_MATERIAL_EXECUTION' THEN 55
            WHEN p."CurrentStage" = 'S5_INSTALLATION' THEN 70
            WHEN p."CurrentStage" = 'S6_COMMISSIONING' THEN 88
            WHEN p."CurrentStage" = 'S7_BILLING' THEN 98
            ELSE 50
          END as completion,
          CONCAT('₹', ROUND(p."ContractValue" / 10000000, 1), ' Cr') as value,
          TO_CHAR(p."AwardDate", 'DD Mon YYYY') as date
        FROM projects p
        LEFT JOIN clients c ON p."ClientID" = c."ClientID"
        LEFT JOIN project_types pt ON p."ProjectTypeID" = pt."ProjectTypeID"
        ORDER BY p."CreatedAt" DESC;
      `);
      return rows;
    } catch (err: any) {
      this.logger.warn(`Could not load relational projects: ${err.message}`);
      return [];
    }
  }

  private async syncRelational(key: string, data: any): Promise<void> {
    if (!Array.isArray(data)) return;

    if (key === 'epc_projects') {
      await this.syncProjects(data);
    } else if (key === 'epc_clients') {
      await this.syncClients(data);
    } else if (key === 'epc_vendors') {
      await this.syncVendors(data);
    } else if (key === 'epc_contracts') {
      await this.syncContracts(data);
    } else if (key === 'epc_bills') {
      await this.syncBills(data);
    } else if (key === 'epc_invoices') {
      await this.syncInvoices(data);
    } else if (key === 'epc_inventory_stock' || key === 'epc_inventory') {
      await this.syncInventory(data);
    } else if (key === 'epc_dpr_logs') {
      await this.syncDprs(data);
    } else if (key === 'epc_pos') {
      await this.syncPos(data);
    } else if (key === 'epc_employees') {
      await this.syncEmployees(data);
    } else if (key === 'epc_gangs') {
      await this.syncGangs(data);
    } else if (key === 'epc_hotspots') {
      await this.syncHotspots(data);
    } else if (key === 'epc_safety_incidents') {
      await this.syncSafetyIncidents(data);
    } else if (key === 'epc_inspections') {
      await this.syncInspections(data);
    } else if (key === 'epc_ncrs') {
      await this.syncNcrs(data);
    }
  }

  private async syncProjects(projects: any[]): Promise<void> {
    const defaultClient = await this.dataSource.query('SELECT "ClientID" FROM clients LIMIT 1');
    const defaultType = await this.dataSource.query('SELECT "ProjectTypeID" FROM project_types LIMIT 1');
    const fallbackClientId = defaultClient[0]?.ClientID;
    const fallbackTypeId = defaultType[0]?.ProjectTypeID;

    for (const p of projects) {
      if (!p || (!p.id && !p.bidId)) continue;
      const bidId = String(p.id || p.bidId).trim();

      // Find or create client
      let clientId = fallbackClientId;
      if (p.client) {
        const clientName = String(p.client).trim();
        const cRow = await this.dataSource.query(
          'SELECT "ClientID" FROM clients WHERE "ShortName" ILIKE $1 OR "LegalName" ILIKE $1 LIMIT 1',
          [`%${clientName}%`]
        );
        if (cRow && cRow.length > 0) {
          clientId = cRow[0].ClientID;
        } else {
          // Dynamically insert new client
          const newClient = await this.dataSource.query(`
            INSERT INTO clients ("ClientID", "LegalName", "ShortName", "AwardDocumentType", "ReferenceFormat", "PortalIntegrationType", "PaymentTerms", "RetentionPct", "Currency", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), $1, $1, 'LOA', $2, 'API', '30 Days Net', 10, 'INR', NOW(), NOW())
            RETURNING "ClientID";
          `, [clientName, `${clientName.toUpperCase()}/2026/001`]);
          if (newClient && newClient.length > 0) clientId = newClient[0].ClientID;
        }
      }

      // Find type
      let typeId = fallbackTypeId;
      const codeMatch = String(p.type || 'A').match(/[A-E]/i);
      const code = codeMatch ? codeMatch[0].toUpperCase() : 'A';
      const ptRow = await this.dataSource.query('SELECT "ProjectTypeID" FROM project_types WHERE "Code" = $1 LIMIT 1', [code]);
      if (ptRow && ptRow.length > 0) typeId = ptRow[0].ProjectTypeID;

      // Stage
      let stage = 'S0_BIDDING';
      const st = String(p.stage || '').toUpperCase();
      if (st.includes('S1')) stage = 'S1_AWARD_RECEIPT';
      else if (st.includes('S2')) stage = 'S2_GOLDEN_PERIOD';
      else if (st.includes('S3')) stage = 'S3_POST_AWARD_EXECUTION';
      else if (st.includes('S4')) stage = 'S4_MATERIAL_EXECUTION';
      else if (st.includes('S5')) stage = 'S5_INSTALLATION';
      else if (st.includes('S6')) stage = 'S6_COMMISSIONING';
      else if (st.includes('S7')) stage = 'S7_BILLING';

      // Value
      let val = 500000000;
      if (typeof p.value === 'number') val = p.value;
      else if (typeof p.value === 'string') {
        const num = parseFloat(p.value.replace(/[^\d.]/g, ''));
        if (!isNaN(num)) {
          if (p.value.includes('Cr')) val = num * 10000000;
          else if (p.value.includes('Lakh')) val = num * 100000;
          else val = num;
        }
      }

      const subState = p.name || 'Active';

      await this.dataSource.query(`
        INSERT INTO projects ("ProjectID", "ClientID", "ProjectTypeID", "CurrentStage", "CurrentSubState", "BidID", "AwardDate", "ContractValue", "CreatedAt", "UpdatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), $6, NOW(), NOW())
        ON CONFLICT ("BidID") DO UPDATE SET
          "ClientID" = EXCLUDED."ClientID",
          "ProjectTypeID" = EXCLUDED."ProjectTypeID",
          "CurrentStage" = EXCLUDED."CurrentStage",
          "CurrentSubState" = EXCLUDED."CurrentSubState",
          "ContractValue" = EXCLUDED."ContractValue",
          "UpdatedAt" = NOW();
      `, [clientId, typeId, stage, subState, bidId, val]);
    }
    this.logger.log(`Synced ${projects.length} projects to Supabase "projects" table.`);
  }

  private async syncClients(clients: any[]): Promise<void> {
    for (const c of clients) {
      if (!c) continue;
      const short = (c.shortName || c.name || c.legalName || 'Client').trim();
      const legal = (c.legalName || c.name || short).trim();
      const docType = ['LOA', 'NOA', 'LOI'].includes(c.awardDocType) ? c.awardDocType : 'LOA';
      const portal = ['API', 'SFTP', 'MANUAL'].includes(String(c.portalIntegration || '').toUpperCase())
        ? String(c.portalIntegration).toUpperCase()
        : 'API';
      const ret = Number(c.retentionPct) || 10;
      const terms = c.paymentTerms || '30 Days Net';
      const ref = c.referenceFormat || `${short}/2024/001`;

      await this.dataSource.query(`
        INSERT INTO clients ("ClientID", "LegalName", "ShortName", "AwardDocumentType", "ReferenceFormat", "PortalIntegrationType", "PaymentTerms", "RetentionPct", "Currency", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'INR', NOW(), NOW())
        ON CONFLICT ("ShortName") DO UPDATE SET
          "LegalName" = EXCLUDED."LegalName",
          "AwardDocumentType" = EXCLUDED."AwardDocumentType",
          "ReferenceFormat" = EXCLUDED."ReferenceFormat",
          "PortalIntegrationType" = EXCLUDED."PortalIntegrationType",
          "PaymentTerms" = EXCLUDED."PaymentTerms",
          "RetentionPct" = EXCLUDED."RetentionPct",
          "updatedAt" = NOW();
      `, [legal, short, docType, ref, portal, terms, ret]);
    }
    this.logger.log(`Synced ${clients.length} clients to Supabase "clients" table.`);
  }

  private async syncVendors(vendors: any[]): Promise<void> {
    for (const v of vendors) {
      if (!v) continue;
      const code = String(v.code || v.vendorCode || v.id || 'VND-001').trim();
      const name = v.name || v.vendorName || 'Vendor Name';
      const cat = v.category || 'General';
      const st = String(v.status || 'ACTIVE').toUpperCase();
      const status = ['ACTIVE', 'SUSPENDED', 'BLACKLISTED'].includes(st) ? st : 'ACTIVE';

      await this.dataSource.query(`
        INSERT INTO vendors ("vendorId", "vendorName", "vendorCode", "category", "isEmpanelled", "deliveryRating", "qualityRating", "overallScore", "status", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, true, 4.5, 4.5, 90, $4, NOW(), NOW())
        ON CONFLICT ("vendorCode") DO UPDATE SET
          "vendorName" = EXCLUDED."vendorName",
          "category" = EXCLUDED."category",
          "status" = EXCLUDED."status",
          "updatedAt" = NOW();
      `, [name, code, cat, status]);
    }
    this.logger.log(`Synced ${vendors.length} vendors to Supabase "vendors" table.`);
  }

  private async syncContracts(contracts: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID", "ClientID" FROM projects LIMIT 1');
    if (!pRow || pRow.length === 0) return;
    const { ProjectID, ClientID } = pRow[0];

    for (const c of contracts) {
      if (!c) continue;
      const num = String(c.id || c.contractNumber || 'CONT-001').trim();
      let val = 100000000;
      if (typeof c.value === 'number') val = c.value;
      else if (typeof c.value === 'string') {
        const n = parseFloat(c.value.replace(/[^\d.]/g, ''));
        if (!isNaN(n)) val = c.value.includes('Cr') ? n * 10000000 : n * 100000;
      }

      await this.dataSource.query(`
        INSERT INTO contracts ("contractId", "projectId", "clientId", "contractNumber", "contractType", "signedDate", "contractValue", "retentionPct", "status", "complianceStatus", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, 'Turnkey EPC', NOW(), $4, 10, 'ACTIVE', 'COMPLIANT', NOW(), NOW())
        ON CONFLICT ("contractNumber") DO UPDATE SET
          "contractValue" = EXCLUDED."contractValue",
          "updatedAt" = NOW();
      `, [ProjectID, ClientID, num, val]);
    }
    this.logger.log(`Synced ${contracts.length} contracts to Supabase "contracts" table.`);
  }

  private async syncBills(bills: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    if (!pRow?.length) return;
    const pid = pRow[0].ProjectID;

    for (const b of bills) {
      if (!b) continue;
      const num = String(b.id || b.billNumber || 'BILL-001').trim();
      const vname = b.vendor || b.vendorName || 'General Vendor';
      let net = Number(b.netAmount || b.grossAmount) || 5000000;
      if (typeof b.amount === 'string') {
        const n = parseFloat(b.amount.replace(/[^\d.]/g, ''));
        if (!isNaN(n)) net = b.amount.includes('Cr') ? n * 10000000 : n * 100000;
      }

      await this.dataSource.query(`
        INSERT INTO bills ("BillID", "ProjectID", "BillNumber", "VendorName", "BillType", "GrossAmount", "NetAmount", "Status", "PaymentMethod", "SubmittedDate", "CreatedAt", "UpdatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, 'MANUFACTURING', $4, $4, 'RECEIVED', 'NEFT', NOW(), NOW(), NOW())
        ON CONFLICT ("BillNumber") DO UPDATE SET
          "NetAmount" = EXCLUDED."NetAmount",
          "GrossAmount" = EXCLUDED."GrossAmount",
          "VendorName" = EXCLUDED."VendorName",
          "UpdatedAt" = NOW();
      `, [pid, num, vname, net]);
    }
    this.logger.log(`Synced ${bills.length} bills to Supabase "bills" table.`);
  }

  private async syncInvoices(invoices: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID", "ClientID" FROM projects LIMIT 1');
    if (!pRow?.length) return;
    const { ProjectID, ClientID } = pRow[0];

    for (const inv of invoices) {
      if (!inv) continue;
      const num = String(inv.id || inv.invoiceNumber || 'INV-001').trim();
      let net = 10000000;
      if (typeof inv.amount === 'string') {
        const n = parseFloat(inv.amount.replace(/[^\d.]/g, ''));
        if (!isNaN(n)) net = inv.amount.includes('Cr') ? n * 10000000 : n * 100000;
      } else if (typeof inv.netAmount === 'number') {
        net = inv.netAmount;
      }

      await this.dataSource.query(`
        INSERT INTO invoices ("invoiceId", "projectId", "clientId", "invoiceNumber", "invoiceType", "grossAmount", "netAmount", "invoiceDate", "dueDate", "status", "agingBucket", "overdueDays", "escalationLevel", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, 'SUPPLY_80', $4, $4, NOW(), NOW() + INTERVAL '30 days', 'DUE', 'CURRENT', 0, 'NONE', NOW(), NOW())
        ON CONFLICT ("invoiceNumber") DO UPDATE SET
          "netAmount" = EXCLUDED."netAmount",
          "grossAmount" = EXCLUDED."grossAmount",
          "updatedAt" = NOW();
      `, [ProjectID, ClientID, num, net]);
    }
    this.logger.log(`Synced ${invoices.length} invoices to Supabase "invoices" table.`);
  }

  private async syncInventory(items: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const it of items) {
      if (!it) continue;
      const code = String(it.id || it.code || it.itemCode || it.materialCode || 'MAT-001').trim();
      const desc = it.name || it.description || it.materialDescription || 'Inventory Material';
      const cat = it.category || 'General';
      const qty = Number(it.quantity || it.currentQuantity) || 100;

      await this.dataSource.query(`
        INSERT INTO inventory_items ("InventoryItemID", "ProjectID", "MaterialCode", "MaterialDescription", "Category", "StoreLocation", "CurrentQuantity", "ReorderLevel", "Status", "DrumNumber", "DrumCondition", "CreatedAt", "UpdatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, 'Central Warehouse', $5, 20, 'IN_STOCK', 'DRUM-01', 'GOOD', NOW(), NOW())
        ON CONFLICT ("MaterialCode") DO UPDATE SET
          "CurrentQuantity" = EXCLUDED."CurrentQuantity",
          "MaterialDescription" = EXCLUDED."MaterialDescription",
          "UpdatedAt" = NOW();
      `, [pid, code, desc, cat, qty]);
    }
    this.logger.log(`Synced ${items.length} inventory items to Supabase "inventory_items" table.`);
  }

  private async syncDprs(dprs: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const d of dprs) {
      if (!d) continue;
      const weather = d.weather || 'Clear';
      const km = Number(d.kmInstalled) || 1.5;
      const manpower = Number(d.manpower || d.workers) || 25;

      await this.dataSource.query(`
        INSERT INTO daily_dprs ("DPRID", "ProjectID", "ReportDate", "KmInstalled", "ManpowerCount", "IdleTimeHours", "WeatherCondition", "RFICount", "GPSLat", "GPSLon", "IsGeofenced", "CreatedAt")
        VALUES (gen_random_uuid(), $1, NOW(), $2, $3, 0, $4, 0, 21.712, 83.161, true, NOW())
      `, [pid, km, manpower, weather]);
    }
    this.logger.log(`Synced ${dprs.length} DPRs to Supabase "daily_dprs" table.`);
  }

  private async syncPos(pos: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;
    const vRow = await this.dataSource.query('SELECT "vendorId" FROM vendors LIMIT 1');
    const vid = vRow?.[0]?.vendorId;

    for (const po of pos) {
      if (!po) continue;
      const poNum = String(po.id || po.poNumber || 'PO-2026-001').trim();
      let amt = Number(po.totalAmount || po.amount) || 15000000;
      if (typeof po.amount === 'string') {
        const n = parseFloat(po.amount.replace(/[^\d.]/g, ''));
        if (!isNaN(n)) amt = po.amount.includes('Cr') ? n * 10000000 : n * 100000;
      }
      let st = String(po.status || 'ISSUED').toUpperCase();
      if (!['DRAFT','ISSUED','ACKNOWLEDGED','IN_PRODUCTION','DISPATCHED','DELIVERED','CLOSED'].includes(st)) {
        st = 'ISSUED';
      }

      await this.dataSource.query(`
        INSERT INTO procurement_orders ("procurementOrderId", "projectId", "vendorId", "poNumber", "poDate", "totalAmount", "status", "deliveryDeadline", "paymentTerms", "technicalApprovalStatus", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4, $5, NOW() + INTERVAL '45 days', '30 Days Net', 'APPROVED', NOW(), NOW())
        ON CONFLICT ("poNumber") DO UPDATE SET
          "totalAmount" = EXCLUDED."totalAmount",
          "status" = EXCLUDED."status",
          "updatedAt" = NOW();
      `, [pid, vid, poNum, amt, st]);
    }
    this.logger.log(`Synced ${pos.length} POs to Supabase "procurement_orders" table.`);
  }

  private async syncEmployees(employees: any[]): Promise<void> {
    for (const emp of employees) {
      if (!emp) continue;
      const code = String(emp.code || emp.employeeCode || emp.id || 'EMP-001').trim();
      const name = emp.name || emp.fullName || 'Employee Name';
      const dept = emp.department || 'Operations';
      const desig = emp.designation || emp.role || 'Staff';
      let st = String(emp.status || 'ACTIVE').toUpperCase();
      if (!['ACTIVE','INACTIVE','TERMINATED'].includes(st)) st = 'ACTIVE';

      await this.dataSource.query(`
        INSERT INTO employees ("employeeId", "fullName", "employeeCode", "department", "designation", "employmentType", "joinDate", "status", "monthlySalary", "email", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PERMANENT', NOW() - INTERVAL '1 year', $5, 75000, $6, NOW(), NOW())
        ON CONFLICT ("employeeCode") DO UPDATE SET
          "fullName" = EXCLUDED."fullName",
          "department" = EXCLUDED."department",
          "designation" = EXCLUDED."designation",
          "status" = EXCLUDED."status",
          "updatedAt" = NOW();
      `, [name, code, dept, desig, st, `${code.toLowerCase()}@apar.com`]);
    }
    this.logger.log(`Synced ${employees.length} employees to Supabase "employees" table.`);
  }

  private async syncGangs(gangs: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const g of gangs) {
      if (!g) continue;
      const name = String(g.name || g.gangName || 'Gang-01').trim();
      const sup = g.supervisor || g.supervisorName || 'Supervisor';
      let type = String(g.type || g.gangType || 'CONDUCTOR').toUpperCase();
      if (!['CONDUCTOR','OPGW','SUBSTATION','CIVIL'].includes(type)) type = 'CONDUCTOR';
      let st = String(g.status || 'ACTIVE').toUpperCase();
      if (!['MOBILIZED','ACTIVE','IDLE','DEMOBILIZED'].includes(st)) st = 'ACTIVE';
      const fitters = Number(g.fitters || g.fitterCount) || 4;
      const labor = Number(g.labor || g.laborCount || g.workers) || 12;

      const existing = await this.dataSource.query('SELECT "GangID" FROM gangs WHERE "GangName" = $1 LIMIT 1', [name]);
      if (existing && existing.length > 0) {
        await this.dataSource.query(`
          UPDATE gangs SET "SupervisorName" = $1, "GangType" = $2, "Status" = $3, "FitterCount" = $4, "LaborCount" = $5, "UpdatedAt" = NOW()
          WHERE "GangName" = $6;
        `, [sup, type, st, fitters, labor, name]);
      } else {
        await this.dataSource.query(`
          INSERT INTO gangs ("GangID", "ProjectID", "GangName", "GangType", "SupervisorName", "FitterCount", "LaborCount", "DailyTargetKm", "Status", "CurrentLocation", "CreatedAt", "UpdatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 0.5, $7, 'Ch 12+500', NOW(), NOW());
        `, [pid, name, type, sup, fitters, labor, st]);
      }
    }
    this.logger.log(`Synced ${gangs.length} gangs to Supabase "gangs" table.`);
  }

  private async syncHotspots(hotspots: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const h of hotspots) {
      if (!h) continue;
      const desc = String(h.description || h.name || h.title || 'Hotspot issue').trim();
      let sev = String(h.severity || 'MEDIUM').toUpperCase();
      if (!['LOW','MEDIUM','HIGH','CRITICAL'].includes(sev)) sev = 'MEDIUM';
      let st = String(h.status || 'IDENTIFIED').toUpperCase();
      if (!['IDENTIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','ESCALATED'].includes(st)) st = 'IDENTIFIED';
      const lat = Number(h.lat || h.gpsLat) || 21.712;
      const lon = Number(h.lon || h.gpsLon) || 83.161;

      const existing = await this.dataSource.query('SELECT "hotspotId" FROM hotspots WHERE "description" = $1 LIMIT 1', [desc]);
      if (existing && existing.length > 0) {
        await this.dataSource.query(`
          UPDATE hotspots SET "severity" = $1, "status" = $2, "updatedAt" = NOW() WHERE "description" = $3;
        `, [sev, st, desc]);
      } else {
        await this.dataSource.query(`
          INSERT INTO hotspots ("hotspotId", "projectId", "description", "gpsLat", "gpsLon", "severity", "status", "identifiedDate", "escalationLevel", "visitCount", "hotspotType", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), 1, 1, 'ROW', NOW(), NOW());
        `, [pid, desc, lat, lon, sev, st]);
      }
    }
    this.logger.log(`Synced ${hotspots.length} hotspots to Supabase "hotspots" table.`);
  }

  private async syncSafetyIncidents(incidents: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const inc of incidents) {
      if (!inc) continue;
      const desc = String(inc.description || inc.title || 'Safety observation').trim();
      const loc = inc.location || 'Site Location';
      const repBy = inc.reportedBy || 'Safety Officer';
      let sev = String(inc.severity || 'MINOR').toUpperCase();
      if (!['MINOR','MAJOR','CRITICAL','FATAL'].includes(sev)) sev = 'MINOR';
      let invSt = String(inc.investigationStatus || inc.status || 'REPORTED').toUpperCase();
      if (!['REPORTED','INVESTIGATING','CLOSED'].includes(invSt)) invSt = 'REPORTED';

      const existing = await this.dataSource.query('SELECT "incidentId" FROM safety_incidents WHERE "description" = $1 LIMIT 1', [desc]);
      if (existing && existing.length > 0) {
        await this.dataSource.query(`
          UPDATE safety_incidents SET "severity" = $1, "investigationStatus" = $2 WHERE "description" = $3;
        `, [sev, invSt, desc]);
      } else {
        await this.dataSource.query(`
          INSERT INTO safety_incidents ("incidentId", "projectId", "incidentType", "description", "location", "severity", "reportedBy", "reportedDate", "investigationStatus", "createdAt")
          VALUES (gen_random_uuid(), $1, 'Near Miss', $2, $3, $4, $5, NOW(), $6, NOW());
        `, [pid, desc, loc, sev, repBy, invSt]);
      }
    }
    this.logger.log(`Synced ${incidents.length} safety incidents to Supabase "safety_incidents" table.`);
  }

  private async syncInspections(inspections: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const insp of inspections) {
      if (!insp) continue;
      const cat = insp.category || insp.inspectionType || 'General QA';
      const inspector = insp.inspector || insp.inspectorName || 'Lead Inspector';
      let type = String(insp.type || insp.inspectionType || 'FACTORY').toUpperCase();
      if (!['FACTORY','TPIA','FAT','SITE','PRE_COMMISSIONING'].includes(type)) type = 'FACTORY';
      let st = String(insp.status || 'SCHEDULED').toUpperCase();
      if (!['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'].includes(st)) st = 'SCHEDULED';
      let res = String(insp.result || 'PASS').toUpperCase();
      if (!['PASS','FAIL','CONDITIONAL'].includes(res)) res = 'PASS';

      const existing = await this.dataSource.query('SELECT "inspectionId" FROM inspections WHERE "category" = $1 AND "scheduledDate" = $2 LIMIT 1', [cat, new Date().toISOString().split('T')[0]]);
      if (existing && existing.length > 0) {
        await this.dataSource.query(`
          UPDATE inspections SET "inspectorName" = $1, "status" = $2, "result" = $3, "updatedAt" = NOW() WHERE "inspectionId" = $4;
        `, [inspector, st, res, existing[0].inspectionId]);
      } else {
        await this.dataSource.query(`
          INSERT INTO inspections ("inspectionId", "projectId", "inspectionType", "category", "scheduledDate", "actualDate", "inspectorName", "result", "status", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW(), $4, $5, $6, NOW(), NOW());
        `, [pid, type, cat, inspector, res, st]);
      }
    }
    this.logger.log(`Synced ${inspections.length} inspections to Supabase "inspections" table.`);
  }

  private async syncNcrs(ncrs: any[]): Promise<void> {
    const pRow = await this.dataSource.query('SELECT "ProjectID" FROM projects LIMIT 1');
    const pid = pRow?.[0]?.ProjectID;

    for (const n of ncrs) {
      if (!n) continue;
      const desc = String(n.description || n.title || 'NCR Non-conformance').trim();
      let sev = String(n.severity || 'MINOR').toUpperCase();
      if (!['MINOR','MAJOR','CRITICAL'].includes(sev)) sev = 'MINOR';
      let st = String(n.status || 'OPEN').toUpperCase();
      if (!['OPEN','IN_PROGRESS','CLOSED'].includes(st)) st = 'OPEN';

      const existing = await this.dataSource.query('SELECT "ncrId" FROM ncrs WHERE "description" = $1 LIMIT 1', [desc]);
      if (existing && existing.length > 0) {
        await this.dataSource.query(`
          UPDATE ncrs SET "severity" = $1, "status" = $2, "updatedAt" = NOW() WHERE "description" = $3;
        `, [sev, st, desc]);
      } else {
        await this.dataSource.query(`
          INSERT INTO ncrs ("ncrId", "projectId", "description", "severity", "status", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW());
        `, [pid, desc, sev, st]);
      }
    }
    this.logger.log(`Synced ${ncrs.length} NCRs to Supabase "ncrs" table.`);
  }
}
