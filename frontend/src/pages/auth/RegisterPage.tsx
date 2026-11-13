import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ALL_BLOOD_GROUPS, BloodGroup } from '../../lib/bloodCompatibility';
import { Droplet, User, Phone, Mail, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name cannot exceed 80 characters'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(16, 'Phone number cannot exceed 16 digits')
    .regex(/^[+]?[0-9\s\-]+$/, 'Must contain only digits and optional leading +'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(128, 'Password too long'),
  bloodGroup: z.enum(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as [
    BloodGroup,
    ...BloodGroup[]
  ]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      bloodGroup: 'O+',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      // Clean empty email and trim strings
      const payload = {
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email && data.email.trim() ? data.email.trim() : undefined,
        password: data.password,
        bloodGroup: data.bloodGroup,
      };

      // Register against backend (persists into MongoDB users collection)
      await registerUser(payload);

      // Immediately log in with backend to establish session and socket connection
      try {
        await login({
          phone: payload.phone,
          password: payload.password,
        });

        toast.success(
          'Account created and signed in successfully!',
          'Welcome to BloodBridge'
        );
        navigate('/dashboard', { replace: true });
      } catch {
        // If auto-login fails, redirect to login page with phone pre-filled
        toast.success('Account created successfully! Please sign in.', 'Registration Complete');
        navigate('/login', {
          state: {
            phone: payload.phone,
            successMessage: 'Account created successfully! Please sign in with your password.',
          },
          replace: true,
        });
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed');
      toast.error(err.message || 'Could not complete registration');
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
          Join the Life-Saving Network
        </h2>
        <p className="mt-2 text-center text-sm text-[#73808C]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blood-700 hover:text-blood-800 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card border border-slate-200/90 rounded-3xl">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-blood-700 font-medium space-y-2">
              <p>{serverError}</p>
              {serverError.toLowerCase().includes('already registered') && (
                <Link
                  to="/login"
                  state={{ phone: watch('phone') }}
                  className="inline-flex items-center text-xs font-bold text-blood-700 underline hover:text-blood-800"
                >
                  Click here to sign in with this phone number &rarr;
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Aarav Sharma"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              required
              {...register('fullName')}
            />

            <Input
              label="Phone Number"
              placeholder="+919876543210"
              leftIcon={<Phone className="w-4 h-4" />}
              helperText="Unique mobile number for emergency coordination"
              error={errors.phone?.message}
              required
              {...register('phone')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Blood Group"
                error={errors.bloodGroup?.message}
                required
                {...register('bloodGroup')}
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Select>

              <Input
                label="Email (Optional)"
                placeholder="aarav@example.com"
                type="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              isPassword
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-base font-semibold shadow-md shadow-blood-700/25"
              >
                Create Account & Join
              </Button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              BloodBridge strictly respects privacy. No static address or continuous GPS tracking is required. Location is only checked once upon confirming an emergency response.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
