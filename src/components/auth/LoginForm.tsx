'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    setServerSuccess(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      setServerSuccess('Authentication successful! Redirecting...');
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setServerError(err.message || 'A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {serverError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {serverSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-start gap-3 text-sm">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{serverSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              placeholder="e.g. user@yourdomain.com"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
              className="pl-10"
            />
            <Mail size={16} className="absolute left-3.5 top-3 text-slate-400 dark:text-neutral-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Input
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
              className="pl-10"
            />
            <Lock size={16} className="absolute left-3.5 top-3 text-slate-400 dark:text-neutral-500 pointer-events-none" />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full py-3 text-sm font-bold uppercase tracking-wider">
          Sign In to LockReview
        </Button>
      </form>
    </div>
  );
}
