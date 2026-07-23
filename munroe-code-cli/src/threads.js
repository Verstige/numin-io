import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { findRuntime } from './runtime.js';
import { munroeHome } from './env.js';

export function threadIdFor(cwd) {
  const safe = cwd.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `munroe-${safe.slice(0, 32) || 'workspace'}`;
}

export async function listThreads() {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return [];
  return new Promise((resolve) => {
    const child = spawn(runtimePath, ['sessions', 'list', '--json'], { shell: false });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.on('close', () => {
      try { resolve(JSON.parse(stdout || '[]')); } catch { resolve([]); }
    });
    child.on('error', () => resolve([]));
  });
}

export async function searchThreads(query) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return [];
  return new Promise((resolve) => {
    const child = spawn(runtimePath, ['sessions', 'list', '--json', '--search', query], { shell: false });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.on('close', () => {
      try { resolve(JSON.parse(stdout || '[]')); } catch { resolve([]); }
    });
    child.on('error', () => resolve([]));
  });
}

export async function deleteThread(id) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return false;
  const result = spawnSync(runtimePath, ['sessions', 'delete', id], { shell: false, encoding: 'utf8' });
  return result.status === 0;
}

export async function renameThread(id, title) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return false;
  const result = spawnSync(runtimePath, ['sessions', 'rename', id, title], { shell: false, encoding: 'utf8' });
  return result.status === 0;
}

export async function createCheckpoint(cwd) {
  const id = `munroe-${Date.now()}-${crypto.randomUUID()}`;
  const checkpointDir = path.join(munroeHome(), 'checkpoints', id);
  await fs.mkdir(checkpointDir, { recursive: true });
  const result = spawnSync('git', ['-C', cwd, 'stash', 'push', '-u', '-m', id], { shell: false, encoding: 'utf8' });
  if (result.status !== 0) return null;
  return { id, label: id, createdAt: new Date().toISOString() };
}

export async function rollbackToCheckpoint(cwd, id) {
  spawnSync('git', ['-C', cwd, 'stash', 'drop'], { shell: false, encoding: 'utf8' });
  const result = spawnSync('git', ['-C', cwd, 'stash', 'apply', 'stash@{0}'], { shell: false, encoding: 'utf8' });
  return result.status === 0;
}

export async function listCheckpoints(cwd) {
  const result = spawnSync('git', ['-C', cwd, 'stash', 'list'], { shell: false, encoding: 'utf8' });
  if (result.status !== 0) return [];
  return (result.stdout || '').split('\n').filter(Boolean).map((line) => {
    const match = line.match(/stash@\{(\d+)\}: (.+)/);
    return match ? { index: match[1], label: match[2] } : { label: line };
  });
}