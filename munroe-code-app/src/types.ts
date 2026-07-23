export type Message = { role: 'user' | 'assistant'; content: string; createdAt?: string }
export type Conversation = { id: string; title: string; createdAt: string; updatedAt: string; messages: Message[] }
export type Project = { path: string; name: string; sessionName: string; openedAt: string }
export type Usage = { total_tokens?: number; estimated_cost_usd?: number; api_calls?: number }

export interface MunroeBridge {
  bootstrap(): Promise<{ initialProject: string; projects: Project[] }>
  chooseProject(): Promise<string | null>
  listProjects(): Promise<Project[]>
  listConversations(cwd: string): Promise<Conversation[]>
  newConversation(cwd: string): Promise<Conversation>
  appendMessage(cwd: string, id: string, message: Message): Promise<Conversation>
  send(payload: { cwd: string; prompt: string; model: string; permissions: string }): Promise<{ text: string; usage: Usage | null }>
}

declare global { interface Window { munroe: MunroeBridge } }
