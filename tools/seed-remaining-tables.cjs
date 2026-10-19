const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.gqzyfugdhefbkolmiuiw:Vayu%40%231705epc@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function makeUuid(prefixHex, num) {
  // prefixHex must be hex chars only, e.g. 'a001', 'b002', 'c003'
  const p = (prefixHex + '00000000').slice(0, 8);
  const n = String(num).padStart(12, '0');
  return `${p}-0000-4000-a000-${n}`;
}

async function run() {
  await client.connect();
  console.log('Connected to Supabase.');

  const pRes = await client.query('SELECT "ProjectID" FROM projects LIMIT 5');
  const cRes = await client.query('SELECT "ClientID" FROM clients LIMIT 5');
  const ptRes = await client.query('SELECT "ProjectTypeID", "Code" FROM project_types LIMIT 5');

  const p1 = pRes.rows[0].ProjectID;
  const p2 = pRes.rows[1].ProjectID;
  const c1 = cRes.rows[0].ClientID;
  const ptA = ptRes.rows.find(r => r.Code === 'A')?.ProjectTypeID || ptRes.rows[0].ProjectTypeID;
  const ptB = ptRes.rows.find(r => r.Code === 'B')?.ProjectTypeID || ptRes.rows[1].ProjectTypeID;

  // 1. approval_checklist_items
  console.log('Seeding approval_checklist_items...');
  const checklist = [
    {
      id: makeUuid('ac10', 1), pid: p1, step: 'GTP Approval for Conductor', cat: 'Technical',
      stat: 'APPROVED', sub: '2023-09-01', app: '2023-09-15', sla: 14, elap: 14, ovd: false, esc: false, csla: true
    },
    {
      id: makeUuid('ac10', 2), pid: p1, step: 'Type Test Clearance for Hardware Fittings', cat: 'Quality',
      stat: 'SUBMITTED', sub: '2023-10-01', app: null, sla: 21, elap: 10, ovd: false, esc: false, csla: true
    },
    {
      id: makeUuid('ac10', 3), pid: p2, step: 'Forest Clearance - Stage 2 Tree Felling', cat: 'Statutory',
      stat: 'PENDING', sub: '2023-11-10', app: null, sla: 30, elap: 35, ovd: true, esc: true, csla: false
    },
  ];

  for (const it of checklist) {
    await client.query(`
      INSERT INTO approval_checklist_items ("checklistItemId", "projectId", "approvalStep", "category", "status", "submittedDate", "approvedDate", "slaDays", "daysElapsed", "isOverdue", "escalationTriggered", "clientSLA", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT ("checklistItemId") DO UPDATE SET "approvalStep" = $3, "updatedAt" = NOW();
    `, [it.id, it.pid, it.step, it.cat, it.stat, it.sub, it.app, it.sla, it.elap, it.ovd, it.esc, it.csla]);
  }
  console.log(`Seeded ${checklist.length} approval checklist items.`);

  // 2. approval_matrix_rows
  console.log('Seeding approval_matrix_rows...');
  const matrixRows = [
    { id: makeUuid('ba10', 1), step: 'L2 Baseline Lock', appFrom: 'Client PD', trigger: 'S1 Complete', sla: 15, esc: 'C-Level Escalation', conf: true, cid: c1 },
    { id: makeUuid('ba10', 2), step: 'Manufacturing Clearance (MQP)', appFrom: 'Client QA', trigger: 'Design Frozen', sla: 21, esc: 'Head QA', conf: true, cid: c1 },
    { id: makeUuid('ba10', 3), step: 'Shutdown Permission', appFrom: 'SLDC/RLDC', trigger: 'Pre-Commissioning', sla: 30, esc: 'Operations Director', conf: false, cid: c1 },
  ];

  for (const mr of matrixRows) {
    await client.query(`
      INSERT INTO approval_matrix_rows ("RowID", "ProcessStep", "ApprovalFrom", "SystemTrigger", "SLADays", "EscalationPath", "ClientConfigurable", "ClientID")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("RowID") DO UPDATE SET "ProcessStep" = $2;
    `, [mr.id, mr.step, mr.appFrom, mr.trigger, mr.sla, mr.esc, mr.conf, mr.cid]);
  }
  console.log(`Seeded ${matrixRows.length} approval matrix rows.`);

  // 3. project_health_snapshots
  console.log('Seeding project_health_snapshots...');
  const snapshots = [
    {
      id: makeUuid('ea10', 1), pid: p1, date: '2024-03-31',
      overall: 'GREEN', mfg: 'GREEN', proc: 'GREEN', inst: 'GREEN', comm: 'AMBER', fin: 'GREEN',
      varDays: 0, costVar: 1.25, pendApp: 2, rfi: 1, hs: 0, rem: 'All milestones on schedule. Stringing at 85%.'
    },
    {
      id: makeUuid('ea10', 2), pid: p2, date: '2024-03-31',
      overall: 'AMBER', mfg: 'GREEN', proc: 'AMBER', inst: 'RED', comm: 'RED', fin: 'AMBER',
      varDays: 14, costVar: 4.80, pendApp: 5, rfi: 4, hs: 2, rem: 'Right of way issue at Loc 38 and delay in tower supply.'
    },
  ];

  for (const sn of snapshots) {
    await client.query(`
      INSERT INTO project_health_snapshots ("snapshotId", "projectId", "snapshotDate", "overallRAGStatus", "manufacturingRAG", "procurementRAG", "installationRAG", "commissioningRAG", "financeRAG", "scheduleVarianceDays", "costVariancePercent", "approvalsPending", "rfisOpen", "hotspotsOpen", "remarks", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      ON CONFLICT ("snapshotId") DO UPDATE SET "remarks" = $15;
    `, [sn.id, sn.pid, sn.date, sn.overall, sn.mfg, sn.proc, sn.inst, sn.comm, sn.fin, sn.varDays, sn.costVar, sn.pendApp, sn.rfi, sn.hs, sn.rem]);
  }
  console.log(`Seeded ${snapshots.length} project health snapshots.`);

  // 4. project_type_templates
  console.log('Seeding project_type_templates...');
  const templates = [
    {
      id: makeUuid('fa10', 1), ptId: ptA, name: 'Standard 400kV Reconductoring Master Template',
      actList: [ { name: 'Detailed Route Survey', weight: 5 }, { name: 'Tower Strengthening', weight: 15 }, { name: 'Conductor Stringing', weight: 50 }, { name: 'Testing & Charging', weight: 30 } ],
      matCats: [ 'HTLS Conductor', 'Hardware & Accessories', 'Insulator Strings', 'OPGW' ],
      wbs: { levels: ['Project', 'Package', 'Section', 'Span', 'Tower'] },
      matrix: { defaultSLA: 14 },
      benchmarks: { stringingPerDayKm: 1.5 },
      docs: ['GTP', 'Drawings', 'Sag-Tension Chart', 'Drum Schedule'],
      customSets: {},
      version: 1, active: true
    },
    {
      id: makeUuid('fa10', 2), ptId: ptB, name: 'Substation Bay Extension EPC Template',
      actList: [ { name: 'Civil Foundations', weight: 25 }, { name: 'Equipment Erection', weight: 40 }, { name: 'Cabling & Terminations', weight: 20 }, { name: 'Commissioning', weight: 15 } ],
      matCats: [ 'Transformers', 'Circuit Breakers', 'Current Transformers', 'Control Panels' ],
      wbs: { levels: ['Substation', 'Bay', 'Feeder', 'Equipment'] },
      matrix: { defaultSLA: 21 },
      benchmarks: { bayErectionDays: 45 },
      docs: ['Single Line Diagram', 'Foundation Layout', 'Control Logic'],
      customSets: {},
      version: 1, active: true
    }
  ];

  for (const tpl of templates) {
    await client.query(`
      INSERT INTO project_type_templates ("templateId", "projectTypeId", "templateName", "activityList", "materialCategories", "wbsHierarchy", "approvalMatrix", "benchmarks", "docChecklist", "customActivitySets", "version", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT ("templateId") DO UPDATE SET "templateName" = $3, "updatedAt" = NOW();
    `, [tpl.id, tpl.ptId, tpl.name, JSON.stringify(tpl.actList), JSON.stringify(tpl.matCats), JSON.stringify(tpl.wbs), JSON.stringify(tpl.matrix), JSON.stringify(tpl.benchmarks), JSON.stringify(tpl.docs), JSON.stringify(tpl.customSets), tpl.version, tpl.active]);
  }
  console.log(`Seeded ${templates.length} project type templates.`);

  console.log('✅ ALL remaining tables seeded successfully!');
  await client.end();
}

run().catch(err => {
  console.error(err);
  client.end();
  process.exit(1);
});
