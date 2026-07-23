export type Message = { role: 'user' | 'assistant'; content: string; createdAt?: string }
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; messages: Message[] }
export type Project = { path: string; name: string; sessionName: string; openedAt: string }
export type Usage = { total_tokens?: number; estimated_cost_usd?: number; api_calls?: number }
export type ProjectConfig = { model: 'auto' | 'minimax' | 'kimi'; permissions: 'safe' | 'standard' | 'trusted' }
export type ProjectStatus = { model: string; permissions: string; modelLabel: string; modelAccessConfigured: boolean; envLayers: string[]; runtime: 'available' | 'missing' }

export type TurnEvent =
  | { type: 'turnStarted'; turnId: string }
  | { type: 'agentMessageDelta'; delta: string }
  | { type: 'reasoningDelta'; delta: string }
  | { type: 'commandExecBegin'; command: string; toolCallId: string }
  | { type: 'commandExecOutput'; toolCallId: string; stream: 'stdout' | 'stderr'; chunk: string }
  | { type: 'commandExecEnd'; toolCallId: string; status: 'ok' | 'failed' | 'denied'; exitCode?: number }
  | { type: 'fileChange'; path: string; kind: 'created' | 'modified' | 'deleted' }
  | { type: 'webSearch'; query: string }
  | { type: 'mcpToolCall'; server: string; tool: string; status: 'ok' | 'failed' }
  | { type: 'planProposed'; steps: string[] }
  | { type: 'approvalRequested'; kind: 'command' | 'patch'; summary: string; payload: Record<string, unknown>; approvalId: string }
  | { type: 'approvalResolved'; approvalId: string; decision: 'approve' | 'reject' | 'always' }
  | { type: 'usage'; tokens: number; cost: number }
  | { type: 'turnInterrupted' }
  | { type: 'turnCompleted'; text: string; sessionId?: string }
  | { type: 'turnFailed'; message: string }

export type Checkpoint = { id?: string; index?: string; label: string; createdAt?: string }
export type ThreadSummary = { id: string; title?: string; createdAt?: string; updatedAt?: string }

export interface MunroeBridge {
  bootstrap(): Promise<{ initialProject: string; projects: Project[]; error?: { message: string } }>
  chooseProject(): Promise<string | null>
  listProjects(): Promise<Project[]>
  loadProject(cwd: string): Promise<{ path: string; config: ProjectConfig }>
  projectStatus(cwd: string): Promise<ProjectStatus>
  updateProject(cwd: string, updates: { model?: string; permissions?: string }): Promise<{ path: string; config: ProjectConfig }>
  openProject(cwd: string): Promise<{ opened: boolean }>
  listConversations(cwd: string): Promise<Conversation[]>
  newConversation(cwd: string): Promise<Conversation>
  appendMessage(cwd: string, id: string, message: Message): Promise<Conversation>
  deleteConversation(cwd: string, id: string): Promise<Conversation[]>
  renameConversation(cwd: string, id: string, title: string): Promise<Conversation>
  clearConversations(cwd: string): Promise<boolean>
  send(payload: { cwd: string; prompt: string; model: string; permissions: 'safe' | 'standard' }): Promise<{ text: string; usage: Usage | null }>
  startTurn(payload: { cwd: string; prompt: string; model: string; permissions: 'safe' | 'standard'; images?: string[]; sessionId?: string }): Promise<{ turnId: string }>
  interruptTurn(turnId: string): Promise<{ interrupted: boolean }>
  approveTurn(payload: { turnId: string; approvalId: string; decision: 'approve' | 'reject' | 'always' }): Promise<{ approved: boolean }>
  listThreads(query?: string): Promise<ThreadSummary[]>
  renameThread(id: string, title: string): Promise<boolean>
  deleteThread(id: string): Promise<boolean>
  listCheckpoints(cwd: string): Promise<Checkpoint[]>
  createCheckpoint(cwd: string): Promise<Checkpoint | null>
  rollbackCheckpoint(cwd: string, id: string): Promise<boolean>
  runSlash(command: string, cwd: string): Promise<{ text: string; usage: Usage | null }>
  onTurnEvent(handler: (event: TurnEvent) => void): () => void
}

declare global { interface Window { munroe: MunroeBridge } }