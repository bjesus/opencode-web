#!/usr/bin/env tsx
import { spawn } from 'node:child_process';

function extractUrl(text: string): string | null {
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
}

async function startOpencode(): Promise<{ proc: ReturnType<typeof spawn>; url: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn('opencode', ['serve'], { stdio: ['ignore', 'pipe', 'pipe'] });

    let resolved = false;
    const onData = (buf: Buffer) => {
      const text = buf.toString();
      const url = extractUrl(text);
      if (!resolved && url) {
        resolved = true;
        cleanup();
        resolve({ proc, url });
      }
    };

    const onErr = (buf: Buffer) => {
      const text = buf.toString();
      const url = extractUrl(text);
      if (!resolved && url) {
        resolved = true;
        cleanup();
        resolve({ proc, url });
      }
    };

    const onExit = (code: number) => {
      if (!resolved) {
        reject(new Error(`opencode serve exited early with code ${code}`));
      }
    };

    const cleanup = () => {
      proc.stdout?.off('data', onData);
      proc.stderr?.off('data', onErr);
      proc.off('exit', onExit);
    };

    proc.stdout?.on('data', onData);
    proc.stderr?.on('data', onErr);
    proc.on('exit', onExit);
  });
}

function startVite(env: Record<string, string>) {
  const vite = spawn('vite', { stdio: 'inherit', env: { ...process.env, ...env } });
  vite.on('exit', (code) => {
    process.exit(code ?? 0);
  });
  return vite;
}

(async () => {
  try {
    const { proc: apiProc, url } = await startOpencode();
    console.log(`[proxy] Detected OpenCode API at ${url}`);

    const env = {
      API_PROXY_TARGET: url,
      VITE_API_DEFAULT: '/api',
    } as Record<string, string>;

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
