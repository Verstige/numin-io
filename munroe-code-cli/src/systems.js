import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { findRuntime } from './runtime.js';

async function runHermes(args) {
  const runtimePath = await findRuntime().catch(() => null);
  if (!runtimePath) return { ok: false, stdout: '', stderr: 'runtime unavailable', code: -1 };
  const result = spawnSync(runtimePath, args, { shell: false, encoding: 'utf8', timeout: 20000 });
  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    code: result.status ?? -1,
  };
}

export async function memoryStatus() {
  const result = await runHermes(['memory', 'status']);
  const text = `${result.stdout}\n${result.stderr}`.trim();
  const builtinPaths = [
    path.join(os.homedir(), '.hermes', 'MEMORY.md'),
    path.join(os.homedir(), '.hermes', 'memories', 'MEMORY.md'),
    path.join(os.homedir(), '.hermes', 'USER.md'),
  ];
  const files = [];
  for (const file of builtinPaths) {
    try {
      const stat = await fs.stat(file);
      files.push({ path: file, name: path.basename(file), bytes: stat.size, updatedAt: stat.mtime.toISOString() });
    } catch {
      // missing
    }
  }
  return {
    ok: result.ok,
    message: text || (result.ok ? 'Memory available' : 'Memory status unavailable'),
    files,
  };
}

export async function readMemoryFile(filePath) {
  if (typeof filePath !== 'string' || !filePath) throw new Error('path required');
  const resolved = path.resolve(filePath);
  const allowedRoots = [
    path.join(os.homedir(), '.hermes'),
    path.join(os.homedir(), '.munroe'),
  ];
  if (!allowedRoots.some((root) => resolved === root || resolved.startsWith(`${root}${path.sep}`))) {
    throw new Error('Memory path not allowed');
  }
  const content = await fs.readFile(resolved, 'utf8');
  return { path: resolved, content: content.slice(0, 20000) };
}

export async function listProfiles() {
  const result = await runHermes(['profile', 'list']);
  const lines = `${result.stdout || ''}`.split('\n').map((line) => line.trim()).filter(Boolean);
  const profiles = [];
  for (const line of lines) {
    // Formats vary; capture name-ish tokens.
    const match = line.match(/^([a-zA-Z0-9._-]+)\b/);
    if (!match) continue;
    if (/^(profile|name|active|default|──|==)/i.test(match[1])) continue;
    profiles.push({
      name: match[1],
      active: /\*|active|current/i.test(line),
      label: line,
    });
  }
  return { ok: result.ok, profiles, raw: result.stdout.trim() };
}

export async function computerUseStatus() {
  const result = await runHermes(['computer-use', 'status']);
  const text = `${result.stdout}\n${result.stderr}`.trim();
  return {
    ok: result.ok,
    installed: /installed|available|ready|on PATH/i.test(text) && !/not installed|missing|unavailable/i.test(text),
    message: text || (result.ok ? 'Computer use available' : 'Computer use unavailable'),
  };
}

export async function computerUseDoctor() {
  const result = await runHermes(['computer-use', 'doctor']);
  return {
    ok: result.ok,
    message: `${result.stdout}\n${result.stderr}`.trim() || 'No doctor output',
  };
}
