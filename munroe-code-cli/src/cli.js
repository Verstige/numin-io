import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

import {
  ensureProjectState,
  saveProjectConfig,
  VALID_MODELS,
  VALID_PERMISSIONS,
} from './config.js';
import { buildRuntimeInvocation, findRuntime, resolveModelPolicy } from './runtime.js';
import { listProjects, registerProject } from './service.js';

const VERSION = '1.0.0';
const GOLD = '\u001b[38;2;201;168;76m';
const DIM = '\u001b[2m';
const RESET = '\u001b[0m';

function printBanner() {
  if (!process.stdout.isTTY) return;
  console.log(`${GOLD}MUNROE CODE${RESET} ${DIM}v${VERSION}${RESET}`);
  console.log(`${DIM}The agentic workspace that keeps working.${RESET}\n`);
}

function printHelp() {
  console.log(`Munroe Code v${VERSION}

Usage:
  munroe                         Start or resume this project's workspace
  munroe "task"                  Run one task in the current project
  munroe init                    Initialize .munroe/
  munroe setup                   Initialize and verify Munroe Code
  munroe app                     Open the native Munroe Code application
  munroe projects                List recent project workspaces
  munroe resume                  Resume interactively
  munroe status                  Show project and runtime status
  munroe model [policy]          Get/set: auto, minimax, kimi
  munroe permissions [policy]    Get/set: safe, standard, trusted
  munroe doctor                  Diagnose the installation
  munroe help                    Show this help

Options:
  --new                          Start a fresh interactive session
  --version                      Print the version
`);
}

function spawnRuntime(invocation) {
  return new Promise((resolve, reject) => {
    const child = spawn(invocation.command, invocation.args, {
      cwd: invocation.cwd,
      env: invocation.env,
      shell: invocation.shell,
      stdio: invocation.stdio,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) return reject(new Error(`Munroe runtime stopped by ${signal}`));
      resolve(code ?? 1);
    });
  });
}

async function showStatus(cwd, state, runtimePath = null) {
  const model = resolveModelPolicy(state.config.model);
  console.log(`Munroe Code v${VERSION}`);
  console.log(`Project:      ${path.resolve(cwd)}`);
  console.log(`Workspace:    ${state.sessionName}`);
  console.log(`Model policy: ${state.config.model} (${model.label}${model.accessConfigured ? '' : ', credentials checked at runtime'})`);
  console.log(`Permissions:  ${state.config.permissions}`);
  console.log(`Runtime:      ${runtimePath ?? 'not found'}`);
  console.log(`State:        ${state.dir}`);
}

async function doctor(cwd) {
  const checks = [];
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  checks.push(['Node.js 20+', nodeMajor >= 20, process.version]);
  checks.push(['Project directory', true, path.resolve(cwd)]);

  let runtimePath = null;
  try {
    runtimePath = await findRuntime();
    checks.push(['Munroe runtime', true, runtimePath]);
  } catch (error) {
    checks.push(['Munroe runtime', false, error.message]);
  }

  const git = spawnSync('git', ['--version'], { encoding: 'utf8', shell: false });
  checks.push(['Git', git.status === 0, (git.stdout || git.stderr).trim()]);

  const state = await ensureProjectState(cwd);
  checks.push(['Project state', true, state.dir]);

  const model = resolveModelPolicy(state.config.model);
  const configCheck = runtimePath
    ? spawnSync(runtimePath, ['config', 'check'], { encoding: 'utf8', shell: false })
    : null;
  const modelOk = model.accessConfigured || configCheck?.status === 0;
  const modelDetail = modelOk
    ? model.label
    : 'No usable model configuration was detected.';
  checks.push(['Model access', modelOk, modelDetail]);

  if (runtimePath) {
    const version = spawnSync(runtimePath, ['--version'], { encoding: 'utf8', shell: false });
    checks.push(['Runtime responds', version.status === 0, (version.stdout || version.stderr).split('\n')[0]]);
  }

  for (const [name, ok, detail] of checks) {
    console.log(`${ok ? '✓' : '✗'} ${name}: ${detail}`);
  }
  return checks.every(([, ok]) => ok) ? 0 : 1;
}

function confirmTrustedMode() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  const answer = spawnSync(
    '/bin/sh',
    ['-c', 'printf "Trusted mode bypasses command approvals. Type TRUSTED to continue: "; IFS= read -r answer; [ "$answer" = "TRUSTED" ]'],
    { stdio: 'inherit', shell: false },
  );
  return answer.status === 0;
}

function parseTask(args) {
  return args.filter((arg) => arg !== '--new').join(' ').trim();
}

export async function main(args, { cwd = process.cwd() } = {}) {
  if (args.includes('--version') || args.includes('-V')) {
    console.log(VERSION);
    return 0;
  }

  const command = args[0];
  if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return 0;
  }

  if (command === 'doctor') return doctor(cwd);

  const state = await ensureProjectState(cwd);
  await registerProject(cwd);

  if (command === 'init') {
    console.log(`Munroe workspace initialized at ${state.dir}`);
    return 0;
  }

  if (command === 'setup') {
    console.log(`Munroe workspace initialized at ${state.dir}`);
    return doctor(cwd);
  }

  if (command === 'projects') {
    const projects = await listProjects();
    for (const project of projects) console.log(`${project.name}\t${project.path}`);
    return 0;
  }

  if (command === 'app') {
    const appRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'munroe-code-app');
    const appCommand = path.join(appRoot, 'node_modules', '.bin', 'electron');
    const child = spawn(appCommand, ['.'], {
      cwd: appRoot,
      env: { ...process.env, MUNROE_INITIAL_PROJECT: path.resolve(cwd) },
      detached: true,
      shell: false,
      stdio: 'ignore',
    });
    child.unref();
    console.log('Munroe Code application opened.');
    return 0;
  }

  if (command === 'model') {
    const policy = args[1];
    if (!policy) {
      console.log(state.config.model);
      return 0;
    }
    if (!VALID_MODELS.has(policy)) throw new Error('Model must be auto, minimax, or kimi.');
    await saveProjectConfig(cwd, { model: policy });
    console.log(`Model policy set to ${policy}.`);
    return 0;
  }

  if (command === 'permissions') {
    const policy = args[1] === 'show' ? null : args[1];
    if (!policy) {
      console.log(state.config.permissions);
      return 0;
    }
    if (!VALID_PERMISSIONS.has(policy)) {
      throw new Error('Permissions must be safe, standard, or trusted.');
    }
    if (policy === 'trusted' && !confirmTrustedMode()) {
      throw new Error('Trusted mode was not enabled.');
    }
    await saveProjectConfig(cwd, { permissions: policy });
    console.log(`Permission policy set to ${policy}.`);
    return 0;
  }

  const runtimePath = await findRuntime();

  if (command === 'status') {
    await showStatus(cwd, state, runtimePath);
    return 0;
  }

  if (args.includes('--new') && args.some((arg) => arg !== '--new')) {
    throw new Error('Use `munroe --new` by itself, then enter the task interactively.');
  }

  const interactive = args.length === 0 || command === 'resume' || args.includes('--new');
  const prompt = interactive ? null : parseTask(args);
  if (!interactive && !prompt) throw new Error('Provide a task or run `munroe` interactively.');

  printBanner();
  const invocation = buildRuntimeInvocation({
    runtimePath,
    cwd,
    config: state.config,
    prompt,
    interactive,
    resume: !args.includes('--new'),
  });
  const code = await spawnRuntime(invocation);
  process.exitCode = code;
  return code;
}

export { doctor, showStatus, spawnRuntime };
