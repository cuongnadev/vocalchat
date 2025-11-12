'use client';
import { Button } from '@/components/ui/button/Button';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { User } from 'lucide-react';

export default function ProfileInfo() {
    const navigate = useNavigate();
    const { phone } = useSearch({ from: '/auth/register/profile-info' });
    const [name, setName] = useState('');

    const handleFinish = (e: React.FormEvent) => {
        e.preventDefault();

        // handle complete register

        navigate({ to: '/auth/login' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-white/10 backdrop-blur-2xl px-12 py-10 rounded-3xl shadow-2xl border border-white/20 w-[400px]"
        >
            <h1 className="text-2xl font-bold text-white text-center mb-6">Set Up Profile</h1>

            <form onSubmit={handleFinish} className="flex flex-col space-y-6">
                <div>
                    <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm">
                        <User width={16} height={16} color="#00FFFF" /> Display name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Alex Nguyen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-5 py-3 rounded-xl bg-white/15 border border-white/30 placeholder-gray-400 text-white focus:outline-none focus:ring-4 focus:ring-[#00FFFF] transition-all"
                    />
                </div>

                <Button text="Finish" className="mt-4" />
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
                Phone number: <span className="text-[#00FFFF]">{phone}</span>
            </p>

            <div className="absolute top-4 right-4 w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-[#00FFFF]" />
            <div className="absolute bottom-4 left-4 w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-[#8B5CF6]" />
        </motion.div>
    );
}
