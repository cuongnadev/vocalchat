import React from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

type InputProps = {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "third";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Input = ({
  label,
  placeholder,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "md",
  radius = "md",
  loading = false,
  disabled = false,
  error,
  type = "text",
  className,
  value,
  onChange,
}: InputProps) => {
  const baseStyles =
    "w-full flex items-center gap-2 transition-all duration-200";

  const sizeStyles = {
    sm: "text-sm px-3 py-2",
    md: "text-base px-4 py-2",
    lg: "text-lg px-5 py-3",
  }[size];

  const radiusStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[radius];

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-[#8B5CF6]
      text-white placeholder-white/60
      shadow-lg shadow-pink-500/30
      focus:ring-2 focus:ring-white/40
    `,
    secondary: `
      bg-gradient-to-r from-gray-600 to-gray-700
      text-white placeholder-gray-300
      shadow-md shadow-black/20
      focus:ring-2 focus:ring-gray-300
    `,
    third: `
      bg-white 
      text-gray-800 
      shadow-sm
      hover:shadow-md
      focus:outline-none
      focus:ring-2 focus:ring-purple-400/40 
      focus:shadow-lg
      transition-all duration-200
    `,
  }[variant];

  const inputClasses = clsx(
    baseStyles,
    sizeStyles,
    radiusStyles,
    variantStyles,
    (disabled || loading) && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-white/90 font-medium">{label}</label>}

      <div className={inputClasses}>
        {icon && iconPosition === "left" && (
          <span className="opacity-80">{icon}</span>
        )}

        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={clsx(
              "bg-transparent outline-none flex-1",
              variant === "third"
                ? "placeholder-gray-400"
                : "placeholder-white/50"
            )}
          />
        )}

        {icon && iconPosition === "right" && (
          <span className="opacity-80">{icon}</span>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};
