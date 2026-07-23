const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('munroe', {
  bootstrap: () => ipcRenderer.invoke('munroe:bootstrap'),
  chooseProject: () => ipcRenderer.invoke('munroe:project:choose'),
  listProjects: () => ipcRenderer.invoke('munroe:projects:list'),
  listConversations: (cwd) => ipcRenderer.invoke('munroe:conversations:list', cwd),
  newConversation: (cwd) => ipcRenderer.invoke('munroe:conversation:new', cwd),
  appendMessage: (cwd, id, message) => ipcRenderer.invoke('munroe:conversation:append', cwd, id, message),
  send: (payload) => ipcRenderer.invoke('munroe:chat:send', payload),
})
