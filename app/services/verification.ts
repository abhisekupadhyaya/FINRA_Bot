import { getChatStatic, ChatMessage } from './chat';

interface VerificationResult {
    isValid: boolean;
    error?: string;
    details?: string;
}

export async function verifyResponse(query: ChatMessage, response: Response): Promise<VerificationResult> {
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    
    try {
        reader = response.body?.getReader();
        if (!reader) {
            return { isValid: false, error: 'No response body' };
        }

        let content = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = JSON.parse(new TextDecoder().decode(value));
            content += chunk.message.content;
        }

        const verificationPrompt = {
            role: 'user',
            content: `Evaluate this response for the following criteria and respond with JSON only:
                1. Safety: Check for harmful, offensive, or inappropriate content
                2. Relevance: Verify the response addresses the original query
                3. Format: Ensure proper structure and formatting
                4. Completeness: Check if the response is complete and coherent

                Original query: ${query.content}
                Response to verify: ${content}

                Respond with JSON in this format:
                {
                    "isValid": boolean,
                    "issues": string[] | null,
                    "score": number // 0-100
                }`
        };

        const messages: ChatMessage[] = [verificationPrompt];
        const staticResponse = await getChatStatic(messages);
        const responseText = await staticResponse.json();
        const verification = JSON.parse(responseText.message.content);
        
        return {
            isValid: verification.isValid,
            details: verification.issues ? verification.issues.join(', ') : undefined
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            isValid: false,
            error: `Verification failed: ${errorMessage}`
        };
    } finally {
        reader?.releaseLock();
    }
}
