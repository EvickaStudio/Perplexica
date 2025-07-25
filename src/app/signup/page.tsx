'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function register() {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/login?message=Registration successful! Please sign in.');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-black/70 dark:text-white/70 mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Link>
          <h2 className="text-3xl font-medium text-black/90 dark:text-white/90">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Sign up for a new Perplexica account
          </p>
        </div>

        <form
          onSubmit={(e) => (e.preventDefault(), register())}
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-black/90 dark:text-white/90 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className={cn(
                'w-full px-3 py-2 border border-light-200 dark:border-dark-200 rounded-lg',
                'bg-light-secondary dark:bg-dark-secondary text-black/90 dark:text-white/90',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder:text-black/50 dark:placeholder:text-white/50',
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black/90 dark:text-white/90 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Enter your password (min 8 characters)"
              className={cn(
                'w-full px-3 py-2 border border-light-200 dark:border-dark-200 rounded-lg',
                'bg-light-secondary dark:bg-dark-secondary text-black/90 dark:text-white/90',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'placeholder:text-black/50 dark:placeholder:text-white/50',
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-2 px-4 border border-transparent rounded-lg font-medium',
              'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'text-white transition-colors duration-200',
              isLoading && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black/70 dark:text-white/70">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
