import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  variant?: "glass" | "hairline" | "alert";
}

export function SectionCard({ children, className, variant = "glass" }: SectionCardProps) {
  const variants = {
    glass: "glass-panel rounded-[2rem]",
    hairline: "hairline-panel rounded-[2rem]",
    alert: "rounded-[2rem] border border-rose-200/80 bg-rose-50/60 shadow-inset",
  };

  return <section className={cn(variants[variant], className)}>{children}</section>;
}
