import { useEffect, useMemo, useRef, useState } from 'react';
import { CoverGate } from './components/CoverGate';
import { DashboardModal } from './components/DashboardModal';
import { InvitationView } from './components/InvitationView';
import { MusicBar } from './components/MusicBar';
import type { GuestEntry, WeddingData } from './types/wedding';
import {
  createDefaultWeddingData,
  formatDateID,
  loadWeddingData,
  safeText,
  saveWeddingData,
} from './utils/storage';

export default function App() {
  const [data, setData] = useState<WeddingData>(() => loadWeddingData());
  const [isOpened, setIsOpened] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [musicSrc, setMusicSrc] = useState('');
  const [musicFileName, setMusicFileName] = useState('');
  const objectUrlRef = useRef<string | null>(null);

  const guestName = useMemo(() => {
    const param = new URLSearchParams(window.location.search).get('to');
    return param ? safeText(param, 80) || 'Tamu Undangan' : 'Tamu Undangan';
  }, []);

  // Sync theme class and accent color CSS custom property on document root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    body.classList.remove('theme-classic', 'theme-floral', 'theme-heritage');
    body.classList.add(`theme-${data.config.tema || 'classic'}`);
    root.style.setProperty('--gold', data.config.warnaUtama || '#b79a62');
  }, [data.config.tema, data.config.warnaUtama]);

  // Cleanup audio ObjectURL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleUpdateData = (next: WeddingData): boolean => {
    setData(next);
    return saveWeddingData(next);
  };

  const handleResetData = () => {
    const fresh = createDefaultWeddingData();
    setData(fresh);
    saveWeddingData(fresh);
  };

  const handleAddGuestEntry = (entry: GuestEntry): boolean => {
    const next: WeddingData = {
      ...data,
      guests: [...data.guests, entry],
    };
    setData(next);
    return saveWeddingData(next);
  };

  const handleSelectMusic = (file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setMusicSrc(url);
    setMusicFileName(file.name);
  };

  const handleOpenInvitation = () => {
    setIsOpened(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const primaryEvent = data.events[0];
  const eventDateLabel = `${formatDateID(primaryEvent?.tanggal)}${
    primaryEvent?.lokasi ? ` · ${primaryEvent.lokasi}` : ''
  }`;

  return (
    <div className="min-h-screen">
      {!isOpened ? (
        <CoverGate
          manName={data.wedding.namaPria}
          womanName={data.wedding.namaWanita}
          openingMessage={data.config.pesanPembuka}
          guestName={guestName}
          eventDateLabel={eventDateLabel}
          onOpen={handleOpenInvitation}
          onOpenDashboard={() => setIsDashboardOpen(true)}
        />
      ) : (
        <InvitationView
          data={data}
          onAddGuestEntry={handleAddGuestEntry}
          onOpenDashboard={() => setIsDashboardOpen(true)}
        />
      )}

      <MusicBar
        audioSrc={musicSrc}
        fileName={musicFileName}
        onRequestMusicPick={() => setIsDashboardOpen(true)}
      />

      <DashboardModal
        isOpen={isDashboardOpen}
        data={data}
        onClose={() => setIsDashboardOpen(false)}
        onUpdateData={handleUpdateData}
        onResetData={handleResetData}
        onSelectMusic={handleSelectMusic}
      />
    </div>
  );
}
