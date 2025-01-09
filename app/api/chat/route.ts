// chatbot/app/api/chat/route.ts
import { getChatStream } from '@/app/services/chat';
import { handleStream } from '@/app/utils/streamHandler';
import { SSE_HEADERS } from '@/app/constants/headers';
import { verifyResponse } from '@/app/services/verification';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const lastElement = messages[messages.length - 1];
  const response = await getChatStream(messages);
  
  const verificationResult = await verifyResponse(lastElement, response.clone());
  if (!verificationResult.isValid) {
    return new Response(JSON.stringify({ error: verificationResult.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  handleStream(response, writer, encoder, decoder);

  return new Response(readable, {
    headers: SSE_HEADERS,
  });
}
