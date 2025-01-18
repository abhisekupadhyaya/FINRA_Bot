import { getChatStatic } from '../../chat';

const FINRA_ANALYSIS_PROMPT = `You are a FINRA Analysis Agent. For each exam question:
knowledge: 
{knowledge}

To do:
1. Break down the question into key components
2. Identify the specific knowledge domains being tested
3. Determine what type of reasoning is required (calculation, rule application, scenario analysis)
4. Output a structured analysis plan

Question:
{input}`;


function formatAnalysisPrompt(knowledge: string, messages: string): string {
    return FINRA_ANALYSIS_PROMPT.replace('{knowledge}', JSON.stringify(knowledge)).replace('{input}', JSON.stringify(messages));
}

export async function analyzeQuestion(knowledge: string, messages: string) {
    const prompt = formatAnalysisPrompt(knowledge, messages);
    const response = await getChatStatic([{ role: 'user', content: prompt }]);
    const data = await response.json();
    const message = data.message.content;
    return message;
}