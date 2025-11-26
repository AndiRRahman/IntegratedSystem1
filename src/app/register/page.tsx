import { RegisterForm } from '@/components/auth/register-form';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
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
