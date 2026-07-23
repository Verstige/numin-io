import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { ensureProjectState, projectSessionName, saveProjectConfig, stateDir } from './config.js';
import { buildRuntimeInvocation, findRuntime } from './runtime.js';

export function munroeHome(env = process.env) {
  return path.resolve(env.MUNROE_HOME || path.join(os.homedir(), '.munroe'));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

export async function registerProject(cwd, env = process.env) {
  const project = path.resolve(cwd);
  const file = path.join(munroeHome(env), 'projects.json');
  const current = await readJson(file, []);
  const next = [
    { path: project, name: path.basename(project), sessionName: projectSessionName(project), openedAt: new Date().toISOString() },
    ...current.filter((item) => item.path !== project),
  ].slice(0, 30);
  await writeJson(file, next);
  return next;
}

export async function listProjects(env = process.env) {
  return readJson(path.join(munroeHome(env), 'projects.json'), []);
}

export async function listConversations(cwd) {
  await ensureProjectState(cwd);
  return readJson(path.join(stateDir(cwd), 'conversations.json'), []);
}

export async function createConversation(cwd, title = 'New conversation') {
  const conversations = await listConversations(cwd);
  const item = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  await writeJson(path.join(stateDir(cwd), 'conversations.json'), [item, ...conversations]);
  return item;
}

export async function appendConversationMessage(cwd, conversationId, message) {
  const conversations = await listConversations(cwd);
  const index = conversations.findIndex((item) => item.id === conversationId);
  if (index < 0) throw new Error('Conversation not found.');
  const current = conversations[index];
  const updated = {
    ...current,
    title: current.messages.length === 0 && message.role === 'user'
      ? message.content.trim().slice(0, 56) || current.title
      : current.title,
    updatedAt: new Date().toISOString(),
    messages: [...current.messages, { ...message, createdAt: new Date().toISOString() }],
  };
  const next = [updated, ...conversations.filter((item) => item.id !== conversationId)];
  await writeJson(path.join(stateDir(cwd), 'conversations.json'), next);
  return updated;
}

export async function queryMunroe({ cwd, prompt, model = null, permissions = null, env = process.env }) {
  const state = await ensureProjectState(cwd);
  const config = {
    ...state.config,
    ...(model ? { model } : {}),
    ...(permissions ? { permissions } : {}),
  };
  if (model || permissions) await saveProjectConfig(cwd, config);
  const runtimePath = await findRuntime({ env });
  const invocation = buildRuntimeInvocation({
    runtimePath,
    cwd,
    config,
    env,
    prompt,
    interactive: false,
  });
  const usageIndex = invocation.args.indexOf('--usage-file') + 1;
  const usagePath = usageIndex > 0 ? invocation.args[usageIndex] : null;
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    env: invocation.env,
    shell: false,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    timeout: 10 * 60 * 1000,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Munroe task failed.').trim());
  }
  let usage = null;
  if (usagePath) usage = await readJson(usagePath, null);
  return { text: result.stdout.trim(), usage };
}
