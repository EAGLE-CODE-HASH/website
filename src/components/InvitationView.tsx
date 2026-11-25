import { useState, type FormEvent } from 'react';
import { ExternalLink, MapPin, X } from 'lucide-react';
import type { GalleryItem, GuestEntry, WeddingData } from '../types/wedding';
import { formatDateID, isValidMapsUrl, safeText } from '../utils/storage';
import { Countdown } from './Countdown';
import { Navbar } from './Navbar';

interface InvitationViewProps {
  data: WeddingData;
  onAddGuestEntry: (entry: GuestEntry) => boolean;
  onOpenDashboard: () => void;
}

export function InvitationView({
  data,
  onAddGuestEntry,
  onOpenDashboard,
}: InvitationViewProps) {
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // RSVP state
  const [rsvpName, setRsvpName] = useState('');
  const [attendance, setAttendance] = useState('Hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [rsvpStatus, setRsvpStatus] = useState('');

  // Wish state
  const [wishName, setWishName] = useState('');
  const [wishText, setWishText] = useState('');
  const [wishStatus, setWishStatus] = useState('');

  const { wedding, events, gallery, loveStory, guests } = data;
  const primaryEvent = events[0];
  const venueEvent = events[1] ?? primaryEvent;
  const mapsHref =
    venueEvent && isValidMapsUrl(venueEvent.mapsUrl)
      ? venueEvent.mapsUrl
      : 'https://maps.google.com/?q=Banda+Aceh';

  const wishes = guests.filter((g) => Boolean(g.ucapan)).slice().reverse();

  const handleRsvpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = safeText(rsvpName, 60);
    if (!cleanName || !Number.isInteger(guestCount) || guestCount < 1 || guestCount > 5) {
      setRsvpStatus('Periksa nama dan jumlah tamu (1–5).');
      return;
    }

    const ok = onAddGuestEntry({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      namaAlias: cleanName,
      statusKehadiran: attendance,
      jumlahTamu: guestCount,
      ucapan: '',
    });

    setRsvpStatus(
      ok
        ? 'RSVP demo tersimpan pada browser ini. Tidak dikirim ke pengelola.'
        : 'Penyimpanan browser gagal. Periksa ruang penyimpanan.',
    );
    setRsvpName('');
    setAttendance('Hadir');
    setGuestCount(1);
  };

  const handleWishSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = safeText(wishName, 60);
    const cleanWish = safeText(wishText, 400);

    if (!cleanName || cleanWish.length < 3) {
      setWishStatus('Isi nama dan ucapan minimal 3 karakter.');
      return;
    }

    const ok = onAddGuestEntry({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      namaAlias: cleanName,
      statusKehadiran: 'Belum mengisi RSVP',
      jumlahTamu: 0,
      ucapan: cleanWish,
    });

    setWishStatus(
      ok
        ? 'Ucapan tersimpan secara lokal di browser ini.'
        : 'Gagal menyimpan. Periksa ruang penyimpanan.',
    );
    setWishName('');
    setWishText('');
  };

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Navbar onOpenDashboard={onOpenDashboard} />

      {/* Hero Section */}
      <header className="text-center px-5 pt-16 pb-12 max-w-[1100px] mx-auto w-full">
        <p
          className="text-xs font-bold tracking-[0.22em] uppercase mb-3"
          style={{ color: 'var(--gold)' }}
        >
          You are invited to celebrate
        </p>

        <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl leading-[1.08] font-normal text-balance my-3">
          <span>{wedding.namaPria}</span>{' '}
          <span className="italic" style={{ color: 'var(--gold)' }}>
            &amp;
          </span>{' '}
          <span>{wedding.namaWanita}</span>
        </h1>

        <div
          className="text-xl tracking-[0.55em] my-3 select-none"
          style={{ color: 'var(--gold)' }}
          aria-hidden="true"
        >
          ✦ ✧ ✦
        </div>

        <p className="text-xs sm:text-sm mb-3" style={{ color: 'var(--muted)' }}>
          {formatDateID(primaryEvent?.tanggal)}
          {primaryEvent?.lokasi ? ` · ${primaryEvent.lokasi}` : ''}
        </p>

        <p
          className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8"
          style={{ color: 'var(--muted)' }}
        >
          {wedding.deskripsi}
        </p>

        <p
          className="text-[11px] font-bold tracking-[0.22em] uppercase"
          style={{ color: 'var(--gold)' }}
        >
          Menuju hari bahagia
        </p>

        {primaryEvent && (
          <Countdown tanggal={primaryEvent.tanggal} waktu={primaryEvent.waktu} />
        )}
      </header>

      <main className="flex-1">
        {/* Mempelai */}
        <section id="mempelai" className="py-16 sm:py-20">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Mempelai
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Dengan segala kerendahan hati, kami mempersembahkan kisah dan janji suci ini.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <article className="text-center flex flex-col items-center">
                <div
                  className="w-56 aspect-[4/5] overflow-hidden border mb-4"
                  style={{
                    borderRadius: '120px 120px 4px 4px',
                    borderColor: 'var(--line)',
                    backgroundColor: 'var(--ivory-alt)',
                  }}
                >
                  <img
                    src={wedding.fotoPria}
                    alt={`Foto ${wedding.namaPria}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-editorial text-3xl font-normal mb-1">{wedding.namaPria}</h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
                  Bagian dari kisah indah bersama.
                </p>
              </article>

              <article className="text-center flex flex-col items-center">
                <div
                  className="w-56 aspect-[4/5] overflow-hidden border mb-4"
                  style={{
                    borderRadius: '120px 120px 4px 4px',
                    borderColor: 'var(--line)',
                    backgroundColor: 'var(--ivory-alt)',
                  }}
                >
                  <img
                    src={wedding.fotoWanita}
                    alt={`Foto ${wedding.namaWanita}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-editorial text-3xl font-normal mb-1">{wedding.namaWanita}</h3>
                <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
                  Bagian dari kisah indah bersama.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Rangkaian Acara */}
        <section
          id="acara"
          className="py-16 sm:py-20"
          style={{ backgroundColor: 'var(--ivory-alt)' }}
        >
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Rangkaian Acara
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Merupakan kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {events.map((ev) => (
                <article
                  key={ev.id}
                  className="p-7 border text-center"
                  style={{
                    backgroundColor: 'var(--paper)',
                    borderColor: 'var(--line)',
                  }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                    style={{ color: 'var(--gold)' }}
                  >
                    {ev.namaAcara}
                  </div>
                  <h3 className="font-editorial text-3xl font-normal mb-2">{ev.lokasi}</h3>
                  <div
                    className="font-editorial text-lg mb-2"
                    style={{ color: 'var(--gold)' }}
                  >
                    {formatDateID(ev.tanggal)}
                  </div>
                  <p className="text-sm font-medium tabular-nums mb-2">
                    {ev.waktu} {ev.zonaWaktu}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {ev.alamat}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Galeri Momen */}
        <section id="galeri" className="py-16 sm:py-20">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Galeri Momen
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Potongan cerita yang kami simpan dengan penuh rasa syukur.
            </p>

            {gallery.length === 0 ? (
              <p className="text-center text-sm py-8" style={{ color: 'var(--muted)' }}>
                Belum ada foto galeri. Tambahkan foto melalui Dashboard Demo.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {gallery.map((item) => (
                  <figure key={item.id} className="group">
                    <button
                      type="button"
                      onClick={() => setLightboxItem(item)}
                      className="block w-full overflow-hidden border focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.caption}
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[1/1.15] object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </button>
                    <figcaption className="font-editorial text-center text-base py-2.5">
                      {item.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Our Love Story */}
        <section
          id="kisah"
          className="py-16 sm:py-20"
          style={{ backgroundColor: 'var(--ivory-alt)' }}
        >
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Our Love Story
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-12"
              style={{ color: 'var(--muted)' }}
            >
              Setiap pertemuan memiliki cerita, dan setiap cerita membawa kami ke hari ini.
            </p>

            <div className="relative max-w-2xl mx-auto pl-7">
              {/* Thin vertical timeline rail */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-2 bottom-2 w-px"
                style={{ backgroundColor: 'var(--gold)' }}
              />

              <div className="space-y-9">
                {loveStory.map((story) => (
                  <article key={story.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[33px] top-1.5 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--gold)' }}
                    />
                    <time
                      className="block text-xs tracking-[0.1em] uppercase mb-1"
                      style={{ color: 'var(--gold)' }}
                    >
                      {formatDateID(story.tanggal)}
                    </time>
                    <h3 className="font-editorial text-2xl font-normal mb-1.5">{story.judul}</h3>
                    <p
                      className="text-sm leading-relaxed mb-3"
                      style={{ color: 'var(--muted)' }}
                    >
                      {story.deskripsi}
                    </p>
                    {story.imageUrl && (
                      <div
                        className="overflow-hidden border"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        <img
                          src={story.imageUrl}
                          alt={story.judul}
                          referrerPolicy="no-referrer"
                          className="w-full max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lokasi Acara */}
        <section id="lokasi" className="py-16 sm:py-20">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-8 font-normal">
              Lokasi Acara
            </h2>

            <div
              className="max-w-xl mx-auto p-8 border text-center"
              style={{
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--line)',
              }}
            >
              <MapPin
                className="w-6 h-6 mx-auto mb-3"
                style={{ color: 'var(--gold)' }}
                aria-hidden="true"
              />
              <h3 className="font-editorial text-3xl font-normal mb-2">
                {venueEvent?.lokasi ?? 'The Grand Ballroom'}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                {venueEvent?.alamat ?? 'Banda Aceh, Aceh'}
              </p>

              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] border transition-opacity hover:opacity-80"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                <span>Buka Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Wedding Gift */}
        <section className="py-16 sm:py-20 pt-2">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Wedding Gift
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Doa restu Anda merupakan hadiah terindah. Bagi yang ingin berbagi tanda kasih,
              berikut informasi contoh.
            </p>

            <div className="flex flex-wrap justify-center gap-5">
              <div
                className="min-w-[240px] flex-1 max-w-xs p-7 border text-center"
                style={{
                  backgroundColor: 'var(--paper)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                  style={{ color: 'var(--gold)' }}
                >
                  Digital Gift
                </div>
                <h3 className="font-editorial text-2xl font-normal mb-1">Contoh E-Wallet</h3>
                <p className="text-sm mb-2">JanjiSuci Demo</p>
                <small className="text-xs" style={{ color: 'var(--muted)' }}>
                  Informasi pembayaran tidak aktif
                </small>
              </div>

              <div
                className="min-w-[240px] flex-1 max-w-xs p-7 border text-center"
                style={{
                  backgroundColor: 'var(--paper)',
                  borderColor: 'var(--line)',
                }}
              >
                <div
                  className="text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
                  style={{ color: 'var(--gold)' }}
                >
                  Wedding Gift
                </div>
                <h3 className="font-editorial text-2xl font-normal mb-1">Kirim Hadiah</h3>
                <p className="text-sm mb-2">Alamat contoh, Banda Aceh</p>
                <small className="text-xs" style={{ color: 'var(--muted)' }}>
                  Hanya data demonstrasi
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP */}
        <section
          id="rsvp"
          className="py-16 sm:py-20"
          style={{ backgroundColor: 'var(--ivory-alt)' }}
        >
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Konfirmasi Kehadiran
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Mohon bantu kami mempersiapkan hari bahagia ini.
            </p>

            <form
              onSubmit={handleRsvpSubmit}
              className="max-w-xl mx-auto p-6 sm:p-8 border space-y-4"
              style={{
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--line)',
              }}
            >
              <div>
                <label
                  htmlFor="rsvpName"
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Nama
                </label>
                <input
                  id="rsvpName"
                  type="text"
                  maxLength={60}
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border bg-white"
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>

              <div>
                <label
                  htmlFor="attendance"
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Konfirmasi
                </label>
                <select
                  id="attendance"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border bg-white"
                  style={{ borderColor: 'var(--line)' }}
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Tidak dapat hadir">Tidak dapat hadir</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="guestCount"
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Jumlah tamu (termasuk Anda)
                </label>
                <input
                  id="guestCount"
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border bg-white tabular-nums"
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: 'var(--gold)' }}
              >
                Simpan RSVP Demo
              </button>

              {rsvpStatus && (
                <p className="text-xs font-medium" style={{ color: 'var(--sage)' }} aria-live="polite">
                  {rsvpStatus}
                </p>
              )}

              <p
                className="text-xs leading-relaxed p-3 border"
                style={{
                  backgroundColor: 'var(--ivory)',
                  borderColor: 'var(--line)',
                  color: 'var(--muted)',
                }}
              >
                Mode demo lokal: RSVP ini hanya tersimpan pada browser/perangkat yang sedang
                digunakan. Data tidak dikirim kepada pengelola undangan dan tidak tersinkronisasi
                antarperangkat.
              </p>
            </form>
          </div>
        </section>

        {/* Ucapan & Doa */}
        <section id="ucapan" className="py-16 sm:py-20">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="font-editorial text-3xl sm:text-5xl text-center mb-3 font-normal">
              Ucapan &amp; Doa
            </h2>
            <p
              className="text-center text-sm sm:text-base max-w-xl mx-auto mb-10"
              style={{ color: 'var(--muted)' }}
            >
              Tinggalkan pesan baik untuk perjalanan baru kami.
            </p>

            <form
              onSubmit={handleWishSubmit}
              className="max-w-xl mx-auto p-6 sm:p-8 border space-y-4"
              style={{
                backgroundColor: 'var(--paper)',
                borderColor: 'var(--line)',
              }}
            >
              <div>
                <label
                  htmlFor="wishName"
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Nama
                </label>
                <input
                  id="wishName"
                  type="text"
                  maxLength={60}
                  required
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border bg-white"
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>

              <div>
                <label
                  htmlFor="wishText"
                  className="block text-xs mb-1.5"
                  style={{ color: 'var(--muted)' }}
                >
                  Ucapan dan doa
                </label>
                <textarea
                  id="wishText"
                  maxLength={400}
                  required
                  rows={4}
                  placeholder="Tuliskan ucapan terbaik..."
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border bg-white resize-y"
                  style={{ borderColor: 'var(--line)' }}
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: 'var(--gold)' }}
              >
                Kirim Ucapan Demo
              </button>

              {wishStatus && (
                <p className="text-xs font-medium" style={{ color: 'var(--sage)' }} aria-live="polite">
                  {wishStatus}
                </p>
              )}

              <p
                className="text-xs leading-relaxed p-3 border"
                style={{
                  backgroundColor: 'var(--ivory)',
                  borderColor: 'var(--line)',
                  color: 'var(--muted)',
                }}
              >
                Buku tamu demo lokal: ucapan hanya tersimpan di browser ini, bukan dikirim ke calon
                pengantin.
              </p>
            </form>

            {/* Wish Entries */}
            <div className="max-w-2xl mx-auto mt-8">
              {wishes.length === 0 ? (
                <p className="text-center text-xs py-6" style={{ color: 'var(--muted)' }}>
                  Belum ada ucapan tersimpan. Jadilah yang pertama mengirimkan doa restu.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--line)' }}>
                  {wishes.map((entry) => (
                    <article
                      key={entry.id}
                      className="py-4 border-b"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      <strong className="font-editorial text-xl font-medium block mb-1">
                        {entry.namaAlias}
                      </strong>
                      <p className="text-sm leading-relaxed mb-1">{entry.ucapan}</p>
                      <small className="text-xs" style={{ color: 'var(--muted)' }}>
                        Ucapan tersimpan lokal
                      </small>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-14 px-5 pb-20"
        style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--muted)' }}
      >
        <div className="text-xl mb-2" style={{ color: 'var(--gold)' }} aria-hidden="true">
          ✦
        </div>
        <h2
          className="font-editorial text-3xl font-normal mb-2"
          style={{ color: 'var(--ink)' }}
        >
          {wedding.namaPria} &amp; {wedding.namaWanita}
        </h2>
        <p className="text-sm mb-2">Terima kasih atas doa dan kehadiran Anda.</p>
        <small className="text-xs">Made with love · JanjiSuci Demo</small>
      </footer>

      {/* Lightbox for Gallery */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.caption}
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-2xl w-full p-3 border"
            style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              aria-label="Tutup pratinjau foto"
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center border bg-white/90 text-black cursor-pointer"
              style={{ borderColor: 'var(--line)' }}
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxItem.imageUrl}
              alt={lightboxItem.caption}
              referrerPolicy="no-referrer"
              className="w-full max-h-[75vh] object-contain"
            />
            <p className="font-editorial text-center text-xl pt-3 pb-1">
              {lightboxItem.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
