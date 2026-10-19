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
    } else if (file.endsWith('.controller.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const controllers = walk('apps/api/src');
controllers.forEach(c => {
  const code = fs.readFileSync(c, 'utf8');
  const ctrlMatch = code.match(/@Controller\(['"]?([^'")]+)?['"]?\)/);
  const prefix = ctrlMatch ? ctrlMatch[1] : '';
  const methods = [];
  const mMatches = code.matchAll(/@(Get|Post|Put|Patch|Delete)\(['"]?([^'")]+)?['"]?\)/g);
  for (const m of mMatches) {
    methods.push(`${m[1].toUpperCase()} /${prefix}/${m[2] || ''}`.replace(/\/+/g, '/'));
  }
  console.log(`${path.basename(c).padEnd(35)} -> ${methods.join(' | ')}`);
});
