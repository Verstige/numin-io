import crypto from 'node:crypto';
import { access } from 'node:fs/promises';
import path from 'node:path';

import { projectSessionName, stateDir } from './config.js';

const TOOLSETS = 'terminal,file,code_execution,skills,memory,session_search,delegation,todo,clarify';

export function resolveModelPolicy(policy, env = process.env) {
  const modelAccess = {
    minimax: Boolean(env.MINIMAX_API_KEY),
    kimi: Boolean(env.KIMI_API_KEY || env.KIMI_CODING_API_KEY),
    openrouter: Boolean(env.OPENROUTER_API_KEY),
    google: Boolean(env.GOOGLE_API_KEY || env.GEMINI_API_KEY),
  };

  if (policy === 'kimi') {
    return { provider: 'kimi', model: null, label: 'Munroe Kimi', accessConfigured: modelAccess.kimi };
  }

  if (policy === 'minimax') {
    return { provider: 'minimax', model: null, label: 'Munroe Core', accessConfigured: modelAccess.minimax };
  }

  if (policy === 'auto') {
    if (modelAccess.minimax) {
      return { provider: 'minimax', model: null, label: 'Munroe Auto', accessConfigured: true };
    }
    if (modelAccess.kimi) {
      return { provider: 'kimi', model: null, label: 'Munroe Auto', accessConfigured: true };
    }
    return { provider: null, model: null, label: 'Munroe Auto', accessConfigured: modelAccess.openrouter || modelAccess.google };
  }

  throw new Error(`Unsupported model policy: ${policy}`);
}

export function projectPrompt(cwd, userPrompt) {
  return [
    'You are Munroe Code, an agentic software workspace operating in the current project.',
    'Work through the task completely: inspect before changing, preserve project conventions, request approval for dangerous operations, run the real verification available in the repository, and report factual results.',
    'Never expose or discuss internal runtime or model-provider brands in the user-facing response. Refer to yourself and the product only as Munroe or Munroe Code.',
    `Project root: ${path.resolve(cwd)}`,
    `Task: ${userPrompt}`,
  ].join('\n\n');
}

export function buildRuntimeInvocation({
  runtimePath,
  cwd,
  config,
  env = process.env,
  prompt = null,
  interactive = true,
  resume = true,
}) {
  const model = resolveModelPolicy(config.model, env);
  const args = [];

  if (interactive) {
    args.push('--tui');
    if (resume) args.push('--continue', projectSessionName(cwd));
  } else {
    args.push('--oneshot', projectPrompt(cwd, prompt));
    args.push('--usage-file', path.join(stateDir(cwd), 'usage', `${Date.now()}-${crypto.randomUUID()}.json`));
  }

  if (model.provider) args.push('--provider', model.provider);
  if (model.model) args.push('--model', model.model);
  args.push('--toolsets', config.permissions === 'safe' ? 'file,skills,memory,session_search,todo,clarify' : TOOLSETS);
  args.push('--skills', 'numin-saas-rebuild');
  args.push('--pass-session-id');

  if (config.permissions === 'trusted') args.push('--yolo');

  return {
    command: runtimePath,
    args,
    cwd: path.resolve(cwd),
    env: {
      ...env,
      HERMES_SESSION_SOURCE: 'munroe-code',
      MUNROE_PRODUCT: 'Munroe Code',
    },
    shell: false,
    stdio: 'inherit',
  };
}

export async function findRuntime({ env = process.env, pathEntries = null } = {}) {
  if (env.MUNROE_RUNTIME_PATH) {
    await access(env.MUNROE_RUNTIME_PATH);
    return env.MUNROE_RUNTIME_PATH;
  }

  const entries = pathEntries ?? (env.PATH ?? '').split(path.delimiter);
  for (const entry of entries) {
    if (!entry) continue;
    const candidate = path.join(entry, 'hermes');
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue searching.
    }
  }
  throw new Error('Munroe runtime not found. Install the Munroe runtime before continuing.');
}
