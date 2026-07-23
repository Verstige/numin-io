import { spawn, spawnSync } from 'node:child_process';

import { findRuntime } from './runtime.js';

export async function listCronJobs() {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return [];
  return new Promise((resolve) => {
    const child = spawn(runtimePath, ['cron', 'list'], { shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8'); });
    child.on('close', (code) => {
      if (code !== 0) {
        resolve([]);
        return;
      }
      resolve(parseCronTable(stdout));
    });
    child.on('error', () => resolve([]));
  });
}

export function parseCronTable(text) {
  const lines = text.split('\n');
  const jobs = [];
  let current = null;
  for (const line of lines) {
    const idMatch = line.match(/^\s*([0-9a-f]{8,})\s+\[(\w+)\]\s*$/);
    if (idMatch) {
      if (current) jobs.push(current);
      current = {
        id: idMatch[1],
        status: idMatch[2],
        name: '',
        schedule: '',
        nextRun: '',
        lastRun: '',
        lastStatus: '',
        mode: '',
        script: '',
      };
      continue;
    }
    const field = line.match(/^\s{4}(\w[\w ]*):\s+(.+)$/);
    if (field && current) {
      const [, key, value] = field;
      const normalized = key.trim().toLowerCase().replace(/\s+/g, '');
      if (normalized === 'name') current.name = value.trim();
      else if (normalized === 'schedule') current.schedule = value.trim();
      else if (normalized === 'nextrun') current.nextRun = value.trim();
      else if (normalized === 'lastrun') current.lastRun = value.trim();
      else if (normalized === 'mode') current.mode = value.trim();
      else if (normalized === 'script') current.script = value.trim();
      else if (normalized === 'deliver') {} // ignore
      else if (normalized === 'repeat') current.schedule += ` · ${value.trim()}`;
    }
  }
  if (current) jobs.push(current);
  return jobs;
}

export async function pauseCronJob(id) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath || !id) return false;
  const result = spawnSync(runtimePath, ['cron', 'pause', id], { shell: false, encoding: 'utf8' });
  return cronMutationSucceeded(result);
}

export async function resumeCronJob(id) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath || !id) return false;
  const result = spawnSync(runtimePath, ['cron', 'resume', id], { shell: false, encoding: 'utf8' });
  return cronMutationSucceeded(result);
}

export async function runCronJob(id) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath || !id) return false;
  const result = spawnSync(runtimePath, ['cron', 'run', id], { shell: false, encoding: 'utf8' });
  return cronMutationSucceeded(result);
}

export async function deleteCronJob(id) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath || !id) return false;
  const result = spawnSync(runtimePath, ['cron', 'remove', id], { shell: false, encoding: 'utf8' });
  return cronMutationSucceeded(result);
}

function cronMutationSucceeded(result) {
  if (result.status !== 0) return false;
  const combined = `${result.stdout || ''}${result.stderr || ''}`;
  return !/not found|failed|error/i.test(combined);
}

export async function createCronJob({ schedule, prompt = '', name = '', deliver = 'local', workdir = '' } = {}) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return { ok: false, message: 'Runtime unavailable' };
  if (!schedule || typeof schedule !== 'string') return { ok: false, message: 'Schedule required' };
  const args = ['cron', 'create', schedule];
  if (prompt) args.push(prompt);
  if (name) args.push('--name', name);
  if (deliver) args.push('--deliver', deliver);
  if (workdir) args.push('--workdir', workdir);
  const result = spawnSync(runtimePath, args, { shell: false, encoding: 'utf8' });
  const combined = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0 || /failed|error/i.test(combined)) {
    return { ok: false, message: combined.trim() || `exit ${result.status}` };
  }
  return { ok: true, message: combined.trim() || 'Created' };
}

export async function cronStatus() {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return { running: false };
  return new Promise((resolve) => {
    const child = spawn(runtimePath, ['cron', 'status'], { shell: false });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString('utf8'); });
    child.on('close', (code) => {
      const text = stdout || stderr;
      resolve({
        running: code === 0 && /running|active|scheduled/i.test(text),
        message: text.trim(),
      });
    });
    child.on('error', () => resolve({ running: false, message: 'runtime unavailable' }));
  });
}