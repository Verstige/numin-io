import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  ensureProjectState,
  loadProjectConfig,
  projectSessionName,
  saveProjectConfig,
} from '../src/config.js';
import { buildRuntimeInvocation, resolveModelPolicy } from '../src/runtime.js';

async function tempProject() {
  return mkdtemp(path.join(os.tmpdir(), 'munroe-cli-test-'));
}

test('initialization creates private project state without overwriting config', async () => {
  const cwd = await tempProject();
  const first = await ensureProjectState(cwd);
  assert.equal(first.config.model, 'auto');
  assert.equal(first.config.permissions, 'standard');

  const configPath = path.join(cwd, '.munroe', 'config.json');
  await writeFile(configPath, JSON.stringify({ ...first.config, model: 'kimi' }, null, 2));
  const second = await ensureProjectState(cwd);
  assert.equal(second.config.model, 'kimi');
  assert.match(await readFile(path.join(cwd, '.munroe', '.gitignore'), 'utf8'), /\*/);
});

test('project session name is stable and project-specific', async () => {
  const one = await tempProject();
  const two = await tempProject();
  assert.equal(projectSessionName(one), projectSessionName(one));
  assert.notEqual(projectSessionName(one), projectSessionName(two));
  assert.match(projectSessionName(one), /^munroe-/);
});

test('saveProjectConfig persists supported settings atomically', async () => {
  const cwd = await tempProject();
  await ensureProjectState(cwd);
  await saveProjectConfig(cwd, { model: 'minimax', permissions: 'safe' });
  const config = await loadProjectConfig(cwd);
  assert.equal(config.model, 'minimax');
  assert.equal(config.permissions, 'safe');
});

test('auto routing prefers MiniMax and reports Kimi credential state', () => {
  assert.deepEqual(resolveModelPolicy('auto', { MINIMAX_API_KEY: 'x' }), {
    provider: 'minimax',
    model: null,
    label: 'Munroe Auto',
    accessConfigured: true,
  });
  assert.equal(resolveModelPolicy('kimi', {}).accessConfigured, false);
  assert.equal(resolveModelPolicy('kimi', { KIMI_API_KEY: 'x' }).provider, 'kimi');
  assert.equal(resolveModelPolicy('kimi', { KIMI_API_KEY: 'x' }).accessConfigured, true);
});

test('runtime invocation uses argv arrays and safe project defaults', () => {
  const invocation = buildRuntimeInvocation({
    runtimePath: '/opt/runtime',
    cwd: '/tmp/project',
    config: { model: 'minimax', permissions: 'standard' },
    env: { MINIMAX_API_KEY: 'x' },
    prompt: 'fix "quoted" input; rm -rf /',
    interactive: false,
  });

  assert.equal(invocation.command, '/opt/runtime');
  assert.ok(invocation.args.includes('--oneshot'));
  const promptIndex = invocation.args.indexOf('--oneshot') + 1;
  assert.match(invocation.args[promptIndex], /fix "quoted" input; rm -rf \//);
  assert.ok(invocation.args.includes('--provider'));
  assert.ok(invocation.args.includes('minimax'));
  const toolsetsIndex = invocation.args.indexOf('--toolsets') + 1;
  assert.match(invocation.args[toolsetsIndex], /terminal/);
  assert.ok(invocation.args.includes('--pass-session-id'));
  const usageIndex = invocation.args.indexOf('--usage-file') + 1;
  assert.match(invocation.args[usageIndex], /\.munroe\/usage\/.*\.json$/);
  assert.ok(!invocation.args.includes('--yolo'));
  assert.equal(invocation.shell, false);
});

test('safe permissions remove execution and delegation toolsets', () => {
  const invocation = buildRuntimeInvocation({
    runtimePath: 'runtime',
    cwd: '/tmp/project',
    config: { model: 'minimax', permissions: 'safe' },
    env: { MINIMAX_API_KEY: 'x' },
    prompt: 'inspect only',
    interactive: false,
  });
  const toolsets = invocation.args[invocation.args.indexOf('--toolsets') + 1];
  assert.doesNotMatch(toolsets, /terminal|code_execution|delegation/);
  assert.match(toolsets, /file/);
});

test('interactive resume uses the runtime continue flag contract', () => {
  const invocation = buildRuntimeInvocation({
    runtimePath: 'runtime',
    cwd: '/tmp/project',
    config: { model: 'auto', permissions: 'standard' },
    env: {},
    interactive: true,
  });
  const continueIndex = invocation.args.indexOf('--continue');
  assert.ok(continueIndex >= 0);
  assert.equal(invocation.args[continueIndex + 1], projectSessionName('/tmp/project'));
});

test('trusted permissions explicitly enables approval bypass', () => {
  const invocation = buildRuntimeInvocation({
    runtimePath: 'runtime',
    cwd: '/tmp/project',
    config: { model: 'minimax', permissions: 'trusted' },
    env: { MINIMAX_API_KEY: 'x' },
    interactive: true,
  });
  assert.ok(invocation.args.includes('--yolo'));
});
