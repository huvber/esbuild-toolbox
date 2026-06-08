import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgFolder = process.argv[2];

if (!pkgFolder) {
  console.error('Please provide the package folder name (e.g., html-auto-include)');
  process.exit(1);
}

const pkgPath = path.resolve(__dirname, '../packages', pkgFolder, 'package.json');

if (!fs.existsSync(pkgPath)) {
  console.error(`Package not found at ${pkgPath}`);
  process.exit(1);
}

// 1. Read original package.json
const originalContent = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(originalContent);

console.log(`🚀 Preparing first publish for ${pkg.name}...`);

// 2. Temporarily remove provenance
const tempPkg = { ...pkg };
if (tempPkg.publishConfig) {
  delete tempPkg.publishConfig.provenance;
}

fs.writeFileSync(pkgPath, JSON.stringify(tempPkg, null, 2) + '\n');

try {
  // 3. Run pnpm publish
  console.log(`📦 Publishing to npm...`);
  execSync(`pnpm publish --filter ${pkg.name} --access public --no-provenance`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  console.log(`✅ Successfully published ${pkg.name}`);
} catch (error) {
  console.error(`❌ Failed to publish ${pkg.name}`);
} finally {
  // 4. Restore original package.json
  console.log(`♻️  Restoring package.json...`);
  fs.writeFileSync(pkgPath, originalContent);
}
