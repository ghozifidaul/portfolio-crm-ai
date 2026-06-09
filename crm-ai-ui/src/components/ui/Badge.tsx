import { type HTMLAttributes } from "react";

const variantStyles = {
  urgent: "bg-red-500/15 text-red-400",
  high: "bg-orange-500/15 text-orange-400",
  medium: "bg-yellow-500/15 text-yellow-400",
  low: "bg-zinc-500/15 text-zinc-400",
  default: "bg-zinc-700/30 text-zinc-300",
} as const;

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

export function Badge({ variant = "default", size = "md", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium leading-none tracking-wide
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className ?? ""}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
