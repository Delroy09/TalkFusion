
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ApiKeys {
  openai?: string;
  google?: string;
  anthropic?: string;
}

export type ModelType = 'openai' | 'google' | 'anthropic' | 'combined';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  model: ModelType;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}
