import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureProjectState, loadProjectConfig, projectSessionName, saveProjectConfig, stateDir } from './config.js';
import { buildRuntimeInvocation, findRuntime, resolveModelPolicy } from './runtime.js';
import { loadEnvLayers, munroeHome, envWithKeys, loadProviderEnv } from './env.js';

export { parseEnvFile, readEnvFile, loadEnvLayers, loadProviderEnv, munroeHome, envWithKeys } from './env.js';

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function writeJsonAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporaryPath = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, file);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

const SERIALIZATION = new Map();

async function serialize(file, mutator, fallback) {
  const previous = SERIALIZATION.get(file) || Promise.resolve();
  const next = previous.then(async () => {
    const current = await readJson(file, fallback);
    const updated = mutator(current);
    await writeJsonAtomic(file, updated);
    return updated;
  });
  SERIALIZATION.set(file, next.catch(() => undefined));
  return next;
}

export async function registerProject(cwd, env = process.env) {
  const project = path.resolve(cwd);
  const file = path.join(munroeHome(env), 'projects.json');
  const item = { path: project, name: path.basename(project), sessionName: projectSessionName(project), openedAt: new Date().toISOString() };
  return serialize(file, (current) => [item, ...current.filter((existing) => existing.path !== project)].slice(0, 30), []);
}

export async function listProjects(env = process.env) {
  return readJson(path.join(munroeHome(env), 'projects.json'), []);
}

export async function listConversations(cwd) {
  await ensureProjectState(cwd);
  const rows = await readJson(path.join(stateDir(cwd), 'conversations.json'), []);
  if (!Array.isArray(rows)) return [];
  return rows.map((item) => ({
    ...item,
    messages: Array.isArray(item?.messages) ? item.messages : [],
  }));
}

export async function deleteConversation(cwd, conversationId) {
  const file = path.join(stateDir(cwd), 'conversations.json');
  return serialize(file, (current) => current.filter((item) => item.id !== conversationId), []);
}

export async function clearConversations(cwd) {
  const file = path.join(stateDir(cwd), 'conversations.json');
  await serialize(file, () => [], []);
  return true;
}

export async function renameConversation(cwd, conversationId, title) {
  if (typeof title !== 'string' || !title.trim()) throw new Error('Title required.');
  const file = path.join(stateDir(cwd), 'conversations.json');
  let updated;
  await serialize(file, (current) => {
    const idx = current.findIndex((item) => item.id === conversationId);
    if (idx < 0) throw new Error('Conversation not found.');
    updated = { ...current[idx], title: title.trim(), updatedAt: new Date().toISOString() };
    return [updated, ...current.filter((item) => item.id !== conversationId)];
  }, []);
  return updated;
}

export async function createConversation(cwd, title = 'New conversation') {
  const file = path.join(stateDir(cwd), 'conversations.json');
  const item = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  await serialize(file, (current) => [item, ...current], []);
  return item;
}

export async function appendConversationMessage(cwd, conversationId, message) {
  const file = path.join(stateDir(cwd), 'conversations.json');
  let updated;
  await serialize(file, (current) => {
    const list = Array.isArray(current) ? current : [];
    const index = list.findIndex((item) => item.id === conversationId);
    if (index < 0) throw new Error('Conversation not found.');
    const currentConv = list[index];
    const existingMessages = Array.isArray(currentConv.messages) ? currentConv.messages : [];
    const content = typeof message?.content === 'string' ? message.content : String(message?.content ?? '');
    const nextTitle = existingMessages.length === 0 && message.role === 'user'
      ? content.trim().slice(0, 56) || currentConv.title
      : currentConv.title;
    const nextMessage = { role: message.role, content, createdAt: new Date().toISOString() };
    updated = {
      ...currentConv,
      title: nextTitle,
      updatedAt: nextMessage.createdAt,
      messages: [...existingMessages, nextMessage],
    };
    return [updated, ...list.filter((item) => item.id !== conversationId)];
  }, []);
  return updated;
}

export async function loadProject(cwd) {
  const state = await ensureProjectState(cwd);
  return { path: path.resolve(cwd), state, config: state.config };
}

const MODEL_CREDENTIAL_KEYS = [
  'MINIMAX_API_KEY',
  'KIMI_API_KEY',
  'KIMI_CODING_API_KEY',
  'OPENROUTER_API_KEY',
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'XAI_API_KEY',
];

export async function projectRuntimeStatus(cwd, env = process.env) {
  const state = await ensureProjectState(cwd);
  const envLayers = await loadProviderEnv(cwd, env);
  const mergedEnv = envWithKeys({ ...env, ...envLayers }, MODEL_CREDENTIAL_KEYS);
  const model = resolveModelPolicy(state.config.model, mergedEnv);
  let runtimePath = null;
  try { runtimePath = await findRuntime({ env: mergedEnv }); } catch { /* ignored */ }
  return {
    model: state.config.model,
    permissions: state.config.permissions,
    modelLabel: model.label,
    modelAccessConfigured: model.accessConfigured,
    envLayers: Object.keys(envLayers).filter((key) => MODEL_CREDENTIAL_KEYS.includes(key)),
    runtime: runtimePath ? 'available' : 'missing',
  };
}

export async function queryMunroe({ cwd, prompt, model = null, permissions = null, env = process.env }) {
  const state = await ensureProjectState(cwd);
  const config = {
    ...state.config,
    ...(model ? { model } : {}),
    ...(permissions ? { permissions } : {}),
  };
  if (model || permissions) await saveProjectConfig(cwd, config);
  if (permissions === 'trusted') throw new Error('Trusted mode cannot be enabled programmatically.');
  const runtimePath = await findRuntime({ env });
  const envLayers = await loadProviderEnv(cwd, env);
  const mergedEnv = envWithKeys({ ...env, ...envLayers }, MODEL_CREDENTIAL_KEYS);
  const invocation = buildRuntimeInvocation({
    runtimePath,
    cwd,
    config,
    env: mergedEnv,
    prompt,
    interactive: false,
  });
  const usageIndex = invocation.args.indexOf('--usage-file') + 1;
  const usagePath = usageIndex > 0 ? invocation.args[usageIndex] : null;
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    env: {
      ...invocation.env,
      HOME: invocation.env.HOME || env.HOME || process.env.HOME || '',
      PATH: invocation.env.PATH || env.PATH || process.env.PATH || '',
    },
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
