import { createErrorResponse } from '@/app/api/errorResponse';
import { AgentRuntime, ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';
import { getTracePayload } from '@/utils/trace';

import { checkAuth } from '../../middleware/auth';
import { createTraceOptions, initAgentRuntimeWithUserPayload } from '../agentRuntime';

export const runtime = 'edge';

export const POST = checkAuth(async (req: Request, { params, jwtPayload, createRuntime }) => {
  const { provider } = params;

  try {
    // ============  1. init chat model   ============ //
    let agentRuntime: AgentRuntime;
    if (createRuntime) {
      agentRuntime = createRuntime(jwtPayload);
    } else {
      agentRuntime = await initAgentRuntimeWithUserPayload(provider, jwtPayload);
    }

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as ChatStreamPayload;

    const tracePayload = getTracePayload(req);

    let traceOptions = {};
    // If user enable trace
    if (tracePayload?.enabled) {
      traceOptions = createTraceOptions(data, {
        provider,
        trace: tracePayload,
      });
    }

    // jwtPayload here stands for the X-lobe-chat-auth header
    // jwtPayload.userId is just a random uuid in browser's IndexDB, not the keycloak user id.
    // jwtPayload.sub is the keycloak (or other provider's) user id
    // see src/services/_auth.ts function createAuthTokenWithPayload for details
    
    // user here stands for the "user" field in post request to OpenAI endpoint, which will be recognised as litellm end-user(=customer) id
    return await agentRuntime.chat(data, { user: jwtPayload.sub, ...traceOptions });
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;
    // track the error at server side
    console.error(`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
