import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-10 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100
            placeholder:text-zinc-500
            transition-colors duration-150
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-zinc-700"}
            ${className ?? ""}
          `}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-zinc-500">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
