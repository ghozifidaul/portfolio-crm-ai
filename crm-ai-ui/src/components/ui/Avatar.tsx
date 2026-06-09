import { type HTMLAttributes } from "react";

const sizeStyles = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
} as const;

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: keyof typeof sizeStyles;
  src?: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, size = "md", src, className, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className ?? ""}`}
        {...(props as HTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-zinc-700 font-medium text-zinc-300 ${sizeStyles[size]} ${className ?? ""}`}
      title={name}
      aria-label={name}
      {...props}
    >
      {initials(name)}
    </div>
  );
}
