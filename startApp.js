import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("===================================================================");
console.log(" 🚀 PathScope — Chandigarh & Himachal Route Planner Launching...  ");
console.log("===================================================================\n");

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Launch Backend API Server
const serverDir = path.join(__dirname, 'server');
const serverProc = spawn('node', ['src/server.js'], {
  cwd: serverDir,
  shell: true,
  stdio: 'pipe'
});

serverProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[API Server]\x1b[0m ${data.toString()}`);
});

serverProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[API Error]\x1b[0m ${data.toString()}`);
});

// 2. Launch Client Vite Dev Server
const clientDir = path.join(__dirname, 'client');
const clientProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: clientDir,
  shell: true,
  stdio: 'pipe'
});

clientProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Vite UI]\x1b[0m ${data.toString()}`);
});

clientProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Vite Log]\x1b[0m ${data.toString()}`);
});

function cleanup() {
  console.log("\n[PathScope] Shutting down all services...");
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
