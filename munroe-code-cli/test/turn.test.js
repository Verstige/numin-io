import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { captureGitSnapshot, diffGitSnapshots, snapshotWithHashes } from '../src/turn.js';

async function makeRepo(prefix) {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  execSync('git init -q', { cwd: dir });
  return dir;
}

test('captureGitSnapshot reports no changes in a clean repo', async () => {
  const dir = await makeRepo('munroe-git-');
  const snapshot = await captureGitSnapshot(dir);
  assert.equal(snapshot.size, 0);
  await rm(dir, { recursive: true, force: true });
});

test('captureGitSnapshot reports untracked files as added', async () => {
  const dir = await makeRepo('munroe-git-');
  await writeFile(path.join(dir, 'README.md'), 'hello');
  const snapshot = await captureGitSnapshot(dir);
  assert.equal(snapshot.get('README.md').status, 'A');
  await rm(dir, { recursive: true, force: true });
});

test('diffGitSnapshots detects created, modified, and deleted files', async () => {
  const dir = await makeRepo('munroe-git-');
  await writeFile(path.join(dir, 'a.txt'), 'a');
  await writeFile(path.join(dir, 'b.txt'), 'b');
  await writeFile(path.join(dir, 'c.txt'), 'c');
  await writeFile(path.join(dir, 'README.md'), '# seed');
  const before = await snapshotWithHashes(dir);
  await writeFile(path.join(dir, 'a.txt'), 'a-modified');
  await rm(path.join(dir, 'c.txt'), { force: true });
  await writeFile(path.join(dir, 'd.txt'), 'd');
  const after = await snapshotWithHashes(dir);
  const changes = await diffGitSnapshots(before, after);
  const byPath = Object.fromEntries(changes.map((c) => [c.path, c.kind]));
  assert.equal(byPath['a.txt'], 'modified');
  assert.equal(byPath['c.txt'], 'deleted');
  assert.equal(byPath['d.txt'], 'created');
  await rm(dir, { recursive: true, force: true });
});