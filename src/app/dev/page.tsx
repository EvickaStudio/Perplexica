'use client';
import { useState, useEffect } from 'react';
import { Loader2, Terminal, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProtectedPage from '@/components/ProtectedPage';

export default function DevPage() {
  const [query, setQuery] = useState('What is the meaning of life?');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [curlCommand, setCurlCommand] = useState('');
  const [endpoint, setEndpoint] = useState('search-with-ai');

  useEffect(() => {
    const data = { query, focusMode: 'webSearch' };
    const command = `curl -X POST ${window.location.origin}/api/${endpoint} \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '${JSON.stringify(data, null, 2)}'`;
    setCurlCommand(command);
  }, [query, endpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          query,
          focusMode: 'webSearch',
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const errorData = await res.json();
        setResponse(JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      setResponse('Failed to fetch. Please check your network and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="flex h-screen bg-light-primary dark:bg-dark-primary text-black dark:text-white">
        <div className="w-1/2 flex flex-col p-8 border-r border-light-200 dark:border-dark-200">
          <div className="flex items-center space-x-2 mb-4">
            <Terminal size={28} />
            <h1 className="text-3xl font-medium">API Playground</h1>
          </div>
          <p className="text-black/70 dark:text-white/70 mb-6">
            Test the Perplexica search API directly from your browser.
          </p>
          <div className="mb-4">
            <label
              htmlFor="endpoint"
              className="block text-sm font-medium text-black/90 dark:text-white/90 mb-2"
            >
              Endpoint
            </label>
            <select
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className={cn(
                'w-full px-3 py-2 border border-light-200 dark:border-dark-200 rounded-lg',
                'bg-light-secondary dark:bg-dark-secondary text-black/90 dark:text-white/90',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              )}
            >
              <option value="search-with-ai">
                /api/search-with-ai (AI Response)
              </option>
              <option value="search">/api/search (Raw Search Results)</option>
            </select>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex-grow flex flex-col"
          >
            <div className="flex-grow">
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-black/90 dark:text-white/90 mb-2"
                >
                  API Key
                </label>
                <input
                  id="apiKey"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className={cn(
                    'w-full px-3 py-2 border border-light-200 dark:border-dark-200 rounded-lg',
                    'bg-light-secondary dark:bg-dark-secondary text-black/90 dark:text-white/90',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'placeholder:text-black/50 dark:placeholder:text-white/50',
                  )}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="query"
                  className="block text-sm font-medium text-black/90 dark:text-white/90 mb-2"
                >
                  Query
                </label>
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={5}
                  className={cn(
                    'w-full px-3 py-2 border border-light-200 dark:border-dark-200 rounded-lg',
                    'bg-light-secondary dark:bg-dark-secondary text-black/90 dark:text-white/90',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'placeholder:text-black/50 dark:placeholder:text-white/50',
                  )}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !apiKey}
              className={cn(
                'w-full py-2 px-4 border border-transparent rounded-lg font-medium flex items-center justify-center space-x-2',
                'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'text-white transition-colors duration-200',
                (isLoading || !apiKey) && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <SendHorizontal size={16} />
              )}
              <span>Send Request</span>
            </button>
          </form>
        </div>
        <div className="w-1/2 flex flex-col bg-light-secondary dark:bg-dark-secondary p-8 overflow-auto">
          <div className="flex-grow flex flex-col">
            <h3 className="text-lg font-medium mb-2">cURL Command</h3>
            <pre className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg border border-light-200 dark:border-dark-200 text-sm overflow-x-auto mb-8">
              <code>{curlCommand}</code>
            </pre>
            <h3 className="text-lg font-medium mb-2">Response</h3>
            <pre className="bg-light-primary dark:bg-dark-primary p-4 rounded-lg border border-light-200 dark:border-dark-200 text-sm overflow-x-auto flex-grow">
              {response || 'API response will be shown here...'}
            </pre>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
