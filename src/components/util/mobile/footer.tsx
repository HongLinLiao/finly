"use client";

import { ChartCandlestick, HandCoins, House } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const FOOTER_TABS: Array<{
  value: "fund" | "home" | "stock";
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "fund", label: "基金", href: "#", icon: HandCoins },
  { value: "home", label: "首頁", href: "/", icon: House },
  { value: "stock", label: "股票", href: "/stocks", icon: ChartCandlestick },
];

const Footer = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;
      const delta = currentScrollY - previousScrollY;

      if (currentScrollY <= 8) {
        setIsVisible(true);
      } else if (delta > 6) {
        setIsVisible(false);
      } else if (delta < -4) {
        setIsVisible(true);
      }

      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }

      stopTimerRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, 140);

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-[120%] scale-95 opacity-0"
      )}
      style={{ bottom: "max(12px, env(safe-area-inset-bottom))" }}
      aria-label="手機底部導覽"
    >
      <nav
        className={cn(
          "relative mx-auto w-[min(92vw,430px)] overflow-hidden rounded-[22px] border border-white/10",
          "bg-[linear-gradient(180deg,rgba(8,23,19,0.92),rgba(4,14,12,0.95))] p-1.5 text-zinc-200",
          "shadow-[0_24px_42px_-24px_rgba(16,185,129,0.5)] ring-1 ring-inset ring-white/5 backdrop-blur-xl"
        )}
      >
        <div className="pointer-events-none absolute -top-16 left-1/2 h-24 w-40 -translate-x-1/2 rounded-full bg-emerald-300/10 blur-2xl" />

        <div className="relative grid grid-cols-3 gap-1">
          {FOOTER_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href || pathname?.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.value}
                href={tab.href}
                className={cn(
                  "group relative flex h-12 min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl",
                  "text-[11px] font-semibold tracking-[0.02em] text-zinc-200 transition-all duration-200",
                  isActive
                    ? "bg-emerald-400/12 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.42)]"
                    : "hover:bg-white/5"
                )}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "size-3.75 transition-transform duration-200",
                    isActive && "scale-110 text-zinc-50"
                  )}
                />
                <span className="leading-none">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Footer;
