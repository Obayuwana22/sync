import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
      <div className="max-w-md w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
        <p className="text-sm text-neutral-400">
          We encountered an error verifying your Google sign-in. This can happen if the authentication session expired or was cancelled.
        </p>
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
