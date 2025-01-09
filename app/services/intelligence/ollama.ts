interface ChatMessage {
  role: string;
  content: string;
}

export async function streamLLaMa(messages: ChatMessage[]) {
  return fetch('http://ollama:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.2:3b',
      messages: messages,
      stream: true,
    }),
  });
}

export async function staticLLaMa(messages: ChatMessage[]) {
  return fetch('http://ollama:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.2:3b',
      messages: messages,
      stream: false,
    }),
  });
}
  