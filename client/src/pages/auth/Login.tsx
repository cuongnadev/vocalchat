'use client';
import { Button } from '@/components/ui/button/Button';
import SplashCursor from '@/components/ui/splashcursor/SplashCursor';
import { motion } from 'framer-motion';
import { User, Wrench } from 'lucide-react';

export default function Login() {
    return (
        <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a001f] via-[#10002b] to-[#1b0038] overflow-hidden">
            {/* Hiệu ứng nền */}
            <SplashCursor />

            {/* Hiệu ứng ánh sáng */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
            </div>

            {/* Form đăng nhập */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 bg-white/10 backdrop-blur-2xl px-12 py-10 rounded-3xl shadow-2xl border border-white/20 w-[400px]"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white tracking-wide mb-2">VocalChat</h1>
                    <p className="text-violet-200 text-sm">Connect. Talk. Feel closer than ever 🎧</p>
                </div>

                <form className="flex flex-col space-y-6">
                    <div className="flex flex-col text-left">
                        <label className="flex items-center gap-1 text-gray-300 mb-2 text-sm"><User width={16} height={16} color='#00FFFF'/>  Email or Username</label>
                        <input
                            type="text"
                            placeholder="you@example.com"
                            className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 placeholder-gray-400 text-white focus:outline-none focus:ring-4 focus:ring-[#00FFFF] transition-all duration-300"
                        />
                    </div>

                    <div className="flex flex-col text-left">
                        <label className="flex items-center gap-1 text-gray-300 mb-2 text-sm"><Wrench width={16} height={16} color='#8B5CF6'/> Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 placeholder-gray-400 text-white focus:outline-none focus:ring-4 focus:ring-[#8B5CF6] transition-all duration-300"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-300 mt-2">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="accent-[#00FFFF]" />
                            Remember me
                        </label>
                        <a href="#" className="text-[#8B5CF6] hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    <Button
                        text="Sign In"
                        className="mt-4 hover:scale-[1.03] transition-transform duration-300"
                    />
                </form>

                <div className="text-center mt-8 space-y-1">
                    <p className="text-sm text-gray-300">Join conversations that matter 💬</p>
                    <p className="text-xs text-gray-400">
                        Don’t have an account?{' '}
                        <a href="#" className="text-[#8B5CF6] hover:underline">
                            Create one now
                        </a>
                    </p>
                </div>

                <div className='absolute top-4 right-4 w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-[#00FFFF]'></div>
                <div className='absolute bottom-4 left-4 w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-[#8B5CF6]'></div>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                © 2025 VocalChat — Let’s talk, anywhere.
            </div>
        </div>
    );
}
