"use client";
import { useEffect, useState, useRef } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  countdown?: number; // seconds for clipboard auto-clear
}

export default function Toast({ message, visible, onHide, countdown }: ToastProps) {
  const [show, setShow] = useState(false);
  const [remaining, setRemaining] = useState(countdown ?? 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      setShow(true);
      setRemaining(countdown ?? 0);

      // Auto-dismiss after 2.5s (or countdown duration if longer)
      const dismissMs = countdown ? Math.min(countdown * 1000, 5000) : 2500;
      timerRef.current = setTimeout(() => {
        setShow(false);
        onHide();
      }, dismissMs);

      // Countdown ticker for clipboard clear
      if (countdown) {
        countRef.current = setInterval(() => {
          setRemaining((c) => Math.max(0, c - 1));
        }, 1000);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countRef.current) clearInterval(countRef.current);
      };
    } else {
      setShow(false);
    }
  }, [visible, message, countdown, onHide]);

  if (!show) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] toast-enter">
      <div className="glass-card flex items-center gap-4 border-[#BEF264]/30 rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl min-w-[280px]">
        <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined neon-green-text text-[20px]">verified</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white tracking-tight">{message}</p>
          {countdown !== undefined && countdown > 0 && (
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              Clipboard clears in {remaining}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
