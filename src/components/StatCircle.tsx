import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface StatCircleProps {
  value: number | string;
  label: string;
  icon: LucideIcon;
  colorClass?: string; // Tailwind class for background/text color, e.g., "bg-blue-500 text-blue-50"
  imageSrc?: string; // New prop for image source
}

export function StatCircle({ value, label, icon: Icon, colorClass = "bg-primary/10 text-primary", imageSrc }: StatCircleProps) {
  return (
    <div className="flex flex-col items-center text-center p-2">
      <div
        className={cn(
          "relative w-18 h-18 rounded-full flex items-center justify-center mb-1 overflow-hidden", // Added overflow-hidden
          colorClass
        )}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <Icon className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
        )}
        <span className="text-2xl font-bold absolute z-10">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}