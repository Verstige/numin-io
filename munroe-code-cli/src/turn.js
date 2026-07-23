import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ensureProjectState, stateDir } from './config.js';
import { buildRuntimeInvocation, findRuntime } from './runtime.js';
import { loadEnvLayers, envWithKeys } from './env.js';

const MODEL_CREDENTIAL_KEYS = [
  'MINIMAX_API_KEY',
  'KIMI_API_KEY',
  'KIMI_CODING_API_KEY',
  'OPENROUTER_API_KEY',
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
];

const PENDING_APPROVALS = new Map();

export async function captureGitSnapshot(cwd) {
  const result = await new Promise((resolve) => {
    const child = spawn('git', ['-C', cwd, 'status', '--porcelain=1', '--untracked-files=all', '--ignored=no'], { shell: false });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString('utf8'); });
    child.on('close', (code) => resolve({ stdout, code: code ?? 0 }));
    child.on('error', () => resolve({ stdout: '', code: -1 }));
  });
  const map = new Map();
  if (result.code !== 0) return map;
  for (const line of result.stdout.split('\n')) {
    if (!line || line.length < 3) continue;
    const header = line.slice(0, 2);
    const file = line.slice(3);
    if (header.includes('?')) {
      map.set(file, { status: 'A' });
    } else if (header.includes('D')) {
      map.set(file, { status: 'D' });
    } else {
      map.set(file, { status: 'M' });
    }
  }
  return map;
}

async function fileHash(cwd, file) {
  try {
    const { createHash } = await import('node:crypto');
    const { readFile } = await import('node:fs/promises');
    const buf = await readFile(path.join(cwd, file));
    return createHash('sha1').update(buf).digest('hex');
  } catch {
    return null;
  }
}

export async function snapshotWithHashes(cwd) {
  const status = await captureGitSnapshot(cwd);
  const out = new Map();
  for (const [file, state] of status) {
    const hash = await fileHash(cwd, file);
    out.set(file, { ...state, hash });
  }
  return out;
}

export async function diffGitSnapshots(before, after) {
  const changes = [];
  const files = new Set([...before.keys(), ...after.keys()]);
  for (const file of files) {
    const beforeState = before.get(file);
    const afterState = after.get(file);
    if (!beforeState && afterState) {
      changes.push({ path: file, kind: afterState.status === 'D' ? 'deleted' : 'created' });
      continue;
    }
    if (beforeState && !afterState) {
      changes.push({ path: file, kind: 'deleted' });
      continue;
    }
    if (beforeState.status !== afterState.status) {
      changes.push({ path: file, kind: 'modified' });
      continue;
    }
    if (beforeState.hash && afterState.hash && beforeState.hash !== afterState.hash) {
      changes.push({ path: file, kind: 'modified' });
    }
  }
  return changes;
}

export async function startTurn(options) {
  const state = await ensureProjectState(options.cwd);
  const config = {
    ...state.config,
    ...(options.model ? { model: options.model } : {}),
    ...(options.permissions ? { permissions: options.permissions } : {}),
  };
  const envLayers = await loadEnvLayers(options.cwd);
  const mergedEnv = envWithKeys({ ...process.env, ...envLayers }, MODEL_CREDENTIAL_KEYS);
  const runtimePath = await findRuntime({ env: mergedEnv });
  const before = await captureGitSnapshot(options.cwd);
  const sessionId = options.sessionId || `munroe-${crypto.randomUUID()}`;
  const invocation = buildRuntimeInvocation({
    runtimePath,
    cwd: options.cwd,
    config,
    env: mergedEnv,
    prompt: options.prompt,
    interactive: false,
  });
  const usageArgIndex = invocation.args.indexOf('--usage-file');
  const usagePath = usageArgIndex >= 0 ? invocation.args[usageArgIndex + 1] : null;
  const turnId = crypto.randomUUID();
  let aborted = false;
  let child = null;
  const task = (async () => {
    try {
      options.onEvent({ type: 'turnStarted', turnId });
      child = spawn(invocation.command, invocation.args, {
        cwd: invocation.cwd,
        env: invocation.env,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let buffer = '';
      const flush = (chunk) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          options.onEvent({ type: 'agentMessageDelta', delta: trimmed + '\n' });
        }
      };
      child.stdout.on('data', (chunk) => {
        if (aborted) return;
        flush(chunk.toString('utf8'));
      });
      child.stderr.on('data', (chunk) => {
        if (aborted) return;
        options.onEvent({ type: 'commandExecOutput', toolCallId: 'runtime', stream: 'stderr', chunk: chunk.toString('utf8') });
      });
      const code = await new Promise((resolve) => {
        if (!child) return resolve(-1);
        child.on('close', (c) => resolve(c ?? -1));
        child.on('error', () => resolve(-1));
      });
      if (buffer.trim()) {
        options.onEvent({ type: 'agentMessageDelta', delta: buffer.trim() });
      }
      if (aborted) {
        options.onEvent({ type: 'turnInterrupted' });
        return;
      }
      const before = await snapshotWithHashes(options.cwd);
      const after = await snapshotWithHashes(options.cwd);
      const changes = await diffGitSnapshots(before, after);
      for (const change of changes) {
        options.onEvent({ type: 'fileChange', path: change.path, kind: change.kind });
      }
      let usage = null;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          usage = JSON.parse(await fs.readFile(usagePath, 'utf8'));
          break;
        } catch (error) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
      if (usage) {
        options.onEvent({ type: 'usage', tokens: usage.total_tokens ?? 0, cost: usage.estimated_cost_usd ?? 0 });
      }
      if (code === 0) {
        options.onEvent({ type: 'turnCompleted', text: buffer.trim(), sessionId });
      } else {
        options.onEvent({ type: 'turnFailed', message: `Runtime exited with code ${code}` });
      }
    } catch (error) {
      options.onEvent({ type: 'turnFailed', message: String(error instanceof Error ? error.message : error) });
    }
  })();
  void task;
  return {
    turnId,
    async abort() {
      aborted = true;
      if (child && !child.killed) child.kill('SIGTERM');
    },
    async approve(approvalId, decision) {
      const resolver = PENDING_APPROVALS.get(approvalId);
      if (resolver) {
        resolver(decision);
        PENDING_APPROVALS.delete(approvalId);
        options.onEvent({ type: 'approvalResolved', approvalId, decision });
      }
    },
  };
}

export function awaitApproval(approvalId) {
  return new Promise((resolve) => {
    PENDING_APPROVALS.set(approvalId, resolve);
  });
}