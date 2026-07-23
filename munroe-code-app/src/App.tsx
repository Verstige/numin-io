import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, ChevronDown, Code2, Folder, FolderOpen, GitBranch, Menu, MessageSquarePlus, RotateCcw, Save, Send, Settings2, ShieldCheck, Sparkles, Square, TerminalSquare, X } from 'lucide-react'
import type { Checkpoint, Conversation, Message, Project, ProjectStatus, ThreadSummary, TurnEvent, Usage } from './types'

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
]

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
  const bottomRef = useRef<HTMLDivElement>(null)

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
    }).catch(e => setError(String(e.message || e)))
  }, [])

  useEffect(() => {
    const unsubscribe = window.munroe.onTurnEvent((event) => {
      if (event.type === 'turnStarted') {
        setActiveTurnId(event.turnId)
        setBusy(true)
        setError('')
        setStreamItems([])
        return
      }
      if (event.type === 'turnCompleted') {
        setBusy(false)
        setActiveTurnId(null)
        return
      }
      if (event.type === 'turnFailed') {
        setBusy(false)
        setActiveTurnId(null)
        setError(event.message)
        setStreamItems((items) => [...items, { kind: 'error', message: event.message }])
        return
      }
      if (event.type === 'turnInterrupted') {
        setBusy(false)
        setActiveTurnId(null)
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

  async function loadConversations(cwd: string) {
    try {
      const [_, projectStatus] = await Promise.all([
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
    } catch {
      setStatus({ model: 'auto', permissions: 'standard', modelLabel: 'Not configured', modelAccessConfigured: false, envLayers: [], runtime: 'missing' })
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
    if (!prompt || !project || busy) return
    setDraft('')
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
    let updated = await window.munroe.appendMessage(project, activeId!, { role: 'user', content: prompt })
    setConversations((current) => [updated, ...current.filter((c) => c.id !== updated.id)])
    try {
      const result = await window.munroe.startTurn({ cwd: project, prompt, model, permissions })
      const finalMessage = await window.munroe.appendMessage(project, activeId!, { role: 'assistant', content: '' })
      void result
      void finalMessage
    } catch (e) {
      setBusy(false)
      setActiveTurnId(null)
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

        <div className="sidebar-bottom">
          <div className="status-line"><span className={status?.runtime === 'available' ? 'live-dot' : 'live-dot offline'} /> {runtimeLabel}</div>
          <button onClick={() => setSettingsOpen((v) => !v)}><Settings2 size={15} /> Settings</button>
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
          <div className="composer">
            <textarea value={draft} onChange={e => { setDraft(e.target.value); setSlashQuery(e.target.value) }} onKeyDown={onKeyDown} placeholder={slashOpen ? 'Pick a slash command' : 'Message Munroe Code — type / for commands'} rows={1} />
            <div className="composer-bottom">
              <div className="context-pills"><span><Folder size={12} />{project.split('/').pop() || 'No project'}</span><span><ShieldCheck size={12} />{permissionsLabel}</span></div>
              <button className="send" disabled={!draft.trim() || busy || status?.runtime !== 'available'} onClick={send}>{busy ? <Square size={14} /> : <Send size={15} />}</button>
            </div>
          </div>
          <div className="footer-meta">
            <span><TerminalSquare size={12} /> Munroe can make mistakes. Review changes before shipping. {envSummary ? `· ${envSummary}` : ''}</span>
            {usage && <span>{usage.total_tokens?.toLocaleString() || 0} tokens · {usage.api_calls || 0} calls</span>}
          </div>
        </footer>
      </main>
    </div>
  )
}