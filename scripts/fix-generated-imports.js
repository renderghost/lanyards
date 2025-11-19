/**
 * Post-process generated AT Protocol files to fix import paths
 * Removes .js extensions from imports since we're in a TypeScript environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generatedDir = path.join(__dirname, '../src/types/generated');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace .js extensions in import/export statements
  const newContent = content.replace(
    /(from\s+['"])(.+?)\.js(['"])/g,
    (_match, p1, p2, p3) => {
      modified = true;
      return `${p1}${p2}${p3}`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed imports in: ${path.relative(process.cwd(), filePath)}`);
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  }
}

console.log('Fixing generated TypeScript imports...');
processDirectory(generatedDir);
console.log('Done!');
