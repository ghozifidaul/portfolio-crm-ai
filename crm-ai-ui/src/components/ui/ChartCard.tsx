import type { ReactNode } from "react";
import { Card } from "./Card";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
}

export function ChartCard({ title, children, headerRight, className }: ChartCardProps) {
  return (
    <Card className={`flex flex-col gap-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {headerRight && <div className="text-xs text-zinc-500">{headerRight}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}
