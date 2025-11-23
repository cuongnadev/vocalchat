"use client";
import { login } from "@/app/api";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/input";
import type { ApiError } from "@/types/api";
import { saveAuth } from "@/utils/auth";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { User, Wrench } from "lucide-react";
import React, { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await login(email, password);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      saveAuth(response.data.token, remember, 168);

      navigate({ to: "/chat" });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Login failed");
    }
  };

  const handleGoRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: "/auth/register" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 bg-white/10 backdrop-blur-2xl px-12 py-10 rounded-3xl shadow-2xl border border-white/20 w-[400px]"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-wide mb-2">
          VocalChat
        </h1>
        <p className="text-violet-200 text-sm">
          Connect. Talk. Feel closer than ever 🎧
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <Input
          label="Email"
          icon={<User width={16} height={16} color="#00FFFF" />}
          iconPosition="left"
          type="email"
          placeholder="your_email@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="third"
          radius="lg"
          required
        />

        <Input
          label="Password"
          icon={<Wrench width={16} height={16} color="#8B5CF6" />}
          iconPosition="left"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="third"
          radius="lg"
          required
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex items-center justify-between text-sm text-gray-300">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-[#00FFFF]"
            />
            Remember me
          </label>
          <a href="#" className="text-[#8B5CF6] hover:underline">
            Forgot password?
          </a>
        </div>

        <Button text="Sign In" className="transition-transform duration-300" />
      </form>

      <div className="text-center mt-8 space-y-1">
        <p className="text-sm text-gray-300">
          Join conversations that matter 💬
        </p>
        <p className="text-xs text-gray-400">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={handleGoRegister}
            className="text-[#8B5CF6] hover:underline"
          >
            Create one now
          </a>
        </p>
      </div>

      <div className="absolute top-4 right-4 w-10 h-10 rounded-tr-lg border-t-2 border-r-2 border-[#00FFFF]"></div>
      <div className="absolute bottom-4 left-4 w-10 h-10 rounded-bl-lg border-b-2 border-l-2 border-[#8B5CF6]"></div>
    </motion.div>
  );
}
