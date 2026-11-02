import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("===================================================================");
console.log(" 🧭 MargDarshak (मार्गदर्शक) — 3D Highway Engine Launching...       ");
console.log("===================================================================\n");

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Launch Backend API Server
const serverDir = path.join(__dirname, 'server');
const serverProc = spawn('node', ['src/server.js'], {
  cwd: serverDir,
  shell: isWin,
  stdio: 'pipe'
});

serverProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[API Server]\x1b[0m ${data.toString()}`);
});

serverProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[API Error]\x1b[0m ${data.toString()}`);
});

// 2. Launch Client Vite Dev Server (invoke vite.js directly to avoid broken Windows .bin shims)
const clientDir = path.join(__dirname, 'client');
const viteScript = path.join(clientDir, 'node_modules', 'vite', 'bin', 'vite.js');
const clientProc = spawn('node', [viteScript], {
  cwd: clientDir,
  shell: false,
  stdio: 'pipe',
  env: { ...process.env }
});

clientProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Vite UI]\x1b[0m ${data.toString()}`);
});

clientProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Vite Log]\x1b[0m ${data.toString()}`);
});

function cleanup() {
  console.log("\n[MargDarshak] Shutting down all services...");
  try {
    serverProc.kill();
  } catch {}
  try {
    clientProc.kill();
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
