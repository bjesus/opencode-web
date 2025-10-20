#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function extractUrl(text) {
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
}

async function startOpencode() {
  return new Promise((resolve, reject) => {
    const serveCwd = process.env.OPENCODE_SERVE_CWD || process.cwd();
    const proc = spawn('opencode', ['serve'], { stdio: ['ignore', 'pipe', 'pipe'], cwd: serveCwd });

    let resolved = false;
    const onData = (buf) => {
      const text = buf.toString();
      const url = extractUrl(text);
      if (!resolved && url) {
        resolved = true;
        cleanup();
        resolve({ proc, url });
      }
    };

    const onExit = (code) => {
      if (!resolved) reject(new Error(`opencode serve exited early with code ${code}`));
    };

    const cleanup = () => {
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onData);
      proc.off('exit', onExit);
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onData);
    proc.on('exit', onExit);
  });
}

function startVite(env) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectDir = path.resolve(__dirname, '..');
  const vite = spawn('vite', { stdio: 'inherit', env: { ...process.env, ...env }, cwd: projectDir });
  vite.on('exit', (code) => process.exit(code ?? 0));
  return vite;
}

(async () => {
  try {
    const { proc: apiProc, url } = await startOpencode();
    console.log(`[proxy] Detected OpenCode API at ${url}`);

    const env = { API_PROXY_TARGET: url, VITE_API_DEFAULT: '/api' };
    const vite = startVite(env);

    const stopAll = () => {
      vite.kill('SIGINT');
      apiProc.kill('SIGINT');
    };
    process.on('SIGINT', stopAll);
    process.on('SIGTERM', stopAll);
  } catch (err) {
    console.error('[proxy] Failed to start proxy mode:', err);
    process.exit(1);
  }
})();
