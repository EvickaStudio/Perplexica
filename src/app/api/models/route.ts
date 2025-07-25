import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';

export const GET = async (req: Request) => {
  try {
    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    Object.keys(chatModelProviders).forEach((provider) => {
      Object.keys(chatModelProviders[provider]).forEach((model) => {
        delete (chatModelProviders[provider][model] as { model?: unknown })
          .model;
      });
    });

    Object.keys(embeddingModelProviders).forEach((provider) => {
      Object.keys(embeddingModelProviders[provider]).forEach((model) => {
        delete (embeddingModelProviders[provider][model] as { model?: unknown })
          .model;
      });
    });

    return Response.json(
      {
        chatModelProviders,
        embeddingModelProviders,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('An error occurred while fetching models', err);
    
    // Provide more specific error information
    let errorMessage = 'An error has occurred while loading models.';
    if (err instanceof Error) {
      if (err.message.includes('EISDIR')) {
        errorMessage = 'Configuration file error: Expected a file but found a directory. Please check your config.toml file.';
      } else if (err.message.includes('ENOENT')) {
        errorMessage = 'Configuration file not found. Please ensure config.toml exists in the application directory.';
      } else {
        errorMessage = `Configuration error: ${err.message}`;
      }
    }
    
    return Response.json(
      {
        message: errorMessage,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      {
        status: 500,
      },
    );
  }
};
