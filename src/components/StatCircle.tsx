import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface StatCircleProps {
  value: number | string;
  label: string;
  icon: LucideIcon;
  colorClass?: string; // Tailwind class for background/text color, e.g., "bg-blue-500 text-blue-50"
}

export function StatCircle({ value, label, icon: Icon, colorClass = "bg-primary/10 text-primary" }: StatCircleProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div
        className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center mb-2",
          colorClass
        )}
      >
        <Icon className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        <span className="text-3xl font-bold relative z-10">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}