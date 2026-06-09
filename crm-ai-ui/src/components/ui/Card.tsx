import { motion, useReducedMotion } from "motion/react";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

const variantStyles = {
  default: "border border-zinc-800 bg-zinc-900",
  elevated: "border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/20",
  ghost: "bg-zinc-900",
} as const;

interface CardProps {
  variant?: keyof typeof variantStyles;
  hover?: boolean;
  className?: string;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps & HTMLAttributes<HTMLDivElement>>(
  ({ variant = "default", hover = false, className, children, ...props }, ref) => {
    const reduce = useReducedMotion();
    const classes = `rounded-xl p-4 ${variantStyles[variant]} ${className ?? ""}`;

    if (hover) {
      return (
        <motion.div
          ref={ref}
          whileHover={reduce ? {} : { y: -2 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={classes}
          {...(props as Record<string, unknown>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
