"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-text-accent text-bg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
  secondary:
    "bg-surface-2 text-text-primary border border-border-strong hover:border-text-accent disabled:opacity-40",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full rounded-card px-5 py-3.5 font-body text-[15px] font-semibold transition-opacity ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading ? "Working…" : children}
    </button>
  );
}
