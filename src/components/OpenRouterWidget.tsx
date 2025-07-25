'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CreditCard, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface OpenRouterAccountInfo {
  label: string;
  usage: number;
  limit: number | null;
  isFreeTier: boolean;
  remainingBalance: number | null;
}

const OpenRouterWidget = () => {
  const [accountInfo, setAccountInfo] = useState<OpenRouterAccountInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/openrouter');

        if (!response.ok) {
          if (response.status === 401) {
            setError('OpenRouter API key not configured');
            return;
          }
          throw new Error('Failed to fetch account information');
        }

        const data = await response.json();
        setAccountInfo(data.accountInfo);
      } catch (err) {
        console.error('Error fetching OpenRouter account info:', err);
        setError('Failed to load account information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200">
        <Loader2 className="w-5 h-5 animate-spin text-black/70 dark:text-white/70" />
        <span className="ml-2 text-sm text-black/70 dark:text-white/70">
          Loading OpenRouter info...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200">
        <AlertCircle className="w-5 h-5 text-orange-500" />
        <span className="ml-2 text-sm text-black/70 dark:text-white/70">
          {error}
        </span>
      </div>
    );
  }

  if (!accountInfo) {
    return null;
  }

  const formatBalance = (balance: number) => {
    return `$${balance.toFixed(2)}`;
  };

  const getUsagePercentage = () => {
    if (!accountInfo.limit) return 0;
    return Math.min((accountInfo.usage / accountInfo.limit) * 100, 100);
  };

  const usagePercentage = getUsagePercentage();
  const isLowBalance =
    accountInfo.remainingBalance !== null && accountInfo.remainingBalance < 5;

  return (
    <div className="p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 text-black/70 dark:text-white/70" />
          <span className="ml-2 text-sm font-medium text-black/90 dark:text-white/90">
            OpenRouter Account
          </span>
        </div>
        {accountInfo.isFreeTier && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
            Free Tier
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-black/60 dark:text-white/60">
            Account
          </span>
          <span className="text-xs text-black/90 dark:text-white/90 font-medium">
            {accountInfo.label}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-black/60 dark:text-white/60">
            Usage
          </span>
          <span className="text-xs text-black/90 dark:text-white/90">
            {formatBalance(accountInfo.usage)}
          </span>
        </div>

        {accountInfo.limit && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-black/60 dark:text-white/60">
                Limit
              </span>
              <span className="text-xs text-black/90 dark:text-white/90">
                {formatBalance(accountInfo.limit)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-black/60 dark:text-white/60">
                Remaining
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isLowBalance
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-black/90 dark:text-white/90',
                )}
              >
                {formatBalance(accountInfo.remainingBalance!)}
              </span>
            </div>

            <div className="w-full bg-light-200 dark:bg-dark-200 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  usagePercentage > 90
                    ? 'bg-red-500'
                    : usagePercentage > 75
                      ? 'bg-orange-500'
                      : 'bg-green-500',
                )}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-black/60 dark:text-white/60">
                Usage
              </span>
              <span className="text-xs text-black/90 dark:text-white/90">
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
          </>
        )}

        {!accountInfo.limit && (
          <div className="flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="ml-2 text-xs text-green-700 dark:text-green-300">
              Unlimited credits
            </span>
          </div>
        )}

        {isLowBalance && accountInfo.limit && (
          <div className="flex items-center p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="ml-2 text-xs text-orange-700 dark:text-orange-300">
              Low balance remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenRouterWidget;
