import axios from 'axios';
import { getOpenRouterApiKey, getOpenRouterSiteUrl, getOpenRouterAppName } from '../config';
import logger from '../utils/logger';
import { parseReasoningFromResponse } from './providers/openrouter';

/**
 * Interface for reasoning-capable model responses
 */
export interface ReasoningResponse {
  answer: string;
  reasoning: string | null;
  modelId: string;
  modelName: string;
}

/**
 * Use a reasoning-capable OpenRouter model directly via the API
 * This bypasses LangChain to directly access model reasoning capabilities
 */
export const useReasoningModel = async (
  modelId: string,
  messages: Array<{ role: string; content: string }>,
  options = { temperature: 0.7 }
): Promise<ReasoningResponse> => {
  try {
    const openRouterApiKey = getOpenRouterApiKey();
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key is not available');
    }

    // Build request configuration
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': getOpenRouterSiteUrl() || 'https://perplexica.app',
        'X-Title': getOpenRouterAppName() || 'Perplexica',
      }
    };

    // Different models use different parameters to enable reasoning
    const additionalParameters: Record<string, any> = {};
    
    // Enable include_reasoning parameter for Claude models with thinking
    if (modelId === 'anthropic/claude-3.7-sonnet:thinking') {
      additionalParameters.include_reasoning = true;
    }

    // Build request body
    const requestBody = {
      model: modelId,
      messages,
      temperature: options.temperature,
      ...additionalParameters
    };

    // Make the API call
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      requestBody,
      config
    );

    // Extract the completion from the response
    const content = response.data.choices[0]?.message?.content || '';
    const modelName = response.data.model || modelId;
    
    // Extract reasoning separately if it's available directly from the API
    const apiReasoning = response.data.choices[0]?.message?.reasoning || null;
    
    // If the API didn't separate the reasoning, use our parser to look for <think> tags
    if (!apiReasoning) {
      const { reasoning, answer } = parseReasoningFromResponse(content, modelId);
      return {
        answer,
        reasoning,
        modelId,
        modelName
      };
    }
    
    // API provided the reasoning directly
    return {
      answer: content,
      reasoning: apiReasoning,
      modelId,
      modelName
    };
  } catch (error) {
    logger.error(`Error using reasoning model: ${error}`);
    throw error;
  }
};

/**
 * Check if a model supports reasoning
 */
export const modelSupportsReasoning = (modelId: string): boolean => {
  const reasoningModels = [
    'anthropic/claude-3.7-sonnet:thinking',
    'deepseek/deepseek-r1'
  ];
  
  return reasoningModels.includes(modelId);
}; 