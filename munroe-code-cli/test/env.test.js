import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  parseEnvFile,
  readEnvFile,
  loadEnvLayers,
  munroeHome,
  envWithKeys,
} from '../src/env.js';
import { listProjects, projectRuntimeStatus, registerProject } from '../src/service.js';

test('parseEnvFile handles quoting, comments, and blank lines', () => {
  const parsed = parseEnvFile(`
# comment
MINIMAX_API_KEY="abc 123"
KIMI_API_KEY='xyz'
OPENAI_API_KEY=plain
EMPTY=
   bad line
  `);
  assert.equal(parsed.MINIMAX_API_KEY, 'abc 123');
  assert.equal(parsed.KIMI_API_KEY, 'xyz');
  assert.equal(parsed.OPENAI_API_KEY, 'plain');
  assert.equal(parsed.EMPTY, '');
});

test('munroeHome ignores unsafe or missing MUNROE_HOME values', () => {
  const fallback = path.join(os.homedir(), '.munroe');
  assert.equal(munroeHome({}), fallback);
  assert.equal(munroeHome({ MUNROE_HOME: '.munroe' }), fallback);
  assert.equal(munroeHome({ MUNROE_HOME: '~/.munroe' }), fallback);
  assert.equal(munroeHome({ MUNROE_HOME: '/' }), fallback);
  assert.equal(munroeHome({ MUNROE_HOME: '/.munroe' }), path.resolve('/.munroe'));
  assert.equal(munroeHome({ MUNROE_HOME: '/tmp/munroe-test' }), path.resolve('/tmp/munroe-test'));
  assert.equal(munroeHome({ MUNROE_HOME: '' }), fallback);
  assert.equal(munroeHome({ MUNROE_HOME: undefined }), fallback);
});

test('loadEnvLayers reads home and project env files', async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'munroe-home-'));
  const project = await mkdtemp(path.join(os.tmpdir(), 'munroe-project-'));
  await mkdir(path.join(project, '.munroe'), { recursive: true });
  await writeFile(path.join(home, '.env'), 'MINIMAX_API_KEY=from_home\n');
  await writeFile(path.join(project, '.munroe', '.env'), 'KIMI_API_KEY=from_project\n');
  const env = { MUNROE_HOME: home };
  const layers = await loadEnvLayers(project, env);
  assert.equal(layers.MINIMAX_API_KEY, 'from_home');
  assert.equal(layers.KIMI_API_KEY, 'from_project');
  await rm(home, { recursive: true, force: true });
  await rm(project, { recursive: true, force: true });
});

test('envWithKeys does not overwrite existing entries', () => {
  const result = envWithKeys({ MINIMAX_API_KEY: 'existing' }, ['MINIMAX_API_KEY', 'KIMI_API_KEY']);
  assert.equal(result.MINIMAX_API_KEY, 'existing');
});

test('projectRuntimeStatus does not throw on missing home env file', async () => {
  const project = await mkdtemp(path.join(os.tmpdir(), 'munroe-noenv-'));
  const isolatedHome = await mkdtemp(path.join(os.tmpdir(), 'munroe-home-'));
  const env = { HOME: isolatedHome, MUNROE_HOME: path.join(isolatedHome, '.munroe'), PATH: process.env.PATH };
  const status = await projectRuntimeStatus(project, env);
  assert.deepEqual(status.envLayers, []);
  await rm(project, { recursive: true, force: true });
  await rm(isolatedHome, { recursive: true, force: true });
});
