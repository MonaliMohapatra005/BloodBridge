import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, Phone, Lock, HeartHandshake, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(16, 'Phone number is too long'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const prefilledPhone = (location.state as any)?.phone || '';
  const successMessage = (location.state as any)?.successMessage || null;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: prefilledPhone,
      password: '',
    },
  });

  useEffect(() => {
    if (prefilledPhone) {
      setValue('phone', prefilledPhone);
    }
  }, [prefilledPhone, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await login({
        phone: data.phone.trim(),
        password: data.password,
      });
      toast.success('Welcome back to BloodBridge!', 'Authenticated');
      navigate(from, { replace: true });
    } catch (err: any) {
      setServerError(err.message || 'Invalid credentials');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F7F8FA]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Back to Landing Page */}
        <div className="mb-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blood-700 bg-white border border-slate-200/90 rounded-full px-4 py-1.5 shadow-sm transition-all hover:shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>&larr; Back to Home</span>
          </Link>
        </div>

        {/* Brand Logo */}
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blood-700 flex items-center justify-center text-white shadow-lg shadow-blood-700/30">
            <Droplet className="w-7 h-7 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-[#17212B]">
            Blood<span className="text-blood-700">Bridge</span>
          </span>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-[#17212B]">
          Sign in to your emergency account
        </h2>
        <p className="mt-2 text-center text-sm text-[#73808C]">
          Or{' '}
          <Link
            to="/register"
            className="font-semibold text-blood-700 hover:text-blood-800 transition-colors"
          >
            register as a community donor
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card border border-slate-200/90 rounded-3xl">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-blood-700 font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Phone Number"
              placeholder="+919876543210"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              required
              {...register('phone')}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-semibold shadow-md shadow-blood-700/25"
            >
              Sign In
            </Button>
          </form>

          {/* Platform Highlights */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs text-slate-500">
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Continuous GPS</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-50">
              <HeartHandshake className="w-4 h-4 text-blood-700 shrink-0" />
              <span>Direct Coordination</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

