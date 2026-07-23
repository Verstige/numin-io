const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const crypto = require('crypto')
const { pathToFileURL } = require('url')
const { mkdir, writeFile } = require('node:fs/promises')

const ALLOWED_DEV_ORIGINS = new Set(['http://127.0.0.1:5177', 'http://localhost:5177'])
const RENDERER_PERMISSIONS = new Set(['safe', 'standard'])
const PROJECT_MAX_PATH_LENGTH = 4096

const registeredProjects = new Map()
const activeTurns = new Map()

function trustedOrigin(origin) {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      if (ALLOWED_DEV_ORIGINS.has(url.origin)) return 'dev';
      return null;
    }
    if (url.protocol === 'file:') return 'file';
  } catch { /* invalid origin */ }
  return null;
}

function ensureRendererTrusted(event) {
  const origin = event.senderFrame && event.senderFrame.url;
  if (!origin) throw new Error('Renderer origin is unavailable.');
  if (event.senderFrame.parent && event.senderFrame.parent !== null) throw new Error('Nested frame requests are not allowed.');
  if (app.isPackaged) {
    if (trustedOrigin(origin) !== 'file') throw new Error(`Packaged renderer origin must be a local file: ${origin}`);
  } else {
    if (trustedOrigin(origin) !== 'dev') throw new Error(`Renderer origin is not trusted: ${origin}`);
  }
}

function safePermissions(value) {
  if (typeof value !== 'string' || !RENDERER_PERMISSIONS.has(value)) throw new Error('Permissions must be safe or standard.');
  return value;
}

let mainWindow
let service
let turn
let threads
let cron
let systems

async function loadService() {
  if (service) return service;
  const servicePath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'service.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'service.js');
  service = await import(pathToFileURL(servicePath).href);
  return service;
}

async function loadTurn() {
  if (turn) return turn;
  const turnPath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'turn.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'turn.js');
  turn = await import(pathToFileURL(turnPath).href);
  return turn;
}

async function loadThreads() {
  if (threads) return threads;
  const threadsPath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'threads.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'threads.js');
  threads = await import(pathToFileURL(threadsPath).href);
  return threads;
}

function safeProjectPath(value) {
  if (typeof value !== 'string' || !value) throw new Error('Choose a valid project directory.');
  if (value.length > PROJECT_MAX_PATH_LENGTH) throw new Error('Project path is too long.');
  const requested = path.resolve(value);
  if (!path.isAbsolute(requested)) throw new Error('Project path must be absolute.');
  let real;
  try { real = fs.realpathSync(requested); } catch { real = requested; }
  const stat = (() => { try { return fs.statSync(real); } catch { return null; } })();
  if (!stat || !stat.isDirectory()) throw new Error('Project directory does not exist.');
  if (!registeredProjects.has(real)) throw new Error('Project is not registered with Munroe Code.');
  return real;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1460,
    height: 940,
    minWidth: 960,
    minHeight: 680,
    title: 'Munroe Code',
    backgroundColor: '#0d0d0f',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (app.isPackaged) {
      if (!url.startsWith('file://')) event.preventDefault();
    } else {
      const origin = new URL(url).origin;
      if (!ALLOWED_DEV_ORIGINS.has(origin)) event.preventDefault();
    }
  });

  const devUrl = app.isPackaged ? null : (process.env.MUNROE_DEV_SERVER && ALLOWED_DEV_ORIGINS.has(process.env.MUNROE_DEV_SERVER) ? process.env.MUNROE_DEV_SERVER : null);
  if (devUrl) await mainWindow.loadURL(devUrl);
  else await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

async function loadCron() {
  if (cron) return cron;
  const cronPath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'cron.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'cron.js');
  cron = await import(pathToFileURL(cronPath).href);
  return cron;
}

async function loadSystems() {
  if (systems) return systems;
  const systemsPath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'systems.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'systems.js');
  systems = await import(pathToFileURL(systemsPath).href);
  return systems;
}

async function resolveProjectPath(value) {
  const requested = path.resolve(value);
  if (!path.isAbsolute(requested)) throw new Error('Project path must be absolute.');
  try { return fs.realpathSync(requested); } catch { return requested; }
}

ipcMain.handle('munroe:bootstrap', async (event) => {
  ensureRendererTrusted(event);
  try {
    const api = await loadService();
    const rawInitial = process.env.MUNROE_INITIAL_PROJECT || process.cwd();
    const initial = await resolveProjectPath(rawInitial);
    await api.registerProject(initial);
    const projects = await api.listProjects();
    for (const project of projects) {
      const real = await resolveProjectPath(project.path).catch(() => project.path);
      registeredProjects.set(real, project);
    }
    return { initialProject: initial, projects: await api.listProjects() };
  } catch (error) {
    return { error: { message: String(error?.message || error) } };
  }
});

ipcMain.handle('munroe:project:choose', async (event) => {
  ensureRendererTrusted(event);
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] });
  if (result.canceled || !result.filePaths[0]) return null;
  const project = safeProjectPath(result.filePaths[0]);
  const api = await loadService();
  await api.registerProject(project);
  const projects = await api.listProjects();
  for (const item of projects) {
    const real = await resolveProjectPath(item.path).catch(() => item.path);
    registeredProjects.set(real, item);
  }
  return project;
});

ipcMain.handle('munroe:projects:list', async (event) => {
  ensureRendererTrusted(event);
  return (await loadService()).listProjects();
});
ipcMain.handle('munroe:project:load', async (event, cwd) => {
  ensureRendererTrusted(event);
  return (await loadService()).loadProject(safeProjectPath(cwd));
});
ipcMain.handle('munroe:project:status', async (event, cwd) => {
  ensureRendererTrusted(event);
  return (await loadService()).projectRuntimeStatus(safeProjectPath(cwd));
});
ipcMain.handle('munroe:conversations:list', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  return (await loadService()).listConversations(project);
});
ipcMain.handle('munroe:conversation:new', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  return (await loadService()).createConversation(project);
});
ipcMain.handle('munroe:conversation:append', async (event, cwd, id, message) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
    throw new Error('Invalid conversation message.');
  }
  if (message.content.length > 100000) throw new Error('Message is too long.');
  return (await loadService()).appendConversationMessage(project, id, message);
});
ipcMain.handle('munroe:chat:send', async (event, payload) => {
  ensureRendererTrusted(event);
  if (!payload || typeof payload.prompt !== 'string' || payload.prompt.trim().length === 0) throw new Error('Enter a message.');
  if (payload.prompt.length > 100000) throw new Error('Message is too long.');
  const project = safeProjectPath(payload.cwd);
  const permissions = payload.permissions ? safePermissions(payload.permissions) : undefined;
  return (await loadService()).queryMunroe({ cwd: project, prompt: payload.prompt, model: payload.model, permissions });
});

ipcMain.handle('munroe:turn:start', async (event, payload) => {
  ensureRendererTrusted(event);
  if (!payload || typeof payload.prompt !== 'string') throw new Error('Enter a message.');
  const hasImages = Array.isArray(payload.images) && payload.images.length > 0;
  if (payload.prompt.trim().length === 0 && !hasImages) throw new Error('Enter a message.');
  if (payload.prompt.length > 100000) throw new Error('Message is too long.');
  const project = safeProjectPath(payload.cwd);
  const permissions = payload.permissions ? safePermissions(payload.permissions) : undefined;
  const turnModule = await loadTurn();
  const handle = await turnModule.startTurn({
    cwd: project,
    prompt: payload.prompt || 'Review the attached files.',
    model: payload.model,
    permissions,
    images: hasImages ? payload.images.filter((p) => typeof p === 'string') : [],
    sessionId: payload.sessionId,
    onEvent: (event) => {
      try {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('munroe:turn:event', event);
        }
      } catch { /* ignore */ }
    },
  });
  activeTurns.set(handle.turnId, handle);
  return { turnId: handle.turnId };
});

ipcMain.handle('munroe:turn:interrupt', async (event, turnId) => {
  ensureRendererTrusted(event);
  if (typeof turnId !== 'string') throw new Error('Turn id required.');
  const handle = activeTurns.get(turnId);
  if (!handle) throw new Error('Turn not found.');
  await handle.abort();
  activeTurns.delete(turnId);
  return { interrupted: true };
});

ipcMain.handle('munroe:turn:approve', async (event, payload) => {
  ensureRendererTrusted(event);
  if (!payload || typeof payload.turnId !== 'string' || typeof payload.approvalId !== 'string' || !['approve', 'reject', 'always'].includes(payload.decision)) {
    throw new Error('Invalid approval.');
  }
  const handle = activeTurns.get(payload.turnId);
  if (!handle) throw new Error('Turn not found.');
  await handle.approve(payload.approvalId, payload.decision);
  return { approved: true };
});

ipcMain.handle('munroe:threads:list', async (event, query) => {
  ensureRendererTrusted(event);
  const t = await loadThreads();
  return query ? t.searchThreads(query) : t.listThreads();
});

ipcMain.handle('munroe:threads:rename', async (event, id, title) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string' || typeof title !== 'string') throw new Error('id and title required.');
  const t = await loadThreads();
  return t.renameThread(id, title);
});

ipcMain.handle('munroe:threads:delete', async (event, id) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string') throw new Error('id required.');
  const t = await loadThreads();
  return t.deleteThread(id);
});

ipcMain.handle('munroe:checkpoints:list', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const t = await loadThreads();
  return t.listCheckpoints(project);
});

ipcMain.handle('munroe:checkpoints:create', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const t = await loadThreads();
  return t.createCheckpoint(project);
});

ipcMain.handle('munroe:checkpoints:rollback', async (event, cwd, id) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (typeof id !== 'string') throw new Error('id required.');
  const t = await loadThreads();
  return t.rollbackToCheckpoint(project, id);
});

ipcMain.handle('munroe:slash', async (event, command, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (typeof command !== 'string') throw new Error('Command required.');
  const api = await loadService();
  const sanitized = command.startsWith('/') ? command.slice(1) : command;
  return api.queryMunroe({ cwd: project, prompt: `Run the ${sanitized} slash command and respond briefly.` });
});

ipcMain.handle('munroe:conversation:delete', async (event, cwd, id) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (typeof id !== 'string') throw new Error('id required.');
  const api = await loadService();
  return api.deleteConversation(project, id);
});

ipcMain.handle('munroe:conversation:rename', async (event, cwd, id, title) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (typeof id !== 'string' || typeof title !== 'string') throw new Error('id and title required.');
  const api = await loadService();
  return api.renameConversation(project, id, title);
});

ipcMain.handle('munroe:conversations:clear', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const api = await loadService();
  return api.clearConversations(project);
});

ipcMain.handle('munroe:project:update', async (event, cwd, updates) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  if (!updates || typeof updates !== 'object') throw new Error('Updates required.');
  const allowed = {};
  if (updates.model && ['auto', 'minimax', 'kimi'].includes(updates.model)) allowed.model = updates.model;
  if (updates.permissions && ['safe', 'standard'].includes(updates.permissions)) allowed.permissions = updates.permissions;
  if (Object.keys(allowed).length === 0) return await (await loadService()).loadProject(project);
  const api = await loadService();
  return api.saveProjectConfig(project, allowed);
});

ipcMain.handle('munroe:project:open', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  shell.openPath(project);
  return { opened: true };
});

ipcMain.handle('munroe:cron:list', async (event) => {
  ensureRendererTrusted(event);
  const c = await loadCron();
  const [jobs, status] = await Promise.all([c.listCronJobs(), c.cronStatus()]);
  return { jobs, status };
});

ipcMain.handle('munroe:cron:pause', async (event, id) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string' || !id) throw new Error('id required.');
  const c = await loadCron();
  return c.pauseCronJob(id);
});

ipcMain.handle('munroe:cron:resume', async (event, id) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string' || !id) throw new Error('id required.');
  const c = await loadCron();
  return c.resumeCronJob(id);
});

ipcMain.handle('munroe:cron:run', async (event, id) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string' || !id) throw new Error('id required.');
  const c = await loadCron();
  return c.runCronJob(id);
});

ipcMain.handle('munroe:cron:delete', async (event, id) => {
  ensureRendererTrusted(event);
  if (typeof id !== 'string' || !id) throw new Error('id required.');
  const c = await loadCron();
  return c.deleteCronJob(id);
});

ipcMain.handle('munroe:cron:create', async (event, payload) => {
  ensureRendererTrusted(event);
  if (!payload || typeof payload.schedule !== 'string' || !payload.schedule.trim()) {
    throw new Error('Schedule required.');
  }
  const c = await loadCron();
  const workdir = payload.workdir ? safeProjectPath(payload.workdir) : undefined;
  return c.createCronJob({
    schedule: payload.schedule.trim(),
    prompt: typeof payload.prompt === 'string' ? payload.prompt : '',
    name: typeof payload.name === 'string' ? payload.name : '',
    deliver: typeof payload.deliver === 'string' ? payload.deliver : 'local',
    workdir,
  });
});

ipcMain.handle('munroe:workspace:choose', async (event, cwd) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Add folder to workspace',
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const resolved = await resolveProjectPath(result.filePaths[0]);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error('Folder does not exist.');
  }
  registeredProjects.set(resolved, { path: resolved, name: path.basename(resolved) });
  const api = await loadService();
  const current = await api.loadProject(project);
  const folders = Array.isArray(current.config.workspaceFolders) ? [...current.config.workspaceFolders] : [];
  if (!folders.includes(resolved) && resolved !== project) folders.push(resolved);
  return api.saveProjectConfig(project, { workspaceFolders: folders });
});

ipcMain.handle('munroe:workspace:add', async (event, cwd, folder) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const resolved = await resolveProjectPath(folder);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error('Folder does not exist.');
  }
  registeredProjects.set(resolved, { path: resolved, name: path.basename(resolved) });
  const api = await loadService();
  const current = await api.loadProject(project);
  const folders = Array.isArray(current.config.workspaceFolders) ? [...current.config.workspaceFolders] : [];
  if (!folders.includes(resolved) && resolved !== project) folders.push(resolved);
  return api.saveProjectConfig(project, { workspaceFolders: folders });
});

ipcMain.handle('munroe:workspace:remove', async (event, cwd, folder) => {
  ensureRendererTrusted(event);
  const project = safeProjectPath(cwd);
  const resolved = path.resolve(folder);
  const api = await loadService();
  const current = await api.loadProject(project);
  const folders = (current.config.workspaceFolders || []).filter((entry) => entry !== resolved);
  return api.saveProjectConfig(project, { workspaceFolders: folders });
});

ipcMain.handle('munroe:attachments:add', async (event, payload) => {
  ensureRendererTrusted(event);
  if (!payload || typeof payload.name !== 'string' || typeof payload.data !== 'string') {
    throw new Error('Invalid attachment.');
  }
  if (payload.data.length > 50 * 1024 * 1024) throw new Error('Attachment too large.');
  const project = payload.cwd ? safeProjectPath(payload.cwd) : os.tmpdir();
  const dir = path.join(project, '.munroe', 'attachments');
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(payload.data, 'base64');
  const safeName = payload.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64) || 'attachment';
  const file = path.join(dir, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeName}`);
  await writeFile(file, buffer);
  return { path: file, name: payload.name };
});

ipcMain.handle('munroe:about', async (event) => {
  ensureRendererTrusted(event);
  const version = require('../package.json').version;
  return {
    product: 'Munroe Code',
    version,
    desktop: 'macOS',
    runtime: 'Hermes',
    api: 'Munroe Code CLI 1.0.0',
    buildCommit: process.env.MUNROE_BUILD_COMMIT || 'dev',
    docs: 'https://github.com/Verstige/munroe',
    support: 'https://github.com/Verstige/munroe/issues',
  };
});

ipcMain.handle('munroe:systems:memory', async (event) => {
  ensureRendererTrusted(event);
  return (await loadSystems()).memoryStatus();
});

ipcMain.handle('munroe:systems:memory:read', async (event, filePath) => {
  ensureRendererTrusted(event);
  return (await loadSystems()).readMemoryFile(filePath);
});

ipcMain.handle('munroe:systems:profiles', async (event) => {
  ensureRendererTrusted(event);
  return (await loadSystems()).listProfiles();
});

ipcMain.handle('munroe:systems:computer-use', async (event) => {
  ensureRendererTrusted(event);
  return (await loadSystems()).computerUseStatus();
});

ipcMain.handle('munroe:systems:computer-use:doctor', async (event) => {
  ensureRendererTrusted(event);
  return (await loadSystems()).computerUseDoctor();
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });