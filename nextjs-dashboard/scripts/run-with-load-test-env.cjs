const { readFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

const projectRoot = resolve(__dirname, '..');
const envFile = resolve(projectRoot, '.env.local-load-test');

for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const separator = trimmed.indexOf('=');
  if (separator === -1) continue;

  const key = trimmed.slice(0, separator).trim();
  const value = trimmed.slice(separator + 1).trim();
  process.env[key] = value;
}

const nextBin = resolve(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
