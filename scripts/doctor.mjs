import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
// Next loads both .env.local and .env, so accept either as the credential
// file rather than insisting on one.
const envCandidates = ['.env.local', '.env'].map((name) =>
  path.join(projectRoot, name),
);
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
const envExamplePath = path.join(projectRoot, 'env.local.example');

function fail(message) {
  console.error(message);
  process.exit(1);
}

const majorVersion = Number.parseInt(process.versions.node.split('.')[0], 10);
if (Number.isNaN(majorVersion) || majorVersion < 22) {
  fail(`Node.js 22 or newer is required. Current version: ${process.versions.node}`);
}

if (!process.env.npm_config_user_agent?.includes('pnpm')) {
  fail('Run this repo with pnpm so installs and scripts stay consistent.');
}

if (!fs.existsSync(envExamplePath)) {
  fail('Missing env.local.example. Restore the tracked template before continuing.');
}

if (!envPath) {
  fail('Missing .env.local (or .env). Copy env.local.example to one of them before running the app.');
}

const envContents = fs.readFileSync(envPath, 'utf8');
for (const key of ['NEXT_PUBLIC_AGORA_APP_ID', 'NEXT_AGORA_APP_CERTIFICATE']) {
  const matcher = new RegExp(`^${key}=.+$`, 'm');
  if (!matcher.test(envContents)) {
    fail(`${path.basename(envPath)} is missing a value for ${key}`);
  }
}

console.log('Doctor checks passed');
