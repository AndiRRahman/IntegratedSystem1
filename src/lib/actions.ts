'use server';

import { z } from 'zod';
import { users } from '@/lib/data';
import { setSession, clearSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});


export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid email or password.',
    };
  }

  const { email, password } = validatedFields.data;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return {
      error: 'Invalid email or password.',
    };
  }
  
  await setSession(user.id);
  
  if(user.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  redirect('/');
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    // A real app would provide more detailed error messages.
    return {
      error: 'Invalid registration details. Please check your inputs.',
    };
  }
  // In a real app, you would create a new user in the database.
  // Here we just simulate success.
  const newUser = { id: (users.length + 1).toString(), ...validatedFields.data, role: 'USER' as const };
  
  // For this demo, we'll log in the first user upon any successful registration.
  await setSession(users[0].id);
  
  redirect('/');
}


export async function logout() {
  await clearSession();
  redirect('/login');
}
