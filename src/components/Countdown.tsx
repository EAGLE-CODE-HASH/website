import { useEffect, useState } from 'react';

interface CountdownProps {
  tanggal: string;
  waktu: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(tanggal: string, waktu: string): TimeLeft {
  const target = new Date(`${tanggal}T${waktu || '00:00'}:00`);
  const targetMs = target.getTime();
  if (!Number.isFinite(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  }
  const diff = targetMs - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
    expired: false,
  };
}

export function Countdown({ tanggal, waktu }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(tanggal, waktu));

  useEffect(() => {
    setTimeLeft(computeTimeLeft(tanggal, waktu));
    const timer = window.setInterval(() => {
      setTimeLeft(computeTimeLeft(tanggal, waktu));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [tanggal, waktu]);

  if (timeLeft.expired) {
    return (
      <p
        className="font-editorial text-2xl italic py-4"
        style={{ color: 'var(--gold)' }}
      >
        Hari bahagia telah tiba
      </p>
    );
  }

  const boxes = [
    { label: 'Hari', value: timeLeft.days },
    { label: 'Jam', value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 my-6">
      {boxes.map((item) => (
        <div
          key={item.label}
          className="min-w-[74px] sm:min-w-[84px] py-3.5 px-4 border text-center"
          style={{
            backgroundColor: 'var(--paper)',
            borderColor: 'var(--line)',
          }}
        >
          <strong
            className="block font-editorial text-3xl sm:text-4xl font-normal leading-none tabular-nums mb-1"
            style={{ color: 'var(--gold)' }}
          >
            {String(item.value).padStart(2, '0')}
          </strong>
          <span
            className="block text-[10px] tracking-[0.14em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
