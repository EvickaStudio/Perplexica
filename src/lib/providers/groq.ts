import { ChatOpenAI } from '@langchain/openai';
import { getGroqApiKey } from '../config';
import { ChatModel } from '.';

export const PROVIDER_INFO = {
  key: 'groq',
  displayName: 'Groq',
};

import { BaseChatModel } from '@langchain/core/language_models/chat_models';

export const loadGroqChatModels = async () => {
  const groqApiKey = getGroqApiKey();
  if (!groqApiKey) return {};

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const groqChatModels = (await res.json()).data;
    const chatModels: Record<string, ChatModel> = {};

    groqChatModels.forEach((model: any) => {
      if (model.id.includes('whisper')) return;
      chatModels[model.id] = {
        displayName: model.id,
        model: new ChatOpenAI({
          apiKey: groqApiKey,
          modelName: model.id,
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.groq.com/openai/v1',
          },
          metadata: {
            'model-type': 'groq',
          },
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading Groq models: ${err}`);
    return {};
  }
};
