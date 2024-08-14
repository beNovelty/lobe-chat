import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  chatCompletion: {
    // need to disable this option so that lobechat will pass "user" field to OpenAI
    noUserId: false
  },
  provider: ModelProvider.OpenAI,
});
