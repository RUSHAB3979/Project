"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  // Only run the effect after initial mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Callback page mounted state:', mounted);
    if (!mounted) return;

    const handleAuth = async () => {
      try {
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (token) {
          console.log('Token received:', token);
          // Store the token in localStorage and cookie
          localStorage.setItem('token', token);
          document.cookie = `token=${token}; path=/; max-age=2592000`; // 30 days
          // Get redirect path or default to dashboard
          const redirectPath = localStorage.getItem('loginRedirect') || '/dashboard';
          console.log('Redirecting to:', redirectPath);
          localStorage.removeItem('loginRedirect'); // Clean up
          // Force navigation with replace and refresh
          window.location.href = redirectPath;
        } else if (error) {
          console.error('Auth error:', error);
          // Redirect to login with error
          router.replace(`/login?error=${error}`);
        } else {
          console.log('No token or error found in URL');
          // Redirect to login
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/login?error=callback_error');
      }
    };

    handleAuth();
  }, [router, searchParams, mounted]);

  return (
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
}