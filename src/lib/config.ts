import toml from '@iarna/toml';

// Use dynamic imports for Node.js modules to prevent client-side errors
let fs: any;
let path: any;
if (typeof window === 'undefined') {
  // We're on the server
  fs = require('fs');
  path = require('path');
}

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  MODELS: {
    OPENAI: {
      API_KEY: string;
    };
    GROQ: {
      API_KEY: string;
    };
    ANTHROPIC: {
      API_KEY: string;
    };
    GEMINI: {
      API_KEY: string;
    };
    OLLAMA: {
      API_URL: string;
    };
    DEEPSEEK: {
      API_KEY: string;
    };
    AIMLAPI: {
      API_KEY: string;
    };
    LM_STUDIO: {
      API_URL: string;
    };
    OPENROUTER: {
      API_KEY: string;
    };
    CUSTOM_OPENAI: {
      API_URL: string;
      API_KEY: string;
      MODEL_NAME: string;
    };
  };
  API_ENDPOINTS: {
    SEARXNG: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const loadConfig = () => {
  // Server-side only
  if (typeof window === 'undefined') {
    try {
      const configPath = path.join(process.cwd(), configFileName);
      
      // Check if file exists before trying to read it
      if (!fs.existsSync(configPath)) {
        console.warn(`Config file not found at ${configPath}. Using default configuration.`);
        return getDefaultConfig();
      }
      
      // Check if path is a directory
      const stats = fs.statSync(configPath);
      if (stats.isDirectory()) {
        console.error(`Path ${configPath} is a directory, not a file. Using default configuration.`);
        return getDefaultConfig();
      }
      
      return toml.parse(
        fs.readFileSync(configPath, 'utf-8'),
      ) as any as Config;
    } catch (error) {
      console.error(`Error loading config file: ${error}. Using default configuration.`);
      return getDefaultConfig();
    }
  }

  // Client-side fallback - settings will be loaded via API
  return {} as Config;
};

const getDefaultConfig = (): Config => {
  return {
    GENERAL: {
      SIMILARITY_MEASURE: "cosine",
      KEEP_ALIVE: "5m"
    },
    MODELS: {
      OPENAI: {
        API_KEY: ""
      },
      GROQ: {
        API_KEY: ""
      },
      ANTHROPIC: {
        API_KEY: ""
      },
      GEMINI: {
        API_KEY: ""
      },
      OLLAMA: {
        API_URL: ""
      },
      DEEPSEEK: {
        API_KEY: ""
      },
      AIMLAPI: {
        API_KEY: ""
      },
      LM_STUDIO: {
        API_URL: ""
      },
      OPENROUTER: {
        API_KEY: ""
      },
      CUSTOM_OPENAI: {
        API_URL: "",
        API_KEY: "",
        MODEL_NAME: ""
      }
    },
    API_ENDPOINTS: {
      SEARXNG: ""
    }
  };
};

export const getSimilarityMeasure = () =>
  loadConfig().GENERAL.SIMILARITY_MEASURE;

export const getKeepAlive = () => loadConfig().GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => loadConfig().MODELS.OPENAI.API_KEY;

export const getGroqApiKey = () => loadConfig().MODELS.GROQ.API_KEY;

export const getAnthropicApiKey = () => loadConfig().MODELS.ANTHROPIC.API_KEY;

export const getGeminiApiKey = () => loadConfig().MODELS.GEMINI.API_KEY;

export const getSearxngApiEndpoint = () =>
  process.env.SEARXNG_API_URL || loadConfig().API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () => loadConfig().MODELS.OLLAMA.API_URL;

export const getDeepseekApiKey = () => loadConfig().MODELS.DEEPSEEK.API_KEY;

export const getAimlApiKey = () => loadConfig().MODELS.AIMLAPI.API_KEY;

export const getCustomOpenaiApiKey = () =>
  loadConfig().MODELS.CUSTOM_OPENAI.API_KEY;

export const getCustomOpenaiApiUrl = () =>
  loadConfig().MODELS.CUSTOM_OPENAI.API_URL;

export const getCustomOpenaiModelName = () =>
  loadConfig().MODELS.CUSTOM_OPENAI.MODEL_NAME;

export const getLMStudioApiEndpoint = () =>
  loadConfig().MODELS.LM_STUDIO.API_URL;

export const getOpenrouterApiKey = () => loadConfig().MODELS.OPENROUTER.API_KEY;

const mergeConfigs = (current: any, update: any): any => {
  if (update === null || update === undefined) {
    return current;
  }

  if (typeof current !== 'object' || current === null) {
    return update;
  }

  const result = { ...current };

  for (const key in update) {
    if (Object.prototype.hasOwnProperty.call(update, key)) {
      const updateValue = update[key];

      if (
        typeof updateValue === 'object' &&
        updateValue !== null &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = mergeConfigs(result[key], updateValue);
      } else if (updateValue !== undefined) {
        result[key] = updateValue;
      }
    }
  }

  return result;
};

export const updateConfig = (config: RecursivePartial<Config>) => {
  // Server-side only
  if (typeof window === 'undefined') {
    const currentConfig = loadConfig();
    const mergedConfig = mergeConfigs(currentConfig, config);
    fs.writeFileSync(
      path.join(path.join(process.cwd(), `${configFileName}`)),
      toml.stringify(mergedConfig),
    );
  }
};
