import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, Bot, ChevronDown, Clock, Code2, Folder, FolderOpen, GitBranch, Info, Menu, MessageSquarePlus, Mic, MicOff, Paperclip, Pause, Play, RefreshCcw, RotateCcw, Save, Search, Send, Settings2, ShieldCheck, Sparkles, Square, TerminalSquare, Trash2, X, Zap } from 'lucide-react'
import type { About, Attachment, Checkpoint, ComputerUseStatus, Conversation, CronJob, CronStatus, MemoryStatus, Message, ProfileInfo, Project, ProjectStatus, ThreadSummary, TurnEvent, Usage } from './types'

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto', detail: 'Best available intelligence' },
  { value: 'minimax', label: 'Core', detail: 'Fast, capable, long context' },
  { value: 'kimi', label: 'Kimi', detail: 'Deep coding and reasoning' },
]
const PERMISSION_OPTIONS = [
  { value: 'safe', label: 'Safe', detail: 'Read and review only' },
  { value: 'standard', label: 'Standard', detail: 'Asks before risky commands' },
]
const MODEL_BY_VALUE = Object.fromEntries(MODEL_OPTIONS.map((option) => [option.value, option]))
const PERMISSION_BY_VALUE = Object.fromEntries(PERMISSION_OPTIONS.map((option) => [option.value, option]))
const SLASH_COMMANDS = [
  { value: '/help', label: 'Help', detail: 'Show available commands' },
  { value: '/model', label: 'Model', detail: 'Switch model' },
  { value: '/plan', label: 'Plan', detail: 'Show the next plan' },
  { value: '/skills', label: 'Skills', detail: 'List loaded skills' },
  { value: '/clear', label: 'Clear', detail: 'Start a new conversation' },
  { value: '/compact', label: 'Compact', detail: 'Compact the thread history' },
  { value: '/interrupt', label: 'Interrupt', detail: 'Cancel the running turn' },
  { value: '/rollback', label: 'Rollback', detail: 'Restore last checkpoint' },
  { value: '/cron', label: 'Cron', detail: 'Run a scheduled job now' },
  { value: '/attach', label: 'Attach', detail: 'Attach a file to the next turn' },
]

type Notification = { id: string; kind: 'info' | 'success' | 'error'; title: string; body?: string; createdAt: number }
type PaletteAction = { id: string; group: string; title: string; detail?: string; run: () => void | Promise<void> }

type StreamItem =
  | { kind: 'agent'; text: string }
  | { kind: 'command'; toolCallId: string; command: string; status: 'running' | 'ok' | 'failed' | 'denied'; output: string[] }
  | { kind: 'file'; path: string; change: 'created' | 'modified' | 'deleted' }
  | { kind: 'reasoning'; text: string }
  | { kind: 'plan'; steps: string[] }
  | { kind: 'usage'; tokens: number; cost: number }
  | { kind: 'error'; message: string }

function mergeAgent(items: StreamItem[], text: string): StreamItem[] {
  if (!items.length) return [{ kind: 'agent', text }]
  const last = items[items.length - 1]
  if (last.kind === 'agent') return [...items.slice(0, -1), { kind: 'agent', text: last.text + text }]
  return [...items, { kind: 'agent', text }]
}

function mergeReasoning(items: StreamItem[], text: string): StreamItem[] {
  if (!items.length) return [{ kind: 'reasoning', text }]
  const last = items[items.length - 1]
  if (last.kind === 'reasoning') return [...items.slice(0, -1), { kind: 'reasoning', text: last.text + text }]
  return [...items, { kind: 'reasoning', text }]
}

function mergeCommandOutput(items: StreamItem[], toolCallId: string, chunk: string, stream: 'stdout' | 'stderr'): StreamItem[] {
  const next = [...items]
  let idx = next.findIndex((item) => item.kind === 'command' && item.toolCallId === toolCallId)
  if (idx < 0) {
    next.push({ kind: 'command', toolCallId, command: toolCallId, status: 'running', output: [] })
    idx = next.length - 1
  }
  const cmd = next[idx] as Extract<StreamItem, { kind: 'command' }>
  next[idx] = { ...cmd, output: [...cmd.output, `[${stream}] ${chunk}`] }
  return next
}

function formatElapsed(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  if (minutes < 60) return `${minutes}m ${rem.toString().padStart(2, '0')}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${(minutes % 60).toString().padStart(2, '0')}m`
}

export default function App() {
  const [project, setProject] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [threads, setThreads] = useState<ThreadSummary[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState('auto')
  const [permissions, setPermissions] = useState<'safe' | 'standard'>('standard')
  const [status, setStatus] = useState<ProjectStatus | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState<Usage | null>(null)
  const [modelOpen, setModelOpen] = useState(false)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [streamItems, setStreamItems] = useState<StreamItem[]>([])
  const [threadSearch, setThreadSearch] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTurnId, setActiveTurnId] = useState<string | null>(null)
  const [turnStartedAt, setTurnStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutInfo, setAboutInfo] = useState<About | null>(null)
  const [workspaceFolders, setWorkspaceFolders] = useState<string[]>([])
  const [cronFormOpen, setCronFormOpen] = useState(false)
  const [cronName, setCronName] = useState('')
  const [cronSchedule, setCronSchedule] = useState('every 1d')
  const [cronPrompt, setCronPrompt] = useState('')
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null)
  const [profiles, setProfiles] = useState<ProfileInfo[]>([])
  const [computerUse, setComputerUse] = useState<ComputerUseStatus | null>(null)
  const [memoryPreview, setMemoryPreview] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const projectRef = useRef(project)
  const activeIdRef = useRef(activeId)
  projectRef.current = project
  activeIdRef.current = activeId

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId])
  const messages = active?.messages ?? []

  useEffect(() => {
    window.munroe.bootstrap().then(async (data) => {
      if (data && 'error' in data && data.error) {
        setError(String(data.error.message || 'Munroe service is unavailable.'));
        return;
      }
      setProject(data.initialProject)
      setProjects(data.projects)
      await loadConversations(data.initialProject)
      await refreshThreads()
      await refreshCheckpoints(data.initialProject)
      await refreshCron()
      try { setAboutInfo(await window.munroe.about()) } catch (e) { /* ignore */ }
      void refreshSystems()
    }).catch(e => setError(String(e.message || e)))
  }, [])

  useEffect(() => {
    const unsubscribe = window.munroe.onTurnEvent((event) => {
      if (event.type === 'turnStarted') {
        setActiveTurnId(event.turnId)
        setBusy(true)
        setError('')
        setStreamItems([])
        setTurnStartedAt(Date.now())
        return
      }
      if (event.type === 'turnCompleted') {
        setBusy(false)
        setActiveTurnId(null)
        setTurnStartedAt(null)
        notify('success', 'Turn completed')
        const cwd = projectRef.current
        const convId = activeIdRef.current
        const text = event.text?.trim()
        if (cwd && convId && text) {
          void window.munroe.appendMessage(cwd, convId, { role: 'assistant', content: text }).then((updated) => {
            setConversations((current) => [updated, ...current.filter((c) => c.id !== updated.id)])
            setStreamItems([])
          }).catch(() => { /* keep stream items if persist fails */ })
        }
        return
      }
      if (event.type === 'turnFailed') {
        setBusy(false)
        setActiveTurnId(null)
        setTurnStartedAt(null)
        setError(event.message)
        setStreamItems((items) => [...items, { kind: 'error', message: event.message }])
        notify('error', 'Turn failed', event.message)
        return
      }
      if (event.type === 'turnInterrupted') {
        setBusy(false)
        setActiveTurnId(null)
        setTurnStartedAt(null)
        notify('info', 'Turn interrupted')
        setStreamItems((items) => [...items, { kind: 'error', message: 'Interrupted' }])
        return
      }
      if (event.type === 'agentMessageDelta') {
        setStreamItems((items) => mergeAgent(items, event.delta))
        return
      }
      if (event.type === 'reasoningDelta') {
        setStreamItems((items) => mergeReasoning(items, event.delta))
        return
      }
      if (event.type === 'commandExecBegin') {
        setStreamItems((items) => [...items, { kind: 'command', toolCallId: event.toolCallId, command: event.command, status: 'running', output: [] }])
        return
      }
      if (event.type === 'commandExecOutput') {
        setStreamItems((items) => mergeCommandOutput(items, event.toolCallId, event.chunk, event.stream))
        return
      }
      if (event.type === 'commandExecEnd') {
        setStreamItems((items) => items.map((item) => item.kind === 'command' && item.toolCallId === event.toolCallId ? { ...item, status: event.status } : item))
        return
      }
      if (event.type === 'fileChange') {
        setStreamItems((items) => [...items, { kind: 'file', path: event.path, change: event.kind }])
        notify('info', `${event.kind} ${event.path}`)
        return
      }
      if (event.type === 'planProposed') {
        setStreamItems((items) => [...items, { kind: 'plan', steps: event.steps }])
        return
      }
      if (event.type === 'usage') {
        setUsage({ total_tokens: event.tokens, estimated_cost_usd: event.cost })
        setStreamItems((items) => [...items, { kind: 'usage', tokens: event.tokens, cost: event.cost }])
        return
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [streamItems.length, messages.length, busy])

  useEffect(() => {
    if (!turnStartedAt || !busy) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [turnStartedAt, busy])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey
      if (isMeta && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((v) => !v)
        setPaletteQuery('')
      } else if (event.key === 'Escape') {
        setPaletteOpen(false)
        setSlashOpen(false)
        setAboutOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function notify(kind: 'info' | 'success' | 'error', title: string, body?: string) {
    const id = crypto.randomUUID()
    setNotifications((current) => [...current, { id, kind, title, body, createdAt: Date.now() }])
    window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id))
    }, 6000)
  }

  async function refreshSystems() {
    try {
      const [memory, profileList, cu] = await Promise.all([
        window.munroe.memoryStatus(),
        window.munroe.listProfiles(),
        window.munroe.computerUseStatus(),
      ])
      setMemoryStatus(memory)
      setProfiles(profileList.profiles || [])
      setComputerUse(cu)
    } catch (e) {
      notify('error', 'Failed to refresh systems', String((e as Error).message || e))
    }
  }

  async function openMemoryFile(filePath: string) {
    try {
      const file = await window.munroe.memoryRead(filePath)
      setMemoryPreview(file.content)
      notify('info', `Opened ${file.path.split('/').pop()}`)
    } catch (e) {
      notify('error', 'Failed to read memory file', String((e as Error).message || e))
    }
  }

  async function runComputerUseDoctor() {
    try {
      const result = await window.munroe.computerUseDoctor()
      notify(result.ok ? 'success' : 'error', 'Computer use doctor', result.message.slice(0, 180))
      setComputerUse(await window.munroe.computerUseStatus())
    } catch (e) {
      notify('error', 'Doctor failed', String((e as Error).message || e))
    }
  }

  function toggleDictation() {
    const w = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }
    const SpeechRecognitionImpl = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognitionImpl) {
      notify('error', 'Voice dictation unavailable in this runtime')
      return
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }
    const recognition = new SpeechRecognitionImpl()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event: any) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0].transcript
      }
      if (text.trim()) setDraft((current) => (current ? `${current} ${text.trim()}` : text.trim()))
    }
    recognition.onerror = () => {
      setListening(false)
      notify('error', 'Dictation error')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
    notify('info', 'Listening…')
  }

  async function refreshCron() {
    try {
      const result = await window.munroe.cronList()
      setCronJobs(result.jobs)
      setCronStatus(result.status)
    } catch (e) {
      setCronJobs([])
      setCronStatus({ running: false, message: String((e as Error).message || e) })
    }
  }

  async function pauseCron(id: string) {
    const ok = await window.munroe.cronPause(id)
    notify(ok ? 'success' : 'error', ok ? 'Cron job paused' : 'Failed to pause cron job')
    await refreshCron()
  }

  async function resumeCron(id: string) {
    const ok = await window.munroe.cronResume(id)
    notify(ok ? 'success' : 'error', ok ? 'Cron job resumed' : 'Failed to resume cron job')
    await refreshCron()
  }

  async function runCron(id: string) {
    const ok = await window.munroe.cronRun(id)
    notify(ok ? 'success' : 'error', ok ? 'Cron job queued' : 'Failed to run cron job')
    await refreshCron()
  }

  async function deleteCron(id: string) {
    if (!confirm('Remove this scheduled job? This cannot be undone.')) return
    const ok = await window.munroe.cronDelete(id)
    notify(ok ? 'success' : 'error', ok ? 'Cron job removed' : 'Failed to remove cron job')
    await refreshCron()
  }

  async function createCronJob() {
    if (!cronSchedule.trim()) {
      notify('error', 'Schedule required')
      return
    }
    const result = await window.munroe.cronCreate({
      schedule: cronSchedule.trim(),
      prompt: cronPrompt.trim() || 'Summarize project status and next actions.',
      name: cronName.trim() || 'Munroe scheduled task',
      deliver: 'local',
      workdir: project || undefined,
    })
    if (result.ok) {
      notify('success', 'Cron job created', result.message)
      setCronFormOpen(false)
      setCronName('')
      setCronPrompt('')
      setCronSchedule('every 1d')
      await refreshCron()
    } else {
      notify('error', 'Failed to create cron job', result.message)
    }
  }

  async function addWorkspaceFolder() {
    if (!project) return
    try {
      const result = await window.munroe.workspaceChoose(project)
      if (!result) return
      setWorkspaceFolders(result.config.workspaceFolders || [])
      notify('success', 'Folder added to workspace')
    } catch (e) {
      notify('error', 'Failed to add folder', String((e as Error).message || e))
    }
  }

  async function removeWorkspaceFolder(folder: string) {
    if (!project) return
    try {
      const result = await window.munroe.workspaceRemove(project, folder)
      setWorkspaceFolders(result.config.workspaceFolders || [])
      notify('info', 'Folder removed from workspace')
    } catch (e) {
      notify('error', 'Failed to remove folder', String((e as Error).message || e))
    }
  }

  async function fileToBase64(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
  }

  async function attachFiles() {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = async () => {
      const files = Array.from(input.files || [])
      const added: Attachment[] = []
      for (const file of files) {
        try {
          const data = await fileToBase64(file)
          const result = await window.munroe.addAttachment({ name: file.name, data, cwd: project })
          added.push(result)
        } catch (e) {
          notify('error', `Failed to attach ${file.name}`, String((e as Error).message || e))
        }
      }
      if (added.length > 0) {
        setAttachments((current) => [...current, ...added])
        notify('success', `Attached ${added.length} file${added.length > 1 ? 's' : ''}`)
      }
    }
    input.click()
  }

  function removeAttachment(path: string) {
    setAttachments((current) => current.filter((item) => item.path !== path))
  }

  useEffect(() => {
    const onPaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return
      for (const item of Array.from(items)) {
        if (!item.type.startsWith('image/')) continue
        const file = item.getAsFile()
        if (!file) continue
        event.preventDefault()
        try {
          const data = await fileToBase64(file)
          const result = await window.munroe.addAttachment({ name: file.name || 'pasted-image.png', data, cwd: project })
          setAttachments((current) => [...current, result])
          notify('success', 'Image pasted')
        } catch (e) {
          notify('error', 'Failed to paste image', String((e as Error).message || e))
        }
        break
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [project])

  async function openAbout() {
    setAboutOpen(true)
    if (!aboutInfo) {
      try { setAboutInfo(await window.munroe.about()) } catch (e) { /* ignore */ }
    }
  }

  function runPaletteAction(action: PaletteAction) {
    setPaletteOpen(false)
    setPaletteQuery('')
    void action.run()
  }

  const paletteActions: PaletteAction[] = [
    { id: 'new-conversation', group: 'Conversations', title: 'New conversation', run: newConversation },
    { id: 'clear-conversations', group: 'Conversations', title: 'Clear all conversations', run: clearConversations },
    { id: 'switch-project', group: 'Project', title: 'Switch project', run: chooseProject },
    { id: 'open-project', group: 'Project', title: 'Open project in Finder', run: () => window.munroe.openProject(project) },
    { id: 'save-checkpoint', group: 'Checkpoints', title: 'Save checkpoint', run: createCheckpoint },
    { id: 'refresh-threads', group: 'Workspace', title: 'Refresh threads', run: refreshThreads },
    { id: 'refresh-checkpoints', group: 'Workspace', title: 'Refresh checkpoints', run: () => refreshCheckpoints(project) },
    { id: 'refresh-cron', group: 'Workspace', title: 'Refresh cron jobs', run: refreshCron },
    { id: 'attach-files', group: 'Composer', title: 'Attach files', run: attachFiles },
    { id: 'open-settings', group: 'App', title: 'Open settings', run: () => setSettingsOpen(true) },
    { id: 'open-about', group: 'App', title: 'About Munroe Code', run: openAbout },
    ...MODEL_OPTIONS.map((option) => ({
      id: `model-${option.value}`,
      group: 'Model',
      title: `Switch model → ${option.label}`,
      detail: option.detail,
      run: () => changeModel(option.value as 'auto' | 'minimax' | 'kimi'),
    })),
  ]
  const filteredActions = paletteActions.filter((action) => {
    if (!paletteQuery.trim()) return true
    return `${action.title} ${action.detail || ''} ${action.group}`.toLowerCase().includes(paletteQuery.toLowerCase())
  })

  async function loadConversations(cwd: string) {
    try {
      const [loaded, projectStatus] = await Promise.all([
        window.munroe.loadProject(cwd),
        window.munroe.projectStatus(cwd),
      ])
      if (projectStatus.model === 'auto' || projectStatus.model === 'minimax' || projectStatus.model === 'kimi') {
        setModel(projectStatus.model)
      }
      if (projectStatus.permissions === 'safe' || projectStatus.permissions === 'standard') {
        setPermissions(projectStatus.permissions)
      }
      setStatus(projectStatus)
      setWorkspaceFolders(loaded.config.workspaceFolders || [])
    } catch {
      setStatus({ model: 'auto', permissions: 'standard', modelLabel: 'Not configured', modelAccessConfigured: false, envLayers: [], runtime: 'missing' })
      setWorkspaceFolders([])
    }
    const rows = await window.munroe.listConversations(cwd)
    if (rows.length === 0) {
      const created = await window.munroe.newConversation(cwd)
      setConversations([created])
      setActiveId(created.id)
    } else {
      setConversations(rows)
      setActiveId(rows[0].id)
    }
  }

  async function refreshThreads() {
    const list = await window.munroe.listThreads()
    setThreads(list || [])
  }

  async function refreshCheckpoints(cwd: string) {
    const list = await window.munroe.listCheckpoints(cwd)
    setCheckpoints(list || [])
  }

  async function chooseProject() {
    const next = await window.munroe.chooseProject()
    if (!next) return
    setProject(next)
    setProjects(await window.munroe.listProjects())
    setUsage(null)
    setStreamItems([])
    await loadConversations(next)
    await refreshThreads()
    await refreshCheckpoints(next)
  }

  async function newConversation() {
    if (!project) return
    const item = await window.munroe.newConversation(project)
    setConversations((current) => [item, ...current])
    setActiveId(item.id)
    setUsage(null)
    setStreamItems([])
  }

  async function changeModel(next: 'auto' | 'minimax' | 'kimi') {
    setModel(next)
    if (project) {
      try {
        await window.munroe.updateProject(project, { model: next })
        setStatus(await window.munroe.projectStatus(project))
      } catch (e) {
        setError(String((e as Error).message || e))
      }
    }
  }

  async function changePermissions(next: 'safe' | 'standard') {
    setPermissions(next)
    if (project) {
      try {
        await window.munroe.updateProject(project, { permissions: next })
        setStatus(await window.munroe.projectStatus(project))
      } catch (e) {
        setError(String((e as Error).message || e))
      }
    }
  }

  async function clearConversations() {
    if (!project) return
    if (!confirm('Clear all conversations in this project? This cannot be undone.')) return
    await window.munroe.clearConversations(project)
    const created = await window.munroe.newConversation(project)
    setConversations([created])
    setActiveId(created.id)
    setStreamItems([])
  }

  async function renameActive() {
    if (!active || !project) return
    const next = prompt('Rename conversation', active.title)
    if (!next || !next.trim() || next === active.title) return
    const updated = await window.munroe.renameConversation(project, active.id, next.trim())
    setConversations((current) => [updated, ...current.filter((c) => c.id !== updated.id)])
  }

  async function deleteActive() {
    if (!active || !project) return
    if (!confirm(`Delete conversation "${active.title}"?`)) return
    await window.munroe.deleteConversation(project, active.id)
    const remaining = await window.munroe.listConversations(project)
    if (remaining.length === 0) {
      const created = await window.munroe.newConversation(project)
      setConversations([created])
      setActiveId(created.id)
    } else {
      setConversations(remaining)
      setActiveId(remaining[0].id)
    }
  }

  async function send() {
    const prompt = draft.trim()
    if ((!prompt && attachments.length === 0) || !project || busy) return
    const attachmentPaths = attachments.map((item) => item.path)
    const attachmentNote = attachmentPaths.length
      ? `\n\n[Attached files — read these paths with tools if needed]\n${attachmentPaths.map((p) => `- ${p}`).join('\n')}`
      : ''
    const fullPrompt = `${prompt || 'Review the attached files.'}${attachmentNote}`
    const userVisible = attachmentPaths.length
      ? `${prompt || 'Attached files'}${attachmentPaths.map((p) => `\n📎 ${p.split('/').pop()}`).join('')}`
      : prompt
    setDraft('')
    setAttachments([])
    setError('')
    setStreamItems([])
    if (prompt.startsWith('/')) {
      setSlashOpen(false)
      const command = prompt.split(/\s+/)[0]
      try {
        const result = await window.munroe.runSlash(command, project)
        setStreamItems([{ kind: 'agent', text: result.text || `${command} executed.` }])
      } catch (e) {
        setError(String((e as Error).message || e))
      }
      return
    }
    const updated = await window.munroe.appendMessage(project, activeId!, { role: 'user', content: userVisible })
    setConversations((current) => [updated, ...current.filter((c) => c.id !== updated.id)])
    try {
      await window.munroe.startTurn({
        cwd: project,
        prompt: fullPrompt,
        model,
        permissions,
        images: attachmentPaths,
      })
    } catch (e) {
      setBusy(false)
      setActiveTurnId(null)
      setTurnStartedAt(null)
      setError(String((e as Error).message || e))
    }
  }

  async function interrupt() {
    if (!activeTurnId) return
    await window.munroe.interruptTurn(activeTurnId)
  }

  async function searchThreads() {
    if (!threadSearch.trim()) {
      await refreshThreads()
      return
    }
    const list = await window.munroe.listThreads(threadSearch)
    setThreads(list || [])
  }

  async function deleteThread(id: string) {
    await window.munroe.deleteThread(id)
    await refreshThreads()
  }

  async function createCheckpoint() {
    if (!project) return
    const cp = await window.munroe.createCheckpoint(project)
    if (cp) await refreshCheckpoints(project)
  }

  async function rollbackCheckpoint(id: string) {
    if (!project) return
    await window.munroe.rollbackCheckpoint(project, id)
    await refreshCheckpoints(project)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (slashOpen) {
        setSlashOpen(false)
        setDraft('')
      } else {
        void send()
      }
    } else if (event.key === '/' && draft === '') {
      setSlashOpen(true)
    }
  }

  const runtimeLabel = status?.runtime === 'available' ? 'Runtime online' : 'Runtime unavailable'
  const permissionsLabel = PERMISSION_BY_VALUE[permissions]?.label ?? permissions
  const envSummary = (status?.envLayers ?? []).length === 0
    ? null
    : `Credentials: ${status!.envLayers.join(', ')}`
  const slashFiltered = SLASH_COMMANDS.filter((c) => c.value.startsWith(slashQuery || '/'))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark"><Code2 size={18} strokeWidth={1.8} /></div>
          <div><strong>Munroe</strong><span>CODE</span></div>
        </div>

        <button className="new-chat" onClick={newConversation}><MessageSquarePlus size={16} /> New conversation</button>

        <button className="project-picker" onClick={chooseProject}>
          <FolderOpen size={16} />
          <span><small>PROJECT</small><strong>{project ? project.split('/').pop() : 'Choose project'}</strong></span>
          <ChevronDown size={14} />
        </button>
        <div className="section-label">WORKSPACE</div>
        <button className="checkpoint-create" onClick={addWorkspaceFolder}><Folder size={14} /> Add folder</button>
        <nav className="conversation-list">
          {workspaceFolders.length === 0 ? <span className="empty-hint">Only the root project</span> : workspaceFolders.map((folder) => (
            <button key={folder} className="thread-row" title={folder}>
              <span><Folder size={11} /> <small>{folder.split('/').pop()}</small></span>
              <button className="thread-delete" onClick={(e) => { e.stopPropagation(); void removeWorkspaceFolder(folder) }}><X size={11} /></button>
            </button>
          ))}
        </nav>

        <div className="section-label">CONVERSATIONS</div>
        <nav className="conversation-list">
          {conversations.map(item => (
            <button key={item.id} className={item.id === activeId ? 'active' : ''} onClick={() => setActiveId(item.id)}>
              <span>{item.title}</span><small>{new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
            </button>
          ))}
        </nav>

        <div className="section-label">THREADS</div>
        <div className="thread-search-row">
          <input value={threadSearch} onChange={e => setThreadSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchThreads()} placeholder="Search threads…" />
        </div>
        <nav className="conversation-list">
          {threads.length === 0 ? <span className="empty-hint">No past threads</span> : threads.map(t => (
            <button key={t.id} className="thread-row">
              <span><small>{t.title || t.id}</small></span>
              <button className="thread-delete" onClick={(e) => { e.stopPropagation(); deleteThread(t.id) }}><X size={11} /></button>
            </button>
          ))}
        </nav>

        <div className="section-label">CHECKPOINTS</div>
        <button className="checkpoint-create" onClick={createCheckpoint}><Save size={14} /> Save checkpoint</button>
        <nav className="conversation-list">
          {checkpoints.length === 0 ? <span className="empty-hint">No checkpoints yet</span> : checkpoints.map((cp, idx) => (
            <button key={idx} className="thread-row" onClick={() => cp.label && rollbackCheckpoint(cp.label)}>
              <span><RotateCcw size={11} /> <small>{cp.label}</small></span>
            </button>
          ))}
        </nav>

        <div className="section-label">CRON {cronStatus && <span className={cronStatus.running ? 'live-dot' : 'live-dot offline'} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}</div>
        <button className="checkpoint-create" onClick={() => setCronFormOpen((v) => !v)}><Zap size={14} /> {cronFormOpen ? 'Close form' : 'New cron job'}</button>
        {cronFormOpen && (
          <div className="cron-form">
            <input value={cronName} onChange={(e) => setCronName(e.target.value)} placeholder="Name" />
            <input value={cronSchedule} onChange={(e) => setCronSchedule(e.target.value)} placeholder="Schedule (every 1d or 0 9 * * *)" />
            <textarea value={cronPrompt} onChange={(e) => setCronPrompt(e.target.value)} placeholder="Prompt / task" rows={3} />
            <button className="checkpoint-create" onClick={createCronJob}><Zap size={14} /> Create job</button>
          </div>
        )}
        <nav className="conversation-list">
          {cronJobs.length === 0 ? <span className="empty-hint">{cronStatus ? cronStatus.message || 'No cron jobs' : 'No cron jobs'}</span> : cronJobs.slice(0, 6).map(job => (
            <div key={job.id} className="cron-row">
              <div className="cron-row-head">
                <span className={job.status === 'active' ? 'live-dot' : 'live-dot offline'} />
                <small>{job.name || job.id}</small>
              </div>
              <small className="cron-schedule">{job.schedule || 'no schedule'}</small>
              <div className="cron-actions">
                {job.status === 'active' ? (
                  <button onClick={() => pauseCron(job.id)} title="Pause"><Pause size={10} /></button>
                ) : (
                  <button onClick={() => resumeCron(job.id)} title="Resume"><Play size={10} /></button>
                )}
                <button onClick={() => runCron(job.id)} title="Run now"><Zap size={10} /></button>
                <button onClick={() => deleteCron(job.id)} title="Remove" className="danger"><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-line"><span className={status?.runtime === 'available' ? 'live-dot' : 'live-dot offline'} /> {runtimeLabel}</div>
          <button onClick={() => setPaletteOpen(true)}><Search size={15} /> Command palette <small>⌘K</small></button>
          <button onClick={() => setSettingsOpen((v) => !v)}><Settings2 size={15} /> Settings</button>
          <button onClick={openAbout}><Info size={15} /> About</button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="session-title"><Square size={9} fill="#c9a84c" /> {active?.title || 'New conversation'}{active && <div className="session-actions"><button className="session-action" onClick={renameActive} title="Rename">Rename</button><button className="session-action danger" onClick={deleteActive} title="Delete">Delete</button></div>}</div>
          <div className="top-actions">
            <div className="model-control">
              <button onClick={() => setModelOpen((v) => !v)}><Sparkles size={14} /> {MODEL_BY_VALUE[model]?.label ?? model}<ChevronDown size={13} /></button>
              {modelOpen && <div className="model-menu">
                {MODEL_OPTIONS.map(option => <button key={option.value} className={option.value === model ? 'selected' : ''} onClick={() => { changeModel(option.value as 'auto' | 'minimax' | 'kimi'); setModelOpen(false) }}>
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>{option.value === model && <span className="check">✓</span>}
                </button>)}
              </div>}
            </div>
            <select aria-label="Permission mode" value={permissions} onChange={e => changePermissions(e.target.value as 'safe' | 'standard')}>
              {PERMISSION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {busy && <span className="activity-timer"><Clock size={11} /> {formatElapsed(now - (turnStartedAt ?? now))}</span>}
            {busy && <button className="interrupt" onClick={interrupt}><Square size={13} /> Interrupt</button>}
          </div>
        </header>

        {settingsOpen && <section className="settings-panel">
          <header className="settings-header">
            <h3>Munroe Code settings</h3>
            <button className="settings-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={14} /></button>
          </header>

          <fieldset className="settings-group">
            <legend>Intelligence</legend>
            <div className="settings-control">
              <label htmlFor="settings-model">Model</label>
              <select id="settings-model" value={model} onChange={e => changeModel(e.target.value as 'auto' | 'minimax' | 'kimi')}>
                {MODEL_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label} — {option.detail}</option>)}
              </select>
            </div>
            <p className="settings-hint">{status?.modelAccessConfigured ? 'Credentials detected for this provider.' : 'No credentials detected for this provider.'}</p>
          </fieldset>

          <fieldset className="settings-group">
            <legend>Permissions</legend>
            <div className="settings-control">
              <label htmlFor="settings-permissions">Approval policy</label>
              <select id="settings-permissions" value={permissions} onChange={e => changePermissions(e.target.value as 'safe' | 'standard')}>
                {PERMISSION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label} — {option.detail}</option>)}
              </select>
            </div>
            <p className="settings-hint">Trusted mode must be enabled from the CLI for safety.</p>
          </fieldset>

          <fieldset className="settings-group">
            <legend>Project</legend>
            <div className="settings-row"><label>Path</label><span className="mono">{project || 'No project'}</span></div>
            <div className="settings-row"><label>Runtime</label><span>{status?.runtime === 'available' ? 'Available' : 'Missing'}</span></div>
            <div className="settings-row"><label>Model access</label><span>{status?.modelLabel || 'Unknown'}</span></div>
            <div className="settings-row"><label>Credentials</label><span>{status?.envLayers?.join(', ') || 'none detected'}</span></div>
            <div className="settings-row"><label>Threads</label><span>{threads.length}</span></div>
            <div className="settings-row"><label>Checkpoints</label><span>{checkpoints.length}</span></div>
            <div className="settings-actions">
              <button className="settings-action" onClick={() => window.munroe.openProject(project)}><Folder size={13} /> Open in Finder</button>
              <button className="settings-action" onClick={() => chooseProject()}><FolderOpen size={13} /> Switch project</button>
            </div>
          </fieldset>

          <fieldset className="settings-group">
            <legend>Conversations</legend>
            <div className="settings-actions">
              <button className="settings-action" onClick={newConversation}><MessageSquarePlus size={13} /> New conversation</button>
              <button className="settings-action danger" onClick={clearConversations}><X size={13} /> Clear all</button>
            </div>
          </fieldset>

          <fieldset className="settings-group">
            <legend>Workspace</legend>
            <div className="settings-actions">
              <button className="settings-action" onClick={() => refreshThreads()}><RotateCcw size={13} /> Refresh threads</button>
              <button className="settings-action" onClick={() => refreshCheckpoints(project)}><RotateCcw size={13} /> Refresh checkpoints</button>
              <button className="settings-action" onClick={createCheckpoint}><Save size={13} /> Save checkpoint</button>
              <button className="settings-action" onClick={addWorkspaceFolder}><Folder size={13} /> Add folder</button>
            </div>
          </fieldset>

          <fieldset className="settings-group">
            <legend>Memory</legend>
            <div className="settings-row"><label>Status</label><span>{memoryStatus?.ok ? 'Connected' : 'Unavailable'}</span></div>
            <div className="settings-row"><label>Files</label><span>{memoryStatus?.files?.length ?? 0}</span></div>
            <div className="settings-actions">
              <button className="settings-action" onClick={refreshSystems}><RotateCcw size={13} /> Refresh</button>
              {(memoryStatus?.files || []).map((file) => (
                <button key={file.path} className="settings-action" onClick={() => openMemoryFile(file.path)}>{file.name}</button>
              ))}
            </div>
            {memoryPreview && <pre className="memory-preview">{memoryPreview.slice(0, 1200)}</pre>}
          </fieldset>

          <fieldset className="settings-group">
            <legend>Profiles</legend>
            {profiles.length === 0 ? <p className="settings-hint">No profiles detected</p> : profiles.map((profile) => (
              <div key={profile.name} className="settings-row"><label>{profile.active ? 'Active' : 'Profile'}</label><span>{profile.name}</span></div>
            ))}
          </fieldset>

          <fieldset className="settings-group">
            <legend>Computer use</legend>
            <div className="settings-row"><label>Driver</label><span>{computerUse?.installed ? 'Installed' : 'Missing'}</span></div>
            <p className="settings-hint">{computerUse?.message?.slice(0, 160) || 'Status unknown'}</p>
            <div className="settings-actions">
              <button className="settings-action" onClick={runComputerUseDoctor}><ShieldCheck size={13} /> Run doctor</button>
            </div>
          </fieldset>
        </section>}

        <section className={`chat ${messages.length === 0 && streamItems.length === 0 ? 'empty' : ''}`}>
          {messages.length === 0 && streamItems.length === 0 ? <div className="intro">
            <div className="intro-glyph"><Bot size={28} strokeWidth={1.3} /></div>
            <p className="eyebrow">MUNROE CODE</p>
            <h1>What are we building?</h1>
            <p>Ask Munroe to inspect, explain, modify, or verify anything in your project.</p>
            <div className="suggestions">
              <button onClick={() => setDraft('Inspect this project and explain its architecture.')}>Explain this codebase</button>
              <button onClick={() => setDraft('Find the highest-impact bug in this project and propose a fix.')}>Find a bug</button>
              <button onClick={() => setDraft('Run the project verification and fix what fails.')}>Fix failing checks</button>
              <button onClick={() => setDraft('/plan')}>Run a plan</button>
            </div>
          </div> : <div className="messages">
            {messages.map((message: Message, index) => <article key={`${message.createdAt}-${index}`} className={`message ${message.role}`}>
              <div className="message-meta">{message.role === 'user' ? 'YOU' : 'MUNROE'}</div>
              <div className="message-body">{message.content}</div>
            </article>)}
            {streamItems.map((item, index) => {
              if (item.kind === 'agent') return <article key={`agent-${index}`} className="message assistant"><div className="message-meta">MUNROE</div><div className="message-body">{item.text}</div></article>
              if (item.kind === 'reasoning') return <article key={`reasoning-${index}`} className="message reasoning"><div className="message-meta"><Sparkles size={11} /> REASONING</div><div className="message-body">{item.text}</div></article>
              if (item.kind === 'command') return <article key={`command-${index}`} className="message tool"><div className="message-meta"><TerminalSquare size={11} /> COMMAND · {item.status}</div><div className="message-body"><pre>{item.command}{'\n'}{item.output.join('\n')}</pre></div></article>
              if (item.kind === 'file') return <article key={`file-${index}`} className="message tool"><div className="message-meta"><GitBranch size={11} /> FILE · {item.change}</div><div className="message-body"><code>{item.path}</code></div></article>
              if (item.kind === 'plan') return <article key={`plan-${index}`} className="message plan"><div className="message-meta">PLAN</div><ol>{item.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></article>
              if (item.kind === 'usage') return <article key={`usage-${index}`} className="message usage"><div className="message-meta">USAGE</div><div className="message-body">{item.tokens.toLocaleString()} tokens · ${item.cost.toFixed(4)}</div></article>
              return <article key={`error-${index}`} className="message error"><div className="message-meta">ERROR</div><div className="message-body">{item.kind === 'error' ? item.message : ''}</div></article>
            })}
            <div ref={bottomRef} />
          </div>}
        </section>

        <footer className="composer-wrap">
          {error && <div className="error-banner">{error}</div>}
          {slashOpen && <div className="slash-menu">
            {slashFiltered.map(cmd => <button key={cmd.value} onClick={() => { setDraft(cmd.value); setSlashOpen(false); setSlashQuery('') }}>
              <span><strong>{cmd.value}</strong><small>{cmd.detail}</small></span>
            </button>)}
          </div>}
          {attachments.length > 0 && (
            <div className="attachment-chips">
              {attachments.map((item) => (
                <span key={item.path} className="attachment-chip">
                  <Paperclip size={11} />
                  {item.name}
                  <button onClick={() => removeAttachment(item.path)} aria-label={`Remove ${item.name}`}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
          <div className="composer">
            <textarea
              ref={composerRef}
              value={draft}
              onChange={e => { setDraft(e.target.value); setSlashQuery(e.target.value) }}
              onKeyDown={onKeyDown}
              placeholder={slashOpen ? 'Pick a slash command' : 'Message Munroe Code — type / for commands, paste images, or attach files'}
              rows={1}
            />
            <div className="composer-bottom">
              <div className="context-pills">
                <span><Folder size={12} />{project.split('/').pop() || 'No project'}</span>
                <span><ShieldCheck size={12} />{permissionsLabel}</span>
                <button type="button" className="attach-btn" onClick={attachFiles} title="Attach files"><Paperclip size={12} /> Attach</button>
                <button type="button" className={`attach-btn ${listening ? 'listening' : ''}`} onClick={toggleDictation} title="Dictate">
                  {listening ? <MicOff size={12} /> : <Mic size={12} />} {listening ? 'Stop' : 'Dictate'}
                </button>
              </div>
              <button className="send" disabled={(!draft.trim() && attachments.length === 0) || busy || status?.runtime !== 'available'} onClick={send}>{busy ? <Square size={14} /> : <Send size={15} />}</button>
            </div>
          </div>
          <div className="footer-meta">
            <span><TerminalSquare size={12} /> Munroe can make mistakes. Review changes before shipping. {envSummary ? `· ${envSummary}` : ''}</span>
            {usage && <span>{usage.total_tokens?.toLocaleString() || 0} tokens · {usage.api_calls || 0} calls</span>}
          </div>
        </footer>
      </main>

      <div className="toast-stack" aria-live="polite">
        {notifications.map((note) => (
          <div key={note.id} className={`toast toast-${note.kind}`}>
            <strong>{note.title}</strong>
            {note.body && <p>{note.body}</p>}
          </div>
        ))}
      </div>

      {paletteOpen && <div className="palette-backdrop" onClick={() => setPaletteOpen(false)}>
        <div className="palette" onClick={(event) => event.stopPropagation()}>
          <div className="palette-search">
            <Search size={14} />
            <input autoFocus value={paletteQuery} onChange={(e) => setPaletteQuery(e.target.value)} placeholder="Search commands, models, projects…" />
            <small>⌘K</small>
          </div>
          <div className="palette-list">
            {filteredActions.length === 0 ? <span className="empty-hint">No matches</span> : filteredActions.map((action) => (
              <button key={action.id} className="palette-row" onClick={() => runPaletteAction(action)}>
                <span className="palette-group">{action.group}</span>
                <span className="palette-title">{action.title}</span>
                {action.detail && <small>{action.detail}</small>}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {aboutOpen && <div className="palette-backdrop" onClick={() => setAboutOpen(false)}>
        <div className="about-card" onClick={(event) => event.stopPropagation()}>
          <header className="settings-header">
            <h3>About Munroe Code</h3>
            <button className="settings-close" onClick={() => setAboutOpen(false)}><X size={14} /></button>
          </header>
          {aboutInfo ? (
            <>
              <div className="settings-row"><label>Product</label><span>{aboutInfo.product}</span></div>
              <div className="settings-row"><label>Desktop</label><span>{aboutInfo.desktop}</span></div>
              <div className="settings-row"><label>Version</label><span>{aboutInfo.version}</span></div>
              <div className="settings-row"><label>Runtime</label><span>{aboutInfo.runtime}</span></div>
              <div className="settings-row"><label>API</label><span>{aboutInfo.api}</span></div>
              <div className="settings-row"><label>Build</label><span>{aboutInfo.buildCommit}</span></div>
              <div className="settings-row"><label>Docs</label><span><a href={aboutInfo.docs}>{aboutInfo.docs}</a></span></div>
              <div className="settings-row"><label>Support</label><span><a href={aboutInfo.support}>{aboutInfo.support}</a></span></div>
            </>
          ) : <p className="settings-hint">Loading…</p>}
        </div>
      </div>}
    </div>
  )
}