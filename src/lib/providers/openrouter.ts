import { ChatOpenAI } from '@langchain/openai';
import { getOpenrouterApiKey } from '../config';
import { ChatModel, EmbeddingModel } from '.';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Embeddings } from '@langchain/core/embeddings';

export const PROVIDER_INFO = {
  key: 'openrouter',
  displayName: 'OpenRouter',
};

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  top_provider: {
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface OpenRouterKeyInfo {
  data: {
    label: string;
    usage: number;
    limit: number | null;
    is_free_tier: boolean;
  };
}

interface OpenRouterEndpoint {
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
  };
  provider_name: string;
  supported_parameters: string[];
  quantization: string | null;
  max_completion_tokens: number | null;
  max_prompt_tokens: number | null;
  status: number;
  uptime_last_30m: number | null;
}

interface OpenRouterModelEndpoints {
  data: {
    id: string;
    name: string;
    description: string;
    endpoints: OpenRouterEndpoint[];
  };
}

/**
 * Fetches available models from OpenRouter API
 */
const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  const apiKey = getOpenrouterApiKey();
  if (!apiKey) return [];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: OpenRouterModelsResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return [];
  }
};

/**
 * Fetches model endpoints from OpenRouter API
 */
export const fetchOpenRouterModelEndpoints = async (
  modelId: string,
): Promise<OpenRouterEndpoint[] | null> => {
  const apiKey = getOpenrouterApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://openrouter.ai/api/v1/models/${modelId}/endpoints`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch model endpoints: ${response.status}`);
    }

    const data: OpenRouterModelEndpoints = await response.json();
    return data.data.endpoints || [];
  } catch (error) {
    console.error('Error fetching OpenRouter model endpoints:', error);
    return null;
  }
};

/**
 * Fetches key information including usage and credits
 */
export const fetchOpenRouterKeyInfo = async (): Promise<
  OpenRouterKeyInfo['data'] | null
> => {
  const apiKey = getOpenrouterApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch key info: ${response.status}`);
    }

    const data: OpenRouterKeyInfo = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching OpenRouter key info:', error);
    return null;
  }
};

/**
 * Formats pricing information for display (per million tokens)
 */
const formatPricing = (prompt: string, completion: string): string => {
  const promptPrice = parseFloat(prompt);
  const completionPrice = parseFloat(completion);

  if (promptPrice === 0 && completionPrice === 0) {
    return 'Free';
  }

  const formatPricePerMillion = (price: number) => {
    if (price === 0) return 'Free';
    // The API returns prices per token, convert to per 1M tokens
    const pricePerMillion = price * 1000000;

    if (pricePerMillion >= 1000) {
      return `$${(pricePerMillion / 1000).toFixed(1)}k/1M`;
    } else if (pricePerMillion >= 1) {
      return `$${pricePerMillion.toFixed(0)}/1M`;
    } else if (pricePerMillion >= 0.01) {
      return `$${pricePerMillion.toFixed(2)}/1M`;
    } else {
      return `$${pricePerMillion.toFixed(4)}/1M`;
    }
  };

  const promptFormatted = formatPricePerMillion(promptPrice);
  const completionFormatted = formatPricePerMillion(completionPrice);

  return `${promptFormatted} / ${completionFormatted}`;
};

/**
 * Loads chat models from OpenRouter
 */
export const loadOpenRouterChatModels = async () => {
  const apiKey = getOpenrouterApiKey();
  if (!apiKey) return {};

  try {
    const models = await fetchOpenRouterModels();
    const chatModels: Record<string, ChatModel> = {};

    // Filter for chat models (exclude embedding models)
    const chatModelData = models.filter(
      (model) =>
        model.architecture.modality === 'text->text' &&
        model.architecture.instruct_type !== 'embedding',
    );

    chatModelData.forEach((model) => {
      const pricing = formatPricing(
        model.pricing.prompt,
        model.pricing.completion,
      );

      chatModels[model.id] = {
        displayName: `${model.name} (${pricing})`,
        model: new ChatOpenAI({
          apiKey: apiKey,
          modelName: model.id,
          temperature: 0.7,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': 'https://github.com/EvickaStudio/Perplexica',
              'X-Title': 'Perplexica',
            },
          },
          modelKwargs: {
            reasoning: {
              enabled: true,
            },
          },
        }) as unknown as BaseChatModel,
      };
    });

    return chatModels;
  } catch (err) {
    console.error(`Error loading OpenRouter models: ${err}`);
    return {};
  }
};

/**
 * Loads embedding models from OpenRouter
 */
export const loadOpenRouterEmbeddingModels = async () => {
  const apiKey = getOpenrouterApiKey();
  if (!apiKey) return {};

  try {
    const models = await fetchOpenRouterModels();
    const embeddingModels: Record<string, EmbeddingModel> = {};

    // Filter for embedding models
    const embeddingModelData = models.filter(
      (model) =>
        model.architecture.instruct_type === 'embedding' ||
        model.name.toLowerCase().includes('embedding') ||
        model.architecture.modality === 'text->embedding',
    );

    embeddingModelData.forEach((model) => {
      const pricing = formatPricing(
        model.pricing.prompt,
        model.pricing.completion,
      );

      embeddingModels[model.id] = {
        displayName: `${model.name} (${pricing})`,
        model: new ChatOpenAI({
          apiKey: apiKey,
          modelName: model.id,
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': 'https://github.com/EvickaStudio/Perplexica',
              'X-Title': 'Perplexica',
            },
          },
        }) as unknown as Embeddings,
      };
    });

    return embeddingModels;
  } catch (err) {
    console.error(`Error loading OpenRouter embedding models: ${err}`);
    return {};
  }
};

/**
 * Gets OpenRouter account information including balance and usage
 */
export const getOpenRouterAccountInfo = async () => {
  const keyInfo = await fetchOpenRouterKeyInfo();
  if (!keyInfo) return null;

  return {
    label: keyInfo.label,
    usage: keyInfo.usage,
    limit: keyInfo.limit,
    isFreeTier: keyInfo.is_free_tier,
    remainingBalance: keyInfo.limit ? keyInfo.limit - keyInfo.usage : null,
  };
};
