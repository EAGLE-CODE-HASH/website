import { Settings } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
}

const NAV_LINKS = [
  { href: '#mempelai', label: 'Mempelai' },
  { href: '#acara', label: 'Acara' },
  { href: '#galeri', label: 'Galeri' },
  { href: '#kisah', label: 'Kisah' },
  { href: '#rsvp', label: 'RSVP' },
];

export function Navbar({ onOpenDashboard }: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-20 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--ivory) 92%, transparent)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="max-w-[1100px] mx-auto px-5 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Wordmark */}
        <a
          href="#top"
          className="font-editorial text-2xl font-medium tracking-wide whitespace-nowrap shrink-0"
          style={{ color: 'var(--gold)' }}
        >
          JanjiSuci
        </a>

        {/* Zone 2: Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi Undangan">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs tracking-[0.12em] uppercase transition-opacity duration-200 hover:opacity-100 opacity-80 whitespace-nowrap shrink-0"
              style={{ color: 'var(--ink)' }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium tracking-[0.06em] uppercase border transition-colors duration-200 hover:opacity-85 whitespace-nowrap shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'var(--paper)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            }}
          >
            <Settings className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <span>Dashboard Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
