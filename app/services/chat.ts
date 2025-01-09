import { streamLLaMa, staticLLaMa } from './intelligence/ollama'
export interface ChatMessage {
    role: string;
    content: string;
  }
  
  export async function getChatStream(messages: ChatMessage[]) {
    return streamLLaMa(messages);
  }

  export async function getChatStatic(messages: ChatMessage[]) {
    return staticLLaMa(messages);
  }
  