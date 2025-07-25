'use client';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Trash2, Copy, Check } from 'lucide-react';

interface ApiKey {
  id: number;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeySection() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewKeyValue(data.key);
        setNewKeyName('');
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (id: number) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-black/90 dark:text-white/90">
          API Keys
        </h3>
        <button
          onClick={() => setNewKeyValue(null)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          <Plus size={16} />
          <span>New API Key</span>
        </button>
      </div>

      {/* New API Key Form */}
      {newKeyValue === null && (
        <div className="flex items-center space-x-2 p-3 bg-light-secondary dark:bg-dark-secondary rounded-lg">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="API Key name"
            className="flex-1 px-3 py-1.5 bg-transparent border border-light-200 dark:border-dark-200 rounded text-sm text-black/90 dark:text-white/90 placeholder:text-black/50 dark:placeholder:text-white/50"
          />
          <button
            onClick={createApiKey}
            disabled={isCreating || !newKeyName.trim()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
          >
            {isCreating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              'Create'
            )}
          </button>
        </div>
      )}

      {/* Display Newly Created Key */}
      {newKeyValue && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            API Key created successfully! Copy it now - you won&apos;t be able
            to see it again.
          </p>
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded text-sm font-mono text-green-800 dark:text-green-200">
              {newKeyValue}
            </code>
            <button
              onClick={() => copyToClipboard(newKeyValue, -1)}
              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              {copiedId === -1 ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="space-y-2">
        {apiKeys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between p-3 bg-light-secondary dark:bg-dark-secondary rounded-lg"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-black/90 dark:text-white/90">
                {key.name}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60">
                Created: {new Date(key.createdAt).toLocaleDateString()}
                {key.lastUsed &&
                  ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
              </p>
            </div>
            <button
              onClick={() => deleteApiKey(key.id)}
              className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {apiKeys.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60 text-center py-4">
            No API keys created yet
          </p>
        )}
      </div>
    </div>
  );
}
