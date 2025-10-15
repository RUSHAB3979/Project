"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const LoadingState = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Completing sign in...
      </h2>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  </div>
);

const CallbackHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleAuth = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
          localStorage.setItem('token', token);
          document.cookie = `token=${token}; path=/; max-age=2592000`;
          const redirectPath = localStorage.getItem('loginRedirect') || '/dashboard';
          localStorage.removeItem('loginRedirect');
          window.location.href = redirectPath;
        } else if (error) {
          router.replace(`/login?error=${error}`);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/login?error=callback_error');
      }
    };

    handleAuth();
  }, [router, searchParams, mounted]);

  return <LoadingState />;
};

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CallbackHandler />
    </Suspense>
  );
}