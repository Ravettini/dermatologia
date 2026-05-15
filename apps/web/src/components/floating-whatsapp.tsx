"use client";

export function FloatingWhatsApp({ number }: { number: string }) {
  const href = `https://wa.me/${number.replace(/\D/g, "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-[55] flex h-14 w-14 shrink-0 touch-manipulation items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:left-8 md:h-16 md:w-16"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <path
          fill="currentColor"
          d="M16.003 3C9.374 3 4 8.373 4 15c0 2.385.674 4.61 1.844 6.496L4.05 28.05l6.726-1.768A11.94 11.94 0 0016.003 27h.001c6.629 0 12-5.373 12-12s-5.372-12-12-12zm6.695 17.037c-.288.806-1.42 1.48-1.988 1.574-.506.086-1.146.123-1.854-.123-.428-.144-1.003-.506-1.74-1.003-3.043-2.066-5.017-5.2-5.17-5.44-.152-.24-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.057-2.53.277-.31.605-.387.806-.387.2 0 .403.002.58.01.186.01.435-.07.68.52.24.6.82 2.09.84 2.24.02.15.03.33-.05.52-.08.18-.12.3-.24.46-.12.15-.25.34-.36.45-.12.12-.25.27-.11.52.14.26.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.14.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.22 1.14z"
        />
      </svg>
    </a>
  );
}
