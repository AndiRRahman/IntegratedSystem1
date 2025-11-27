'use client';
import { LoginForm } from '@/components/auth/login-form';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    // @ts-ignore
    if (user.role === 'ADMIN') {
        redirect('/admin/dashboard');
    }
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
