import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) results = results.concat(walk(fullPath));
    else if (file.endsWith('.tsx')) results.push(fullPath);
  });
  return results;
}

const files = walk('src/pages');

console.log('=== CHECKING PageHeader action prop ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/<PageHeader[^>]*action=\{([^}]+)\}[^>]*>/g);
  if (matches) {
    matches.forEach(m => {
      if (!m.includes('onClick') && !m.includes('to=') && !m.includes('href=')) {
        console.log(`${f}: ${m}`);
      }
    });
  }
});

console.log('\n=== CHECKING empty or noop onClick handlers ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.match(/onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/) || l.match(/onClick=\{\s*\(\)\s*=>\s*undefined\s*\}/)) {
      console.log(`${f}:${idx+1}: ${l.trim()}`);
    }
  });
});
