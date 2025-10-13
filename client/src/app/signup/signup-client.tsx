
"use client";

import dynamic from 'next/dynamic';

const SignupForm = dynamic(() => import('./signup-form'), { ssr: false });

const SignupClient = () => {
  return <SignupForm />;
};

export default SignupClient;
