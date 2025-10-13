
"use client";

import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('./login-form'), { ssr: false });

const LoginClient = () => {
  return <LoginForm />;
};

export default LoginClient;
