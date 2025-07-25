'use client';
import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function RegistrationToggle() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRegistrationStatus();
  }, []);

  const fetchRegistrationStatus = async () => {
    try {
      const response = await fetch('/api/settings/registration');
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.registrationOpen);
      }
    } catch (error) {
      console.error('Failed to fetch registration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRegistration = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationOpen: enabled }),
      });

      if (response.ok) {
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error('Failed to update registration status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-light-secondary dark:bg-dark-secondary rounded-lg hover:bg-light-200 dark:hover:bg-dark-200 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-light-200 dark:bg-dark-200 rounded-lg">
          <svg
            className="w-4 h-4 text-black/70 dark:text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-black/90 dark:text-white/90 font-medium">
            User Registration
          </p>
          <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
            Allow new users to create accounts
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {isSaving && (
          <Loader2
            size={16}
            className="animate-spin text-black/70 dark:text-white/70"
          />
        )}
        <Switch
          checked={isEnabled}
          onChange={toggleRegistration}
          disabled={isSaving}
          className={cn(
            isEnabled ? 'bg-blue-600' : 'bg-light-200 dark:bg-dark-200',
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50',
          )}
        >
          <span
            className={cn(
              isEnabled ? 'translate-x-6' : 'translate-x-1',
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            )}
          />
        </Switch>
      </div>
    </div>
  );
}
