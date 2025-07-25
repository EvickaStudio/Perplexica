import { fetchOpenRouterModelEndpoints } from '@/lib/providers/openrouter';
import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');

    if (!modelId) {
      return Response.json({ error: 'Model ID is required' }, { status: 400 });
    }

    const endpoints = await fetchOpenRouterModelEndpoints(modelId);

    if (!endpoints) {
      return Response.json(
        { error: 'Failed to fetch model endpoints' },
        { status: 500 },
      );
    }

    return Response.json({ endpoints });
  } catch (error) {
    console.error('Error in OpenRouter endpoints API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
