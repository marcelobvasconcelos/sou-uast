import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'Painel Administrativo | SOU+UAST',
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/admin');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
