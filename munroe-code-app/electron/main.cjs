const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron')
const path = require('path')
const { pathToFileURL } = require('url')

let mainWindow
let service

async function loadService() {
  if (service) return service
  const servicePath = app.isPackaged
    ? path.join(process.resourcesPath, 'munroe-code-cli', 'src', 'service.js')
    : path.join(__dirname, '..', '..', 'munroe-code-cli', 'src', 'service.js')
  service = await import(pathToFileURL(servicePath).href)
  return service
}

function safeProjectPath(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error('Choose a valid project directory.')
  return path.resolve(value)
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
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  const devUrl = process.env.MUNROE_DEV_SERVER
  if (devUrl) await mainWindow.loadURL(devUrl)
  else await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

ipcMain.handle('munroe:bootstrap', async () => {
  const api = await loadService()
  const initial = process.env.MUNROE_INITIAL_PROJECT || process.cwd()
  await api.registerProject(initial)
  return { initialProject: initial, projects: await api.listProjects() }
})

ipcMain.handle('munroe:project:choose', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory', 'createDirectory'] })
  if (result.canceled || !result.filePaths[0]) return null
  const project = safeProjectPath(result.filePaths[0])
  const api = await loadService()
  await api.registerProject(project)
  return project
})

ipcMain.handle('munroe:projects:list', async () => (await loadService()).listProjects())
ipcMain.handle('munroe:conversations:list', async (_event, cwd) => (await loadService()).listConversations(safeProjectPath(cwd)))
ipcMain.handle('munroe:conversation:new', async (_event, cwd) => (await loadService()).createConversation(safeProjectPath(cwd)))
ipcMain.handle('munroe:conversation:append', async (_event, cwd, id, message) => {
  if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
    throw new Error('Invalid conversation message.')
  }
  return (await loadService()).appendConversationMessage(safeProjectPath(cwd), id, message)
})
ipcMain.handle('munroe:chat:send', async (_event, payload) => {
  if (!payload || typeof payload.prompt !== 'string' || payload.prompt.trim().length === 0) throw new Error('Enter a message.')
  if (payload.prompt.length > 100000) throw new Error('Message is too long.')
  return (await loadService()).queryMunroe({
    cwd: safeProjectPath(payload.cwd),
    prompt: payload.prompt,
    model: payload.model,
    permissions: payload.permissions,
  })
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
