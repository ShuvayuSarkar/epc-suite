const fs = require('fs');
const path = require('path');

function scan(dir) {
  let list = [];
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) list = list.concat(scan(p));
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) list.push(p);
  }
  return list;
}

const files = scan('apps/web/src/pages');
const findings = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative('apps/web/src/pages', f).replace(/\\/g, '/');
  
  // Check for MOCK_ arrays defined directly with content
  const mockDefs = [];
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (/(?:const|let|var)\s+(MOCK_[A-Z0-9_]+|mock[A-Za-z0-9_]+)\s*[:=]\s*\[\s*\{/.test(l)) {
      mockDefs.push({ line: idx + 1, text: l.trim().slice(0, 70) });
    }
  });

  // Check for alert(
  const alerts = [];
  lines.forEach((l, idx) => {
    if (/\balert\s*\(/.test(l)) {
      alerts.push({ line: idx + 1, text: l.trim().slice(0, 70) });
    }
  });

  // Check for hardcoded project fallback e.g. || 'NTPC' or find(x => x.id === 'PRJ-...' or 'm1')
  const hardcodedProjectFallbacks = [];
  lines.forEach((l, idx) => {
    if (/(?:find|filter)\s*\([^)]*===\s*['"](?:PRJ-|m1|t1|crs1|b1|c1)/.test(l)) {
      hardcodedProjectFallbacks.push({ line: idx + 1, text: l.trim().slice(0, 70) });
    }
    if (/\|\|\s*['"](NTPC|PRJ-)/.test(l)) {
      hardcodedProjectFallbacks.push({ line: idx + 1, text: l.trim().slice(0, 70) });
    }
  });

  if (mockDefs.length || alerts.length || hardcodedProjectFallbacks.length) {
    findings.push({ file: rel, mockDefs, alerts, hardcodedProjectFallbacks });
  }
}

console.log('Total files scanned:', files.length);
console.log('Files with mock array literals or alerts or hardcoded fallbacks:', findings.length);
findings.forEach(f => {
  console.log('--- ' + f.file + ' ---');
  if (f.mockDefs.length) console.log('  Mock Defs:', f.mockDefs);
  if (f.alerts.length) console.log('  Alerts:', f.alerts);
  if (f.hardcodedProjectFallbacks.length) console.log('  Fallbacks:', f.hardcodedProjectFallbacks);
});
