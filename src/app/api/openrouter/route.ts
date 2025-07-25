import { getOpenRouterAccountInfo } from '@/lib/providers/openrouter';

export const GET = async (req: Request) => {
  try {
    const accountInfo = await getOpenRouterAccountInfo();

    if (!accountInfo) {
      return Response.json(
        {
          message: 'OpenRouter API key not configured or invalid.',
        },
        {
          status: 401,
        },
      );
    }

    return Response.json(
      {
        accountInfo,
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error(
      'An error occurred while fetching OpenRouter account info',
      err,
    );
    return Response.json(
      {
        message: 'An error has occurred while fetching account information.',
      },
      {
        status: 500,
      },
    );
  }
};
