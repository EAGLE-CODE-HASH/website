import { useEffect, useState, type ChangeEvent } from 'react';
import { Eye, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import type { ThemeKey, WeddingData } from '../types/wedding';
import { isValidMapsUrl, readImageFile, safeText } from '../utils/storage';

interface DashboardModalProps {
  isOpen: boolean;
  data: WeddingData;
  onClose: () => void;
  onUpdateData: (next: WeddingData) => boolean;
  onResetData: () => void;
  onSelectMusic: (file: File) => void;
}

export function DashboardModal({
  isOpen,
  data,
  onClose,
  onUpdateData,
  onResetData,
  onSelectMusic,
}: DashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'source'>('editor');
  const [manName, setManName] = useState('');
  const [womanName, setWomanName] = useState('');
  const [coupleDesc, setCoupleDesc] = useState('');
  const [openingMsg, setOpeningMsg] = useState('');
  const [theme, setTheme] = useState<ThemeKey>('classic');
  const [accentColor, setAccentColor] = useState('#b79a62');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [timeZone, setTimeZone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const primaryEvent = data.events[0];
    const venueEvent = data.events[1] ?? primaryEvent;
    setManName(data.wedding.namaPria);
    setWomanName(data.wedding.namaWanita);
    setCoupleDesc(data.wedding.deskripsi);
    setOpeningMsg(data.config.pesanPembuka);
    setTheme(data.config.tema);
    setAccentColor(data.config.warnaUtama);
    setEventDate(primaryEvent?.tanggal ?? '2027-06-12');
    setEventTime(primaryEvent?.waktu ?? '08:00');
    setTimeZone(primaryEvent?.zonaWaktu ?? 'WIB');
    setVenueName(venueEvent?.lokasi ?? 'The Grand Ballroom');
    setVenueAddress(venueEvent?.alamat ?? '');
    setMapsUrl(venueEvent?.mapsUrl ?? 'https://maps.google.com/?q=Banda+Aceh');
    setStatusMessage('');
    setConfirmReset(false);
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handlePortraitUpload = async (
    target: 'man' | 'woman',
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      const next: WeddingData = {
        ...data,
        wedding: {
          ...data.wedding,
          ...(target === 'man' ? { fotoPria: dataUrl } : { fotoWanita: dataUrl }),
        },
      };
      onUpdateData(next);
      setStatusMessage(
        `Foto mempelai ${target === 'man' ? 'pria' : 'wanita'} diperbarui.`,
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Gagal memuat foto.');
    }
    e.target.value = '';
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    try {
      const additions = await Promise.all(
        files.map(async (f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          imageUrl: await readImageFile(f),
          caption: safeText(galleryCaption || f.name.replace(/\.[^/.]+$/, ''), 80),
        })),
      );
      const next: WeddingData = {
        ...data,
        gallery: [...data.gallery, ...additions],
      };
      const ok = onUpdateData(next);
      setGalleryCaption('');
      setStatusMessage(
        ok
          ? `${additions.length} foto ditambahkan ke galeri.`
          : 'Foto ditambahkan, namun ruang localStorage penuh.',
      );
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Gagal memuat foto galeri.');
    }
    e.target.value = '';
  };

  const handleRemoveGalleryItem = (id: string) => {
    const next: WeddingData = {
      ...data,
      gallery: data.gallery.filter((item) => item.id !== id),
    };
    onUpdateData(next);
    setStatusMessage('Foto dihapus dari galeri.');
  };

  const handleMusicUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setStatusMessage('File musik harus berformat audio (MP3, OGG, WAV).');
      return;
    }
    onSelectMusic(file);
    setStatusMessage(`Musik "${file.name}" siap diputar melalui pemutar di kanan bawah.`);
    e.target.value = '';
  };

  const handleSaveConfig = () => {
    const man = safeText(manName, 80);
    const woman = safeText(womanName, 80);
    const desc = safeText(coupleDesc, 300);
    const venue = safeText(venueName, 100);
    const address = safeText(venueAddress, 180);
    const maps = mapsUrl.trim();

    if (!man || !woman || !eventDate || !eventTime || !venue || !address) {
      setStatusMessage('Lengkapi nama mempelai, tanggal, waktu, lokasi, dan alamat.');
      return;
    }
    if (!isValidMapsUrl(maps)) {
      setStatusMessage('Gunakan URL Google Maps HTTPS yang valid.');
      return;
    }

    const updatedEvents = data.events.map((ev, index) => ({
      ...ev,
      tanggal: eventDate,
      waktu: index === 0 ? eventTime : ev.waktu,
      zonaWaktu: timeZone,
      lokasi: venue,
      alamat: address,
      mapsUrl: maps,
    }));

    const next: WeddingData = {
      ...data,
      wedding: {
        ...data.wedding,
        namaPria: man,
        namaWanita: woman,
        deskripsi: desc,
        tema: theme,
      },
      events: updatedEvents,
      config: {
        ...data.config,
        tema: theme,
        warnaUtama: accentColor,
        pesanPembuka: safeText(openingMsg, 300),
      },
    };

    const ok = onUpdateData(next);
    setStatusMessage(
      ok
        ? 'Perubahan disimpan. Tampilan undangan diperbarui di browser ini.'
        : 'Gagal menyimpan ke localStorage. Kurangi ukuran foto atau kosongkan ruang browser.',
    );
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard Demo JanjiSuci"
    >
      <div
        className="w-full max-w-4xl my-auto border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--paper)',
          borderColor: 'var(--line)',
          color: 'var(--ink)',
        }}
      >
        {/* Sticky modal header */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b"
          style={{ borderColor: 'var(--line)', backgroundColor: 'var(--paper)' }}
        >
          <div>
            <span
              className="block text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: 'var(--gold)' }}
            >
              JanjiSuci Studio
            </span>
            <h2 className="font-editorial text-2xl font-medium m-0">Dashboard Demo</h2>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center p-1 border text-xs"
              style={{ borderColor: 'var(--line)', backgroundColor: 'var(--ivory)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'editor' ? 'text-white' : ''
                }`}
                style={
                  activeTab === 'editor'
                    ? { backgroundColor: 'var(--gold)' }
                    : { color: 'var(--muted)' }
                }
              >
                Editor Undangan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('source')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'source' ? 'text-white' : ''
                }`}
                style={
                  activeTab === 'source'
                    ? { backgroundColor: 'var(--gold)' }
                    : { color: 'var(--muted)' }
                }
              >
                <Eye className="w-3.5 h-3.5" />
                <span>HTML Asli</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium uppercase tracking-wider border transition-opacity hover:opacity-80 cursor-pointer whitespace-nowrap"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              <span>Tutup</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {activeTab === 'source' ? (
          <div className="p-4 sm:p-6">
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
              Pratinjau langsung file lampiran{' '}
              <code className="px-1.5 py-0.5 bg-black/5">/assets/aistudio/janjisuci_921fb4e6.html</code>
            </p>
            <iframe
              title="Pratinjau File HTML JanjiSuci Asli"
              src="/assets/aistudio/janjisuci_921fb4e6.html"
              className="w-full h-[70vh] border bg-white"
              style={{ borderColor: 'var(--line)' }}
            />
          </div>
        ) : (
          <div className="p-6 max-h-[82vh] overflow-y-auto space-y-8">
            <div
              className="p-3.5 text-xs leading-relaxed border"
              style={{
                backgroundColor: 'var(--ivory)',
                borderColor: 'var(--line)',
                color: 'var(--muted)',
              }}
            >
              Mode demo lokal: Dashboard ini tidak memerlukan login dan semua perubahan hanya
              tersimpan pada <code className="font-mono">localStorage</code> browser ini.
            </div>

            {/* Section 1: Data Mempelai & Tampilan */}
            <section className="space-y-4">
              <h3
                className="font-editorial text-2xl pb-2 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                Data Mempelai &amp; Tampilan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Nama pria
                  </label>
                  <input
                    type="text"
                    value={manName}
                    onChange={(e) => setManName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Nama wanita
                  </label>
                  <input
                    type="text"
                    value={womanName}
                    onChange={(e) => setWomanName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Deskripsi pasangan
                  </label>
                  <textarea
                    rows={3}
                    value={coupleDesc}
                    onChange={(e) => setCoupleDesc(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white resize-y"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Pesan pembuka
                  </label>
                  <textarea
                    rows={3}
                    value={openingMsg}
                    onChange={(e) => setOpeningMsg(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white resize-y"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Foto pria (pilih file lokal maks. 1,2 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePortraitUpload('man', e)}
                    className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:border file:border-[var(--line)] file:bg-white file:text-xs cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Foto wanita (pilih file lokal maks. 1,2 MB)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePortraitUpload('woman', e)}
                    className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:border file:border-[var(--line)] file:bg-white file:text-xs cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Tema undangan
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemeKey)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <option value="classic">Classic Elegant</option>
                    <option value="floral">Floral Minimalist</option>
                    <option value="heritage">Traditional Heritage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Warna aksen utama
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-16 p-1 border bg-white cursor-pointer"
                      style={{ borderColor: 'var(--line)' }}
                    />
                    <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                      {accentColor}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Acara & Lokasi */}
            <section className="space-y-4">
              <h3
                className="font-editorial text-2xl pb-2 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                Acara &amp; Lokasi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Tanggal acara utama
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Waktu acara utama
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Nama lokasi
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Alamat lengkap
                  </label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    URL Google Maps (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Zona waktu
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value as 'WIB' | 'WITA' | 'WIT')}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <option value="WIB">WIB</option>
                    <option value="WITA">WITA</option>
                    <option value="WIT">WIT</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 3: Galeri Foto */}
            <section className="space-y-4">
              <h3
                className="font-editorial text-2xl pb-2 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                Galeri Foto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Caption foto baru
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="Momen bahagia"
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                    Tambah foto galeri (gambar lokal)
                  </label>
                  <label
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium border bg-white cursor-pointer hover:opacity-80"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <Upload className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                    <span>Pilih Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {data.gallery.length > 0 && (
                <div
                  className="divide-y border"
                  style={{ borderColor: 'var(--line)', backgroundColor: 'var(--ivory)' }}
                >
                  {data.gallery.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                    >
                      <span className="truncate">
                        {idx + 1}. {item.caption}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border bg-white text-xs hover:opacity-75 cursor-pointer shrink-0"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 4: Musik Latar */}
            <section className="space-y-3">
              <h3
                className="font-editorial text-2xl pb-2 border-b"
                style={{ borderColor: 'var(--line)' }}
              >
                Musik Latar
              </h3>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                  Pilih file musik lokal (MP3, OGG, WAV)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicUpload}
                  className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:border file:border-[var(--line)] file:bg-white file:text-xs cursor-pointer"
                />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                File musik lokal diputar untuk sesi browser ini setelah tombol play pada bilah
                musik ditekan.
              </p>
            </section>

            {/* Footer Actions */}
            <div
              className="pt-4 border-t flex flex-wrap items-center justify-between gap-4"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: 'var(--gold)' }}
                >
                  Simpan Perubahan
                </button>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.08em] border bg-white hover:opacity-80 cursor-pointer"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data Demo</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      Yakin reset semua data?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onResetData();
                        setConfirmReset(false);
                        setStatusMessage('Data demo dikembalikan ke contoh awal.');
                      }}
                      className="px-3 py-2 text-xs font-semibold uppercase bg-red-700 text-white cursor-pointer"
                    >
                      Ya, Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2 text-xs border bg-white cursor-pointer"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>

              {statusMessage && (
                <p className="text-xs font-medium" style={{ color: 'var(--sage)' }} aria-live="polite">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
