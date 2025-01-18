import { analyzeQuestion } from './reasoning/analysis';
import { getKnowledge } from './reasoning/knowledge';
import { doReasoning } from './reasoning/reasoning';

import { getChatStream } from '../chat';

const ANSWER_GENERATION_PROMPT = `You are a FINRA Question Agent. For exam question:
{Context}
For the above context output only the letter of the correct option followed by a single sentence explaining why for this question
{Question}`;

function formatQuestionPrompt(context: string, question: string) {
    return ANSWER_GENERATION_PROMPT.replace('{Context}', JSON.stringify(context)).replace('{Question}', JSON.stringify(question));
}

export async function processQuestion(messages: string) {
    const knowledge = await getKnowledge(messages);
    const analysis = await analyzeQuestion(knowledge, messages);
    const context = knowledge + '\n' + analysis;
    const reasoning = await doReasoning(context, messages);

    const prompt = formatQuestionPrompt(reasoning, messages);
    return getChatStream([{ role: 'user', content: prompt }]);
}