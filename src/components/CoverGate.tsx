import { motion } from 'motion/react';

interface CoverGateProps {
  manName: string;
  womanName: string;
  openingMessage: string;
  guestName: string;
  eventDateLabel: string;
  onOpen: () => void;
  onOpenDashboard: () => void;
}

export function CoverGate({
  manName,
  womanName,
  openingMessage,
  guestName,
  eventDateLabel,
  onOpen,
  onOpenDashboard,
}: CoverGateProps) {
  const monogram = (manName.trim()[0] || 'J').toUpperCase();

  return (
    <section
      aria-label="Sampul Undangan"
      className="relative min-h-[100svh] flex items-center justify-center text-center px-6 py-12 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, var(--paper) 0%, var(--ivory) 74%)',
      }}
    >
      {/* Subtle architectural circular framing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 -left-28 w-72 h-72 rounded-full border opacity-40"
        style={{ borderColor: 'var(--gold)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 w-72 h-72 rounded-full border opacity-40"
        style={{ borderColor: 'var(--gold)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center"
      >
        <div
          className="w-20 h-20 rounded-full border flex items-center justify-center mb-7 font-editorial text-3xl"
          style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}
        >
          {monogram}
        </div>

        <p
          className="text-xs tracking-[0.24em] uppercase font-semibold mb-4"
          style={{ color: 'var(--gold)' }}
        >
          The Wedding Celebration
        </p>

        <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl leading-[1.04] font-normal tracking-tight text-balance mb-5">
          <span>{manName}</span>{' '}
          <span className="italic" style={{ color: 'var(--gold)' }}>
            &amp;
          </span>{' '}
          <span>{womanName}</span>
        </h1>

        <p className="text-xs tracking-[0.16em] uppercase mb-6" style={{ color: 'var(--muted)' }}>
          {eventDateLabel}
        </p>

        <p
          className="text-sm sm:text-base max-w-lg leading-relaxed mb-8"
          style={{ color: 'var(--muted)' }}
        >
          {openingMessage}
        </p>

        <div
          className="w-full max-w-sm py-3.5 px-5 border-t border-b mb-8"
          style={{ borderColor: 'var(--line)' }}
        >
          <span className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>
            Kepada Yth.
          </span>
          <strong className="font-editorial text-2xl font-medium tracking-wide">
            {guestName}
          </strong>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="px-7 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--gold)' }}
          >
            Buka Undangan
          </button>

          <button
            type="button"
            onClick={onOpenDashboard}
            className="px-5 py-3 text-xs font-medium tracking-[0.08em] uppercase border transition-colors duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            style={{
              borderColor: 'var(--line)',
              backgroundColor: 'var(--paper)',
              color: 'var(--ink)',
            }}
          >
            Dashboard Demo
          </button>
        </div>
      </motion.div>
    </section>
  );
}
