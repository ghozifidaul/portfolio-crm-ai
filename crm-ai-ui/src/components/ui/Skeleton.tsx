import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: "text" | "card" | "circle";
  width?: string | number;
  height?: string | number;
}

const shapeStyles = {
  text: "h-4 rounded-md",
  card: "h-24 rounded-xl",
  circle: "rounded-full",
} as const;

export function Skeleton({ shape = "text", width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-800 ${shapeStyles[shape]} ${className ?? ""}`}
      style={{
        width: width ?? (shape === "circle" ? height ?? 32 : "100%"),
        height: height ?? (shape === "circle" ? width ?? 32 : undefined),
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}
