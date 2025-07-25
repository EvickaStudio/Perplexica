import { useState, useEffect } from 'react';
import { Select as EnhancedSelect } from '@/components/ui/Select';

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

interface OpenRouterProviderSelectorProps {
  modelId: string;
  selectedProvider?: string | null;
  onProviderChange?: (provider: string) => void;
}

const formatPricing = (prompt: string, completion: string) => {
  const promptPrice = parseFloat(prompt);
  const completionPrice = parseFloat(completion);

  if (promptPrice === 0 && completionPrice === 0) {
    return 'Free';
  }

  const formatPricePerMillion = (price: number) => {
    if (price === 0) return 'Free';
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

export const OpenRouterProviderSelector = ({
  modelId,
  selectedProvider,
  onProviderChange,
}: OpenRouterProviderSelectorProps) => {
  const [endpoints, setEndpoints] = useState<OpenRouterEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      if (!modelId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/openrouter/endpoints?modelId=${encodeURIComponent(modelId)}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch endpoints');
        }

        const data = await response.json();
        setEndpoints(data.endpoints || []);

        // Auto-select first available provider if none selected
        if (!selectedProvider && data.endpoints?.length > 0) {
          onProviderChange?.(data.endpoints[0].provider_name);
        }
      } catch (err) {
        setError('Failed to load providers');
        console.error('Error fetching endpoints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoints();
  }, [modelId, selectedProvider, onProviderChange]);

  if (loading) {
    return (
      <div className="flex flex-col space-y-1">
        <p className="text-black/70 dark:text-white/70 text-sm">Provider</p>
        <div className="px-3 py-2 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg text-sm">
          Loading providers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col space-y-1">
        <p className="text-black/70 dark:text-white/70 text-sm">Provider</p>
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (endpoints.length === 0) {
    return null;
  }

  const providerOptions = endpoints.map((endpoint) => {
    const pricing = formatPricing(
      endpoint.pricing.prompt,
      endpoint.pricing.completion,
    );
    const contextLength =
      endpoint.context_length >= 1000
        ? `${(endpoint.context_length / 1000).toFixed(0)}K`
        : endpoint.context_length.toString();

    const uptime =
      endpoint.uptime_last_30m !== null
        ? `${endpoint.uptime_last_30m.toFixed(1)}%`
        : 'N/A';

    const quantization = endpoint.quantization || 'N/A';

    return {
      value: endpoint.provider_name,
      label: `${endpoint.provider_name} | ${pricing} | ${contextLength} ctx | ${uptime} uptime | ${quantization}`,
    };
  });

  return (
    <div className="flex flex-col space-y-1">
      <p className="text-black/70 dark:text-white/70 text-sm">
        Provider (Cost | Context | Uptime | Quantization)
      </p>
      <EnhancedSelect
        value={selectedProvider ?? undefined}
        onChange={(e) => {
          onProviderChange?.(e.target.value);
        }}
        options={providerOptions}
      />
    </div>
  );
};

export default OpenRouterProviderSelector;
