import { forwardRef, type ButtonHTMLAttributes } from "react";

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-600/50",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-900 disabled:bg-zinc-800/50",
  ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 active:bg-zinc-900 disabled:text-zinc-500",
  danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700 disabled:bg-red-600/50",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
}

const spinner = (
  <svg
    className="h-4 w-4 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      className="opacity-75"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, className, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-150
        active:scale-[0.97]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        disabled:pointer-events-none disabled:opacity-50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className ?? ""}
      `}
      {...props}
    >
      {loading && spinner}
      {children}
    </button>
  ),
);

Button.displayName = "Button";
