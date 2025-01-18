import { getChatStatic } from '../../chat';

const FINRA_KNOWLEDGE_PROMPT = `You are a FINRA Knowledge Agent. For exam question:
1. Extract relevant rules and concepts for the question
2. Provide context about specific regulations, calculations, and requirements
3. Format response as structured knowledge points
4. Don't answer the question, just provide the knowledge

{input}`;

function formatKnowledgePrompt(messages: string) {
    return FINRA_KNOWLEDGE_PROMPT.replace('{input}', JSON.stringify(messages));
}

export async function getKnowledge(messages: string) {
    const prompt = formatKnowledgePrompt(messages);
    const response = await getChatStatic([{ role: 'user', content: prompt }]);
    const data = await response.json();
    const message = data.message.content;
    return message;
}
