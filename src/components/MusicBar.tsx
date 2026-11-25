import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play } from 'lucide-react';

interface MusicBarProps {
  audioSrc: string;
  fileName: string;
  onRequestMusicPick: () => void;
}

export function MusicBar({ audioSrc, fileName, onRequestMusicPick }: MusicBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [statusText, setStatusText] = useState('Off');

  useEffect(() => {
    if (audioSrc) {
      setIsPlaying(false);
      setStatusText(fileName ? 'Siap diputar' : 'Siap');
    } else {
      setIsPlaying(false);
      setStatusText('Off');
    }
  }, [audioSrc, fileName]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleToggle = async () => {
    const el = audioRef.current;
    if (!el || !audioSrc) {
      setStatusText('Pilih musik di dashboard');
      onRequestMusicPick();
      return;
    }

    if (el.paused) {
      try {
        await el.play();
        setIsPlaying(true);
        setStatusText('Playing');
      } catch {
        setIsPlaying(false);
        setStatusText('Gagal memutar');
      }
    } else {
      el.pause();
      setIsPlaying(false);
      setStatusText('Paused');
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioSrc || undefined}
        loop
        onEnded={() => {
          setIsPlaying(false);
          setStatusText('Off');
        }}
      />
      <div
        className="fixed bottom-3.5 right-3.5 z-30 flex items-center gap-2.5 px-3 py-2 border shadow-sm"
        style={{
          backgroundColor: 'var(--paper)',
          borderColor: 'var(--line)',
        }}
      >
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isPlaying ? 'Jeda musik' : 'Putar musik'}
          className="w-8 h-8 flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer"
          style={{ color: 'var(--gold)' }}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          <Music className="w-3.5 h-3.5 hidden sm:block" />
          <span className="whitespace-nowrap">Music</span>
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume musik"
          className="w-16 sm:w-20 accent-[var(--gold)] cursor-pointer"
        />

        <span
          className="text-xs whitespace-nowrap max-w-[110px] truncate"
          style={{ color: 'var(--muted)' }}
          title={statusText}
        >
          {statusText}
        </span>
      </div>
    </>
  );
}
