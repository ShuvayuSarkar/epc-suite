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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('apps/web/src');
const keyToFile = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/usePersistentState(?:<[^>]+>)?\(\s*['"]([^'"]+)['"]/g);
  for (const m of matches) {
    if (!keyToFile[m[1]]) keyToFile[m[1]] = [];
    keyToFile[m[1]].push(f);
  }
  const getMatches = content.matchAll(/getStoredItem(?:<[^>]+>)?\(\s*['"]([^'"]+)['"]/g);
  for (const m of getMatches) {
    if (!keyToFile[m[1]]) keyToFile[m[1]] = [];
    keyToFile[m[1]].push(f);
  }
});

console.log('Total unique keys:', Object.keys(keyToFile).length);
for (const [k, flist] of Object.entries(keyToFile).sort((a,b) => a[0].localeCompare(b[0]))) {
  console.log(`Key: "${k}" -> used in:`);
  flist.forEach(file => console.log('   ', path.relative('.', file)));
}
