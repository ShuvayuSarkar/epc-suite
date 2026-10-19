const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('apps/web/src/pages');
const output = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative('apps/web/src/pages', f).replace(/\\/g, '/');

  const arrays = [];
  const regex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*(?::\s*[^=]+)?\s*=\s*\[/g;
  let m;
  const skip = ['columns', 'actions', 'tabs', 'filters', 'STATUS_COLORS', 'STATUS_TABS', 'MODULES', 'ROLES'];
  while ((m = regex.exec(content)) !== null) {
    if (!skip.includes(m[1]) && !m[1].toLowerCase().includes('column') && !m[1].toLowerCase().includes('tab')) {
      arrays.push(m[1]);
    }
  }

  const psCalls = [];
  const psRegex = /usePersistentState(?:<[^>]+>)?\(\s*['"]([^'"]+)['"]\s*,\s*([^)]+)\)/g;
  while ((m = psRegex.exec(content)) !== null) {
    psCalls.push({ key: m[1], fallback: m[2].trim() });
  }

  if (arrays.length > 0 || psCalls.length > 0) {
    output.push({ rel, arrays, psCalls });
  }
});

output.forEach(item => {
  console.log(`=== ${item.rel} ===`);
  if (item.arrays.length) console.log('  Data Arrays:', item.arrays.join(', '));
  if (item.psCalls.length) console.log('  usePersistentState:', item.psCalls.map(p => `${p.key} -> ${p.fallback}`).join(' | '));
});
