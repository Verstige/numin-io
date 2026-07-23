import crypto from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const VALID_MODELS = new Set(['auto', 'minimax', 'kimi']);
export const VALID_PERMISSIONS = new Set(['safe', 'standard', 'trusted']);

const DEFAULT_CONFIG = Object.freeze({
  version: 1,
  model: 'auto',
  permissions: 'standard',
});

export function stateDir(cwd) {
  return path.join(path.resolve(cwd), '.munroe');
}

export function projectSessionName(cwd) {
  const resolved = path.resolve(cwd);
  const slug = path
    .basename(resolved)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'workspace';
  const digest = crypto.createHash('sha256').update(resolved).digest('hex').slice(0, 10);
  return `munroe-${slug}-${digest}`;
}

function validateConfig(value) {
  const config = { ...DEFAULT_CONFIG, ...(value ?? {}) };
  if (!VALID_MODELS.has(config.model)) {
    throw new Error(`Unsupported model policy: ${config.model}`);
  }
  if (!VALID_PERMISSIONS.has(config.permissions)) {
    throw new Error(`Unsupported permission policy: ${config.permissions}`);
  }
  return config;
}

export async function ensureProjectState(cwd) {
  const dir = stateDir(cwd);
  await mkdir(path.join(dir, 'sessions'), { recursive: true });
  await mkdir(path.join(dir, 'memory'), { recursive: true });
  await mkdir(path.join(dir, 'usage'), { recursive: true });

  const configPath = path.join(dir, 'config.json');
  let config;
  try {
    config = validateConfig(JSON.parse(await readFile(configPath, 'utf8')));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    config = { ...DEFAULT_CONFIG };
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, { flag: 'wx' });
  }

  const localIgnore = path.join(dir, '.gitignore');
  try {
    await writeFile(localIgnore, '*\n!.gitignore\n', { flag: 'wx' });
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
  }

  return { dir, config, sessionName: projectSessionName(cwd) };
}

export async function loadProjectConfig(cwd) {
  return (await ensureProjectState(cwd)).config;
}

export async function saveProjectConfig(cwd, updates) {
  const current = await loadProjectConfig(cwd);
  const next = validateConfig({ ...current, ...updates });
  const configPath = path.join(stateDir(cwd), 'config.json');
  const temporaryPath = `${configPath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, configPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
  return next;
}
