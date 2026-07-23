import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, ChevronDown, Code2, Folder, FolderOpen, Menu, MessageSquarePlus, Send, Settings2, ShieldCheck, Sparkles, Square, TerminalSquare } from 'lucide-react'
import type { Conversation, Message, Project, Usage } from './types'

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto', detail: 'Best available intelligence' },
  { value: 'minimax', label: 'Core', detail: 'Fast, capable, long context' },
  { value: 'kimi', label: 'Kimi', detail: 'Deep coding and reasoning' },
]

export default function App() {
  const [project, setProject] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [model, setModel] = useState('auto')
  const [permissions, setPermissions] = useState('standard')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState<Usage | null>(null)
  const [modelOpen, setModelOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const active = useMemo(() => conversations.find(c => c.id === activeId) ?? null, [conversations, activeId])
  const messages = active?.messages ?? []

  useEffect(() => {
    window.munroe.bootstrap().then(async data => {
      setProject(data.initialProject)
      setProjects(data.projects)
      await loadConversations(data.initialProject)
    }).catch(e => setError(String(e.message || e)))
  }, [])

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages.length, busy])

  async function loadConversations(cwd: string) {
    let rows = await window.munroe.listConversations(cwd)
    if (rows.length === 0) rows = [await window.munroe.newConversation(cwd)]
    setConversations(rows)
    setActiveId(rows[0].id)
  }

  async function chooseProject() {
    const next = await window.munroe.chooseProject()
    if (!next) return
    setProject(next)
    setProjects(await window.munroe.listProjects())
    await loadConversations(next)
  }

  async function newConversation() {
    if (!project) return
    const item = await window.munroe.newConversation(project)
    setConversations(current => [item, ...current])
    setActiveId(item.id)
    setUsage(null)
  }

  async function send() {
    const prompt = draft.trim()
    if (!prompt || !project || !activeId || busy) return
    setDraft('')
    setBusy(true)
    setError('')
    try {
      let updated = await window.munroe.appendMessage(project, activeId, { role: 'user', content: prompt })
      setConversations(current => [updated, ...current.filter(c => c.id !== updated.id)])
      const result = await window.munroe.send({ cwd: project, prompt, model, permissions })
      updated = await window.munroe.appendMessage(project, activeId, { role: 'assistant', content: result.text })
      setConversations(current => [updated, ...current.filter(c => c.id !== updated.id)])
      setUsage(result.usage)
    } catch (e) {
      setError(String((e as Error).message || e))
    } finally {
      setBusy(false)
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }

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

        <div className="section-label">RECENT</div>
        <nav className="conversation-list">
          {conversations.map(item => (
            <button key={item.id} className={item.id === activeId ? 'active' : ''} onClick={() => setActiveId(item.id)}>
              <span>{item.title}</span><small>{new Date(item.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-line"><span className="live-dot" /> Runtime online</div>
          <button><Settings2 size={15} /> Settings</button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="session-title"><Square size={9} fill="#c9a84c" /> {active?.title || 'New conversation'}</div>
          <div className="top-actions">
            <div className="model-control">
              <button onClick={() => setModelOpen(v => !v)}><Sparkles size={14} /> {MODEL_OPTIONS.find(x => x.value === model)?.label}<ChevronDown size={13} /></button>
              {modelOpen && <div className="model-menu">
                {MODEL_OPTIONS.map(option => <button key={option.value} className={option.value === model ? 'selected' : ''} onClick={() => { setModel(option.value); setModelOpen(false) }}>
                  <span><strong>{option.label}</strong><small>{option.detail}</small></span>{option.value === model && <span className="check">✓</span>}
                </button>)}
              </div>}
            </div>
            <select aria-label="Permission mode" value={permissions} onChange={e => setPermissions(e.target.value)}>
              <option value="safe">Safe</option><option value="standard">Standard</option>
            </select>
          </div>
        </header>

        <section className={`chat ${messages.length === 0 ? 'empty' : ''}`}>
          {messages.length === 0 ? <div className="intro">
            <div className="intro-glyph"><Bot size={28} strokeWidth={1.3} /></div>
            <p className="eyebrow">MUNROE CODE</p>
            <h1>What are we building?</h1>
            <p>Ask Munroe to inspect, explain, modify, or verify anything in your project.</p>
            <div className="suggestions">
              <button onClick={() => setDraft('Inspect this project and explain its architecture.')}>Explain this codebase</button>
              <button onClick={() => setDraft('Find the highest-impact bug in this project and propose a fix.')}>Find a bug</button>
              <button onClick={() => setDraft('Run the project verification and fix what fails.')}>Fix failing checks</button>
            </div>
          </div> : <div className="messages">
            {messages.map((message: Message, index) => <article key={`${message.createdAt}-${index}`} className={`message ${message.role}`}>
              <div className="message-meta">{message.role === 'user' ? 'YOU' : 'MUNROE'}</div>
              <div className="message-body">{message.content}</div>
            </article>)}
            {busy && <article className="message assistant working"><div className="message-meta">MUNROE</div><div className="thinking"><i /><i /><i /> Working through the project…</div></article>}
            <div ref={bottomRef} />
          </div>}
        </section>

        <footer className="composer-wrap">
          {error && <div className="error-banner">{error}</div>}
          <div className="composer">
            <textarea value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKeyDown} placeholder="Message Munroe Code…" rows={1} />
            <div className="composer-bottom">
              <div className="context-pills"><span><Folder size={12} />{project.split('/').pop() || 'No project'}</span><span><ShieldCheck size={12} />{permissions}</span></div>
              <button className="send" disabled={!draft.trim() || busy} onClick={send}>{busy ? <Square size={14} /> : <Send size={15} />}</button>
            </div>
          </div>
          <div className="footer-meta"><span><TerminalSquare size={12} /> Munroe can make mistakes. Review changes before shipping.</span>{usage && <span>{usage.total_tokens?.toLocaleString() || 0} tokens · {usage.api_calls || 0} calls</span>}</div>
        </footer>
      </main>
    </div>
  )
}
