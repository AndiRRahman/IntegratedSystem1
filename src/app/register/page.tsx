'use client';
import { RegisterForm } from '@/components/auth/register-form';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { user, isUserLoading } = useUser();
  
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    redirect('/');
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
