'use client';
import { verifyOtp } from '@/app/api';
import { Button } from '@/components/ui/button/Button';
import type { ApiError } from '@/types/api';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

export default function VerifyCode() {
    const navigate = useNavigate();
    const { email } = useSearch({ from: "/auth/register/verify-code" });
    const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        const char = val.replace(/\D/g, '').slice(-1);
        if (!char) {
            updateAt(index, '');
            return;
        }

        updateAt(index, char);

        const next = index + 1;
        if (next < inputsRef.current.length) {
            inputsRef.current[next]?.focus();
            inputsRef.current[next]?.select();
        }

    }

    const updateAt = (index: number, char: string) => {
        setCodes((prev) => {
            const next = [...prev];

            next[index] = char;

            return next;
        });
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (codes[index]) {
                updateAt(index, '');
            } else {
                const prev = index - 1;

                if (prev >= 0) {
                    updateAt(prev, '');
                    inputsRef.current[prev]?.focus();
                }
            }
        } else if (e.key === "ArrowLeft") {
            const prev = index - 1;
            if (prev >= 0) inputsRef.current[prev]?.focus();
        } else if (e.key === 'ArrowRight') {
            const next = index + 1;
            if (next < inputsRef.current.length) inputsRef.current[next]?.focus();
        }
    }


    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!paste) return;
        const arr = paste.split('');
        const next = [...codes];
        for (let i = 0; i < 6; i++) {
            next[i] = arr[i] ?? '';
        }

        setCodes(next);

        const firstEmpty = next.findIndex((c) => c === '');
        const focusIndex = firstEmpty === -1 ? 5 : firstEmpty;
        inputsRef.current[focusIndex]?.focus();
        inputsRef.current[focusIndex]?.select();
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = codes.join('');
        if (code.length < 6) {
            setError('Please enter the 6-digit code.');
            return;
        }
        setError(null);

        try {
            const data = await verifyOtp(email, code);

            if (!data.success) throw new Error(data.message);

            navigate({
                to: '/auth/register/profile-info',
                search: { email },
            });
        } catch (err) {
            const apiErr = err as ApiError;
            setError(apiErr.message || 'Verification failed');
        }
    };

    const handleResend = (e: React.MouseEvent) => {
        e.preventDefault();
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-white/10 backdrop-blur-2xl px-8 py-10 rounded-3xl shadow-2xl border border-white/20 w-[440px]"
        >
            <h1 className='text-2xl font-bold text-white text-center mb-4'>Verify Code</h1>
            <p className='text-gray-300 text-center text-sm mb-6'>
                Enter the code we sent to email: <span className="text-[#00FFFF]">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <div className="flex gap-3">
                    {codes.map((c, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                if (!el) return;
                                inputsRef.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={1}
                            value={c}
                            onChange={(e) => handleChange(i, e)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={handlePaste}
                            aria-label={`Digit ${i + 1}`}
                            className="w-14 h-14 rounded-full bg-white/15 border border-white/30 placeholder-gray-400 text-white text-center text-xl font-medium focus:outline-none focus:ring-4 focus:ring-[#00FFFF] transition-all"
                        />
                    ))}
                </div>

                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

                <Button text="Verify" className="w-full mt-4" />
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
                Didn’t receive the code?{' '}
                <a href="#" onClick={handleResend} className="text-[#8B5CF6] hover:underline">
                    Resend
                </a>
            </p>

            <div className="absolute top-4 right-4 w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-[#00FFFF]" />
            <div className="absolute bottom-4 left-4 w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-[#8B5CF6]" />
        </motion.div>
    )
}
