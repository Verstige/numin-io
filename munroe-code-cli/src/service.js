import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ensureProjectState, loadProjectConfig, projectSessionName, saveProjectConfig, stateDir } from './config.js';
import { buildRuntimeInvocation, findRuntime, resolveModelPolicy } from './runtime.js';
import { loadEnvLayers, munroeHome, envWithKeys } from './env.js';

export { parseEnvFile, readEnvFile, loadEnvLayers, munroeHome, envWithKeys } from './env.js';

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
  return readJson(path.join(stateDir(cwd), 'conversations.json'), []);
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
    const index = current.findIndex((item) => item.id === conversationId);
    if (index < 0) throw new Error('Conversation not found.');
    const currentConv = current[index];
    const nextTitle = currentConv.messages.length === 0 && message.role === 'user'
      ? message.content.trim().slice(0, 56) || currentConv.title
      : currentConv.title;
    const nextMessage = { ...message, createdAt: new Date().toISOString() };
    updated = {
      ...currentConv,
      title: nextTitle,
      updatedAt: nextMessage.createdAt,
      messages: [...currentConv.messages, nextMessage],
    };
    return [updated, ...current.filter((item) => item.id !== conversationId)];
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
];

export async function projectRuntimeStatus(cwd, env = process.env) {
  const state = await ensureProjectState(cwd);
  const model = resolveModelPolicy(state.config.model, env);
  let runtimePath = null;
  try { runtimePath = await findRuntime({ env }); } catch { /* ignored */ }
  const envLayers = await loadEnvLayers(cwd);
  return {
    model: state.config.model,
    permissions: state.config.permissions,
    modelLabel: model.label,
    modelAccessConfigured: model.accessConfigured,
    envLayers: Object.keys(envLayers),
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
  const envLayers = await loadEnvLayers(cwd);
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
