import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { getOpenRouterApiKey, getOpenRouterSiteUrl, getOpenRouterAppName } from '../../config';
import logger from '../../utils/logger';

// Interface for models with reasoning support
interface ReasoningModelConfig {
  supportsReasoning: boolean;
  reasoningParameter?: string; // Parameter name used to enable reasoning
}

// Map of model IDs to their reasoning configuration
const modelReasoningConfig: Record<string, ReasoningModelConfig> = {
  'anthropic/claude-3.7-sonnet:thinking': {
    supportsReasoning: true,
    reasoningParameter: 'include_reasoning',
  },
  'deepseek/deepseek-r1': {
    supportsReasoning: true,
  },
};

// Utility function to parse reasoning from model responses
export const parseReasoningFromResponse = (content: string, modelId: string): { reasoning: string | null, answer: string } => {
  const config = modelReasoningConfig[modelId];
  
  if (!config?.supportsReasoning) {
    return { reasoning: null, answer: content };
  }

  // Parse <think>...</think> tags for all reasoning models
  const thinkTagMatch = content.match(/<think>([\s\S]*?)<\/think>([\s\S]*)/);
  if (thinkTagMatch && thinkTagMatch.length >= 3) {
    const reasoning = thinkTagMatch[1].trim();
    const answer = thinkTagMatch[2].trim();
    return { reasoning, answer };
  }

  // Default case - return full content as answer
  return { reasoning: null, answer: content };
};

export const loadOpenRouterChatModels = async () => {
  const openRouterApiKey = getOpenRouterApiKey();

  if (!openRouterApiKey) return {};

  try {
    // Common configuration for OpenRouter
    const openRouterConfig = {
      openAIApiKey: openRouterApiKey,
      temperature: 0.7,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': getOpenRouterSiteUrl(),
          'X-Title': getOpenRouterAppName(),
        },
      },
    };

    // Configure model-specific parameters for reasoning support
    const createModelWithReasoning = (modelId: string, displayName: string) => {
      const config = modelReasoningConfig[modelId] || { supportsReasoning: false };
      
      // Create base model config
      const modelConfig = {
        ...openRouterConfig,
        modelName: modelId,
      };

      return {
        displayName,
        model: new ChatOpenAI(modelConfig),
        supportsReasoning: config.supportsReasoning,
        reasoningConfig: config,
      };
    };

    const chatModels = {
      'anthropic/claude-3-opus': {
        displayName: 'Claude 3 Opus',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'anthropic/claude-3-opus',
        }),
        supportsReasoning: false,
      },
      'anthropic/claude-3-sonnet': {
        displayName: 'Claude 3 Sonnet',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'anthropic/claude-3-sonnet',
        }),
        supportsReasoning: false,
      },
      'anthropic/claude-3.5-sonnet': {
        displayName: 'Claude 3.5 Sonnet',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'anthropic/claude-3.5-sonnet',
        }),
        supportsReasoning: false,
      },
      'anthropic/claude-3.7-sonnet': {
        displayName: 'Claude 3.7 Sonnet',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'anthropic/claude-3.7-sonnet',
        }),
        supportsReasoning: false,
      },
      'anthropic/claude-3.7-sonnet:thinking': createModelWithReasoning(
        'anthropic/claude-3.7-sonnet:thinking',
        'Claude 3.7 Sonnet (thinking)'
      ),
      'openai/gpt-4o': {
        displayName: 'GPT-4o',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'openai/gpt-4o',
        }),
        supportsReasoning: false,
      },
      'openai/gpt-4-turbo': {
        displayName: 'GPT-4 Turbo',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'openai/gpt-4-turbo',
        }),
        supportsReasoning: false,
      },
      'meta-llama/llama-3-70b': {
        displayName: 'Llama 3 70B',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'meta-llama/llama-3-70b',
        }),
        supportsReasoning: false,
      },
      'mistralai/mistral-large': {
        displayName: 'Mistral Large',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'mistralai/mistral-large',
        }),
        supportsReasoning: false,
      },
      'google/gemini-pro': {
        displayName: 'Gemini Pro',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'google/gemini-pro',
        }),
        supportsReasoning: false,
      },
      'google/gemini-2.0-flash-001': {
        displayName: 'Gemini Flash 2.0',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'google/gemini-2.0-flash-001',
        }),
        supportsReasoning: false,
      },
      'deepseek/deepseek-r1': createModelWithReasoning(
        'deepseek/deepseek-r1',
        'DeepSeek R1'
      ),
      'deepseek/deepseek-chat': {
        displayName: 'DeepSeek V3',
        model: new ChatOpenAI({
          ...openRouterConfig,
          modelName: 'deepseek/deepseek-chat',
        }),
        supportsReasoning: false,
      },
    };

    return chatModels;
  } catch (err) {
    logger.error(`Error loading OpenRouter models: ${err}`);
    return {};
  }
};

export const loadOpenRouterEmbeddingsModels = async () => {
  const openRouterApiKey = getOpenRouterApiKey();

  if (!openRouterApiKey) return {};

  try {
    // Common configuration for OpenRouter
    const openRouterConfig = {
      openAIApiKey: openRouterApiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': getOpenRouterSiteUrl(),
          'X-Title': getOpenRouterAppName(),
        },
      },
    };

    const embeddingModels = {
      'openai/text-embedding-3-small': {
        displayName: 'OpenAI Text Embedding 3 Small',
        model: new OpenAIEmbeddings({
          ...openRouterConfig,
          modelName: 'openai/text-embedding-3-small',
        }),
      },
      'openai/text-embedding-3-large': {
        displayName: 'OpenAI Text Embedding 3 Large',
        model: new OpenAIEmbeddings({
          ...openRouterConfig,
          modelName: 'openai/text-embedding-3-large',
        }),
      },
    };

    return embeddingModels;
  } catch (err) {
    logger.error(`Error loading OpenRouter embeddings model: ${err}`);
    return {};
  }
}; 