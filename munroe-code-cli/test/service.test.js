import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  appendConversationMessage,
  createConversation,
  deleteConversation,
  listConversations,
  clearConversations,
  renameConversation,
  listProjects,
  loadProject,
  projectRuntimeStatus,
  queryMunroe,
  registerProject,
} from '../src/service.js';

async function tempDir(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

test('project registry deduplicates and preserves order across concurrent registrations', async () => {
  const home = await tempDir('munroe-home-');
  const one = await tempDir('munroe-project-one-');
  const two = await tempDir('munroe-project-two-');
  const env = { MUNROE_HOME: home };
  await Promise.all([registerProject(one, env), registerProject(two, env), registerProject(one, env)]);
  const projects = await listProjects(env);
  assert.equal(projects.length, 2);
  assert.equal(projects[0].path, path.resolve(one));
});

test('conversations persist messages and derive a title from the first user message', async () => {
  const cwd = await tempDir('munroe-conversation-');
  const conversation = await createConversation(cwd);
  const afterUser = await appendConversationMessage(cwd, conversation.id, {
    role: 'user',
    content: 'Explain this repository architecture',
  });
  assert.equal(afterUser.title, 'Explain this repository architecture');
  await appendConversationMessage(cwd, conversation.id, {
    role: 'assistant',
    content: 'This repository contains…',
  });
  const rows = await listConversations(cwd);
  assert.equal(rows[0].messages.length, 2);
  assert.equal(rows[0].messages[1].role, 'assistant');
});

test('concurrent appends preserve all messages without corruption', async () => {
  const cwd = await tempDir('munroe-concurrency-');
  const conversation = await createConversation(cwd);
  await Promise.all([
    appendConversationMessage(cwd, conversation.id, { role: 'user', content: 'one' }),
    appendConversationMessage(cwd, conversation.id, { role: 'user', content: 'two' }),
    appendConversationMessage(cwd, conversation.id, { role: 'user', content: 'three' }),
  ]);
  const all = await listConversations(cwd);
  const messages = all[0].messages;
  assert.equal(messages.length, 3);
  const contents = messages.map((message) => message.content);
  for (const value of ['one', 'two', 'three']) {
    assert.ok(contents.includes(value), `expected ${value} in ${JSON.stringify(contents)}`);
  }
});

test('loadProject returns the persisted config', async () => {
  const cwd = await tempDir('munroe-load-');
  const project = await loadProject(cwd);
  assert.equal(project.config.model, 'auto');
  assert.equal(project.config.permissions, 'standard');
});

test('projectRuntimeStatus reports runtime presence and model access', async () => {
  const cwd = await tempDir('munroe-status-');
  const status = await projectRuntimeStatus(cwd);
  assert.ok(['available', 'missing'].includes(status.runtime));
  assert.equal(status.model, 'auto');
});

test('queryMunroe rejects trusted permissions programmatically', async () => {
  const cwd = await tempDir('munroe-trusted-');
  const env = { MUNROE_HOME: await tempDir('munroe-trusted-env-') };
  await assert.rejects(
    () => queryMunroe({ cwd, prompt: 'noop', permissions: 'trusted', env }),
    /Trusted mode cannot be enabled programmatically/,
  );
});

test('deleteConversation removes the targeted conversation', async () => {
  const cwd = await tempDir('munroe-delete-');
  const a = await createConversation(cwd, 'A');
  await createConversation(cwd, 'B');
  const after = await deleteConversation(cwd, a.id);
  assert.equal(after.length, 1);
  assert.notEqual(after[0].id, a.id);
});

test('renameConversation updates the title', async () => {
  const cwd = await tempDir('munroe-rename-');
  const conv = await createConversation(cwd, 'Original');
  const renamed = await renameConversation(cwd, conv.id, 'Renamed');
  assert.equal(renamed.title, 'Renamed');
});

test('clearConversations empties the conversation store', async () => {
  const cwd = await tempDir('munroe-clear-');
  await createConversation(cwd);
  await createConversation(cwd);
  await clearConversations(cwd);
  const rows = await listConversations(cwd);
  assert.equal(rows.length, 0);
});
