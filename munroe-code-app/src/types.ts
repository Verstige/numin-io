export type Message = { role: 'user' | 'assistant'; content: string; createdAt?: string }
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; messages: Message[] }
export type Project = { path: string; name: string; sessionName: string; openedAt: string }
export type Usage = { total_tokens?: number; estimated_cost_usd?: number; api_calls?: number }
export type ProjectConfig = {
  model: 'auto' | 'minimax' | 'kimi'
  permissions: 'safe' | 'standard' | 'trusted'
  workspaceFolders?: string[]
  version?: number
}
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
export type CronJob = {
  id: string
  status: string
  name: string
  schedule: string
  nextRun: string
  lastRun: string
  lastStatus: string
  mode: string
  script: string
}
export type CronStatus = { running: boolean; message: string }
export type Attachment = { path: string; name: string }
export type About = {
  product: string
  version: string
  desktop: string
  runtime: string
  api: string
  buildCommit: string
  docs: string
  support: string
}
export type MemoryFile = { path: string; name: string; bytes: number; updatedAt: string }
export type MemoryStatus = { ok: boolean; message: string; files: MemoryFile[] }
export type ProfileInfo = { name: string; active?: boolean; label: string }
export type ComputerUseStatus = { ok: boolean; installed: boolean; message: string }
export type McpServer = {
  name: string
  transport: string
  tools: string
  status: string
  enabled: boolean
  source: string
}
export type McpCatalogEntry = {
  name: string
  status: string
  description: string
  installed: boolean
  available: boolean
  source: string
}
export type CredentialKeyStatus = {
  key: string
  configured: boolean
  source: 'munroe-env' | 'shell' | 'none'
  masked: string
}
export type CredentialProviderStatus = {
  id: string
  label: string
  detail: string
  modelPolicy: string
  configured: boolean
  source: 'munroe-env' | 'shell' | 'none'
  primaryKey: string
  masked: string
  keys: CredentialKeyStatus[]
}
export type CredentialsStatus = {
  path: string
  providers: CredentialProviderStatus[]
  configuredCount: number
}

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
  startTurn(payload: { cwd: string; prompt: string; model: string; permissions: 'safe' | 'standard'; images?: string[]; sessionId?: string; conversationId?: string }): Promise<{ turnId: string; conversationId?: string | null }>
  interruptTurn(turnId: string): Promise<{ interrupted: boolean }>
  approveTurn(payload: { turnId: string; approvalId: string; decision: 'approve' | 'reject' | 'always' }): Promise<{ approved: boolean }>
  listThreads(query?: string): Promise<ThreadSummary[]>
  renameThread(id: string, title: string): Promise<boolean>
  deleteThread(id: string): Promise<boolean>
  listCheckpoints(cwd: string): Promise<Checkpoint[]>
  createCheckpoint(cwd: string): Promise<Checkpoint | null>
  rollbackCheckpoint(cwd: string, id: string): Promise<boolean>
  runSlash(command: string, cwd: string): Promise<{ text: string; usage: Usage | null }>
  cronList(): Promise<{ jobs: CronJob[]; status: CronStatus }>
  cronPause(id: string): Promise<boolean>
  cronResume(id: string): Promise<boolean>
  cronRun(id: string): Promise<boolean>
  cronDelete(id: string): Promise<boolean>
  cronCreate(payload: { schedule: string; prompt?: string; name?: string; deliver?: string; workdir?: string }): Promise<{ ok: boolean; message: string }>
  workspaceAdd(cwd: string, folder: string): Promise<{ path: string; config: ProjectConfig }>
  workspaceChoose(cwd: string): Promise<{ path: string; config: ProjectConfig } | null>
  workspaceRemove(cwd: string, folder: string): Promise<{ path: string; config: ProjectConfig }>
  addAttachment(payload: { name: string; data: string; cwd?: string }): Promise<Attachment>
  about(): Promise<About>
  memoryStatus(): Promise<MemoryStatus>
  memoryRead(filePath: string): Promise<{ path: string; content: string }>
  listProfiles(): Promise<{ ok: boolean; profiles: ProfileInfo[]; raw: string }>
  computerUseStatus(): Promise<ComputerUseStatus>
  computerUseDoctor(): Promise<{ ok: boolean; message: string }>
  mcpList(): Promise<{ ok: boolean; servers: McpServer[]; raw: string }>
  mcpCatalog(): Promise<{ ok: boolean; entries: McpCatalogEntry[]; raw: string }>
  mcpAdd(payload: { name: string; url?: string; command?: string; args?: string[] | string; preset?: string; auth?: 'oauth' | 'header'; env?: string[] }): Promise<{ ok: boolean; message: string }>
  mcpInstall(name: string): Promise<{ ok: boolean; message: string }>
  mcpRemove(name: string): Promise<{ ok: boolean; message: string }>
  mcpTest(name: string): Promise<{ ok: boolean; message: string }>
  credentialsList(): Promise<CredentialsStatus>
  credentialsSave(updates: Record<string, string>): Promise<CredentialsStatus>
  credentialsClear(key: string): Promise<CredentialsStatus>
  onTurnEvent(handler: (event: TurnEvent) => void): () => void
}

declare global { interface Window { munroe: MunroeBridge } }