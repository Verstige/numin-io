export type Message = { role: 'user' | 'assistant'; content: string; createdAt?: string }
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; messages: Message[] }
export type Project = { path: string; name: string; sessionName: string; openedAt: string }
export type Usage = { total_tokens?: number; estimated_cost_usd?: number; api_calls?: number }
export type ProjectConfig = { model: 'auto' | 'minimax' | 'kimi'; permissions: 'safe' | 'standard' | 'trusted' }
export type ProjectStatus = { model: string; permissions: string; modelLabel: string; modelAccessConfigured: boolean; envLayers: string[]; runtime: 'available' | 'missing' }

export interface MunroeBridge {
  bootstrap(): Promise<{ initialProject: string; projects: Project[] }>
  chooseProject(): Promise<string | null>
  listProjects(): Promise<Project[]>
  loadProject(cwd: string): Promise<{ path: string; config: ProjectConfig }>
  projectStatus(cwd: string): Promise<ProjectStatus>
  listConversations(cwd: string): Promise<Conversation[]>
  newConversation(cwd: string): Promise<Conversation>
  appendMessage(cwd: string, id: string, message: Message): Promise<Conversation>
  send(payload: { cwd: string; prompt: string; model: string; permissions: 'safe' | 'standard' }): Promise<{ text: string; usage: Usage | null }>
}

declare global { interface Window { munroe: MunroeBridge } }
