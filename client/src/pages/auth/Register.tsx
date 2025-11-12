'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button/Button';
import { useNavigate } from '@tanstack/react-router';
import { Smartphone, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // handle sent code to phone number

    navigate({
      to: '/auth/register/verify-code',
      search: { phone },
    });
  };

  const handleGoLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: '/auth/login' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative z-10 bg-white/10 backdrop-blur-2xl px-12 py-10 rounded-3xl shadow-2xl border border-white/20 w-[400px]"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-wide mb-2">VocalChat</h1>
        <p className="text-violet-200 text-sm">Create your account and join the vibe 💫</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <div className="flex flex-col text-left">
          <label className="flex items-center gap-1 text-gray-300 mb-2 text-sm">
            <Smartphone width={16} height={16} color="#00FFFF" /> Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g. +84 912 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 placeholder-gray-400 text-white focus:outline-none focus:ring-4 focus:ring-[#00FFFF] transition-all duration-300"
          />
        </div>

        <div className="flex flex-col text-left">
          <label className="flex items-center gap-1 text-gray-300 mb-2 text-sm">
            <Lock width={16} height={16} color="#8B5CF6" /> Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 placeholder-gray-400 text-white focus:outline-none focus:ring-4 focus:ring-[#8B5CF6] transition-all duration-300"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-start gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-[#00FFFF]"
          />
          <span>
            I agree to the{' '}
            <a href="#" className="text-[#8B5CF6] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#8B5CF6] hover:underline">
              Privacy Policy
            </a>
          </span>
        </div>

        <Button
          text="Continue"
          className='transition-transform duration-300'
          disabled={!agreed}
        />
      </form>

      <div className="text-center mt-8 space-y-1">
        <p className="text-sm text-gray-300">Already have an account?</p>
        <p className="text-xs text-gray-400">
          <a
            href="#"
            onClick={handleGoLogin}
            className="text-[#8B5CF6] hover:underline"
          >
            Login now
          </a>
        </p>
      </div>

      <div className="absolute top-4 right-4 w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-[#00FFFF]" />
      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-[#8B5CF6]" />
    </motion.div>
  );
}
