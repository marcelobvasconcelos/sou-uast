'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { BASE_PATH } from '@/lib/api-client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const authBasePath = BASE_PATH ? `${BASE_PATH}/api/auth` : '/api/auth';
  return <SessionProvider basePath={authBasePath}>{children}</SessionProvider>;
}
