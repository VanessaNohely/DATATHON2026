export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatRequest {
  user_id: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
}
