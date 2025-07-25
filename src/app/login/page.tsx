'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (errorParam) {
      setError(getErrorMessage(errorParam));
    }
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  const getErrorMessage = (errorCode: string) => {
    const errors: { [key: string]: string } = {
      CredentialsSignin:
        'Invalid email or password. Please check your credentials and try again.',
      Configuration: 'There is a problem with the server configuration.',
      AccessDenied: 'Access denied. Please contact an administrator.',
      Verification: 'Email verification failed. Please try again.',
      Default: 'An error occurred during sign in. Please try again.',
    };
    return errors[errorCode] || errors.Default;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            Sign In
          </h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Sign in to your Perplexica account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                {message}
              </p>
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
              placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-black/70 dark:text-white/70">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-black/70 dark:text-white/70">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
