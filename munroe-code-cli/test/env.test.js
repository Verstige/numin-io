import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { parseEnvFile, projectRuntimeStatus, queryMunroe, registerProject } from '../src/service.js';

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

test('projectRuntimeStatus reports env layers from home and project', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'munroe-env-'));
  await mkdir(cwd + '/.munroe', { recursive: true });
  await writeFile(cwd + '/.munroe/.env', 'MINIMAX_API_KEY=stub\n');
  const status = await projectRuntimeStatus(cwd);
  assert.deepEqual(status.envLayers, ['MINIMAX_API_KEY']);
});

test('queryMunroe rejects a missing runtime before spawning', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'munroe-env-'));
  await mkdir(cwd + '/.munroe', { recursive: true });
  await registerProject(cwd);
  await assert.rejects(
    () => queryMunroe({
      cwd,
      prompt: 'noop',
      env: { ...process.env, PATH: '/nonexistent', MUNROE_RUNTIME_PATH: undefined },
    }),
    /runtime not found|Munroe runtime/,
  );
});
