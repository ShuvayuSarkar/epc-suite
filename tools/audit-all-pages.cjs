const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(fullPath));
    } else if (file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const pagesDir = path.resolve(__dirname, '../apps/web/src/pages');
const files = scanDir(pagesDir);
console.log('Total page files in apps/web/src/pages:', files.length);

const reports = [];
for (const f of files) {
  const rel = path.relative(pagesDir, f).replace(/\\/g, '/');
  const content = fs.readFileSync(f, 'utf8');
  const usesPersistentState = content.includes('usePersistentState');
  
  // Look for hardcoded data structures
  const hasMockConst = /const\s+(MOCK_[A-Za-z0-9_]+|mock[A-Za-z0-9_]+|initial[A-Za-z0-9_]+|INITIAL_[A-Za-z0-9_]+)\s*[:=]/i.test(content);
  const hasUseStateWithMock = /useState\s*(?:<[^>]*>)?\s*\(\s*(?:MOCK_|mock|initial|INITIAL_|\[\s*\{)/.test(content);
  
  // Look for DataTable data={...} or similar direct rendering
  const rendersDirectConst = /data=\{([A-Za-z0-9_]+)\}/.exec(content);
  let renderedVar = rendersDirectConst ? rendersDirectConst[1] : null;

  reports.push({
    file: rel,
    usesPersistentState,
    hasMockConst,
    hasUseStateWithMock,
    renderedVar
  });
}

console.log('\n=== 1. Pages completely missing usePersistentState ===');
const missingPersistent = reports.filter(r => !r.usesPersistentState);
console.log(`Found ${missingPersistent.length} files without usePersistentState:`);
missingPersistent.forEach(r => {
  console.log(` - ${r.file} ${r.hasMockConst ? '[Has Mock Constant]' : ''} ${r.hasUseStateWithMock ? '[Uses useState with Mock]' : ''}`);
});

console.log('\n=== 2. Files with usePersistentState but might have hardcoded defaults ===');
const withPersistent = reports.filter(r => r.usesPersistentState);
for (const r of withPersistent) {
  const fullPath = path.join(pagesDir, r.file);
  const content = fs.readFileSync(fullPath, 'utf8');
  // Check what key is used in usePersistentState
  const keys = [];
  const regex = /usePersistentState\s*(?:<[^>]*>)?\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    keys.push(m[1]);
  }
  if (keys.length === 0) {
    console.log(` - ${r.file} (Dynamic or irregular key: check manually)`);
  }
}
