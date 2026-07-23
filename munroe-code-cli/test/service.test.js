import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  appendConversationMessage,
  createConversation,
  listConversations,
  listProjects,
  registerProject,
} from '../src/service.js';

async function tempDir(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

test('recent project registry deduplicates and keeps newest first', async () => {
  const home = await tempDir('munroe-home-');
  const one = await tempDir('munroe-project-one-');
  const two = await tempDir('munroe-project-two-');
  const env = { MUNROE_HOME: home };
  await registerProject(one, env);
  await registerProject(two, env);
  await registerProject(one, env);
  const projects = await listProjects(env);
  assert.equal(projects.length, 2);
  assert.equal(projects[0].path, path.resolve(one));
});

test('conversations persist messages and derive a title from first user message', async () => {
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
