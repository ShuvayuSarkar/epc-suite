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

console.log('=== CHECKING DUMMY SAVE BUTTONS ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Look for Save button that only sets something to null or false
  const matches = content.match(/<button[^>]*onClick=\{\s*\(\)\s*=>\s*set\w+\((?:null|false)\)\s*\}[^>]*>[\s\S]*?(?:Save|Submit|Update)[\s\S]*?<\/button>/gi);
  if (matches) {
    matches.forEach(m => {
      console.log(`${f}: ${m.replace(/\s+/g, ' ')}`);
    });
  }
});
