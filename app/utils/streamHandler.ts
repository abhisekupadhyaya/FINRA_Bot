export interface StreamMessage {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }
  
  export async function handleStream(
    response: Response,
    writer: WritableStreamDefaultWriter<Uint8Array>,
    encoder: TextEncoder,
    decoder: TextDecoder
  ) {
    const reader = response.body?.getReader();
    if (!reader) return;
  
    let currentMessage = '';
  
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              currentMessage += json.message.content;
              
              const message: StreamMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: currentMessage,
                createdAt: new Date()
              };
              
              const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
              await writer.write(encoder.encode(sseMessage));
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
      await writer.close();
    }
  }
  