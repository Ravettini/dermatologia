import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "success" | "danger" | "warning" | "ghost" | "neutral";

const variants: Record<Variant, string> = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 shadow-sm",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
  ghost: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
  neutral: "bg-slate-700 text-white hover:bg-slate-800",
};

export function AdminButton({
  children,
  variant = "primary",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
