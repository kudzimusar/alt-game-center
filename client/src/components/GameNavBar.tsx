import { Link } from "wouter";
import { Home, LayoutGrid } from "lucide-react";

interface GameNavBarProps {
  /** Optional custom className for the nav wrapper */
  className?: string;
  /** Variant: "dark" for dark backgrounds (default), "light" for light */
  variant?: "dark" | "light";
}

/**
 * Consistent top navigation bar used across all game pages.
 * Shows "Dashboard" and "All Games" links so teachers can navigate freely.
 */
export default function GameNavBar({ className = "", variant = "dark" }: GameNavBarProps) {
  const textBase = variant === "dark" ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black";
  const border = variant === "dark" ? "border-white/5 bg-black/20" : "border-black/5 bg-white/60";

  return (
    <div className={`flex items-center gap-4 px-4 py-2.5 border-b backdrop-blur-sm text-sm ${border} ${className}`}>
      <Link href="/dashboard">
        <span className={`flex items-center gap-1.5 font-semibold cursor-pointer transition-colors ${textBase}`}>
          <Home size={14} />
          Dashboard
        </span>
      </Link>
      <span className={variant === "dark" ? "text-white/20" : "text-black/20"}>·</span>
      <Link href="/games">
        <span className={`flex items-center gap-1.5 font-semibold cursor-pointer transition-colors ${textBase}`}>
          <LayoutGrid size={14} />
          All Games
        </span>
      </Link>
    </div>
  );
}
