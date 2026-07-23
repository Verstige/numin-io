const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { pathToFileURL } = require('url')

const ALLOWED_DEV_ORIGINS = new Set(['http://127.0.0.1:5177', 'http://localhost:5177'])
const RENDERER_PERMISSIONS = new Set(['safe', 'standard'])
const PROJECT_MAX_PATH_LENGTH = 4096

const registeredProjects = new Map()

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

async function loadService() {
  if (service) return service;
  const servicePath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'service.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'service.js');
  service = await import(pathToFileURL(servicePath).href);
  return service;
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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
