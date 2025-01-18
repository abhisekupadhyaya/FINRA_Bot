import { getChatStatic } from '../../chat';

const FINRA_REASONING_PROMPT = `You are a FINRA Reasoning Agent. For exam question:

{information}

1. Apply the knowledge base to the analyzed question
2. Follow a step-by-step logical process to reach the answer
3. Show all work for calculations
4. Validate answer against FINRA rules
5. Explain why incorrect options are wrong

{input}`;

function formatReasoningPrompt(context: string, messages: string) {
    return FINRA_REASONING_PROMPT.replace('{information}', JSON.stringify(context)).replace('{input}', JSON.stringify(messages));
}

export async function doReasoning(context: string, messages: string) {
    const prompt = formatReasoningPrompt(context, messages);
    const response = await getChatStatic([{ role: 'user', content: prompt }]);
    const data = await response.json();
    const message = data.message.content;
    return message;
}