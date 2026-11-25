import type { WeddingData } from '../types/wedding';

export const STORAGE_KEY = 'janjiSuci.data.v1';

export function createSvgIllustration(
  label: string,
  bg = '#e9e2d5',
  fg = '#8c806d',
): string {
  const escaped = label.replace(/[<>&"']/g, '');
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700"><rect width="600" height="700" fill="${bg}"/><circle cx="300" cy="240" r="105" fill="#fff" opacity="0.38"/><path d="M90 700 Q110 420 300 420 Q490 420 510 700" fill="${fg}" opacity="0.22"/><text x="300" y="590" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="${fg}">${escaped}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
}

export function createDefaultWeddingData(): WeddingData {
  return {
    wedding: {
      id: 'wedding-1',
      namaPria: 'Arka Pratama',
      namaWanita: 'Nadira Putri',
      fotoPria: createSvgIllustration('The Groom', '#e8e2d5', '#8b806b'),
      fotoWanita: createSvgIllustration('The Bride', '#e8e5dc', '#7d8571'),
      deskripsi: 'Dua hati, satu janji, dan perjalanan baru yang dimulai bersama.',
      tema: 'classic',
    },
    events: [
      {
        id: 'akad',
        namaAcara: 'Akad Nikah',
        tanggal: '2027-06-12',
        waktu: '08:00',
        zonaWaktu: 'WIB',
        lokasi: 'The Grand Ballroom',
        alamat: 'Jl. Contoh Bahagia No. 10, Banda Aceh',
        mapsUrl: 'https://maps.google.com/?q=Banda+Aceh',
      },
      {
        id: 'resepsi',
        namaAcara: 'Resepsi',
        tanggal: '2027-06-12',
        waktu: '11:00',
        zonaWaktu: 'WIB',
        lokasi: 'The Grand Ballroom',
        alamat: 'Jl. Contoh Bahagia No. 10, Banda Aceh',
        mapsUrl: 'https://maps.google.com/?q=Banda+Aceh',
      },
    ],
    gallery: [
      {
        id: 'g0',
        imageUrl: createSvgIllustration('Our Moment 1', '#e8e2d5'),
        caption: 'A quiet beginning',
      },
      {
        id: 'g1',
        imageUrl: createSvgIllustration('Our Moment 2', '#e5e8df'),
        caption: 'A day to remember',
      },
      {
        id: 'g2',
        imageUrl: createSvgIllustration('Our Moment 3', '#eee3df'),
        caption: 'Little moments',
      },
      {
        id: 'g3',
        imageUrl: createSvgIllustration('Our Moment 4', '#e6e0d2'),
        caption: 'Together is home',
      },
      {
        id: 'g4',
        imageUrl: createSvgIllustration('Our Moment 5', '#e2e6e1'),
        caption: 'A beautiful promise',
      },
      {
        id: 'g5',
        imageUrl: createSvgIllustration('Our Moment 6', '#eee8dd'),
        caption: 'Forever starts here',
      },
    ],
    guests: [],
    loveStory: [
      {
        id: 's1',
        tanggal: '2022-05-01',
        judul: 'Pertama Bertemu',
        deskripsi: 'Sebuah pertemuan sederhana yang menjadi awal cerita luar biasa.',
        imageUrl: createSvgIllustration('First Meet', '#e7e1d6'),
      },
      {
        id: 's2',
        tanggal: '2023-08-17',
        judul: 'Menjalin Cerita',
        deskripsi: 'Belajar tumbuh, saling memahami, dan merayakan hal-hal kecil.',
        imageUrl: createSvgIllustration('Our Journey', '#e4e8df'),
      },
      {
        id: 's3',
        tanggal: '2026-12-24',
        judul: 'Satu Janji',
        deskripsi: 'Dengan keyakinan dan doa, kami memilih berjalan bersama.',
        imageUrl: createSvgIllustration('The Promise', '#eee3df'),
      },
    ],
    config: {
      tema: 'classic',
      warnaUtama: '#b79a62',
      musikUrl: '',
      coverImage: '',
      pesanPembuka:
        'Dengan penuh kebahagiaan, kami mengundang Anda untuk menjadi bagian dari hari istimewa kami.',
    },
  };
}

export function loadWeddingData(): WeddingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultWeddingData();
    const parsed = JSON.parse(raw) as Partial<WeddingData>;
    if (!parsed || !parsed.wedding || !Array.isArray(parsed.gallery) || !Array.isArray(parsed.events)) {
      return createDefaultWeddingData();
    }
    const defaults = createDefaultWeddingData();
    return {
      wedding: { ...defaults.wedding, ...parsed.wedding },
      events: parsed.events.length > 0 ? parsed.events : defaults.events,
      gallery: parsed.gallery,
      guests: Array.isArray(parsed.guests) ? parsed.guests : [],
      loveStory: Array.isArray(parsed.loveStory) ? parsed.loveStory : defaults.loveStory,
      config: { ...defaults.config, ...parsed.config },
    };
  } catch {
    return createDefaultWeddingData();
  }
}

export function saveWeddingData(data: WeddingData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function safeText(value: unknown, max = 400): string {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

export function formatDateID(dateStr?: string): string {
  if (!dateStr) return 'Tanggal belum diatur';
  const date = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'Tanggal belum diatur';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function isValidMapsUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return (
      parsed.protocol === 'https:' &&
      (/(^|\.)google\.com$/.test(parsed.hostname) || parsed.hostname === 'maps.app.goo.gl')
    );
  } catch {
    return false;
  }
}

export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }
    if (file.size > 1_200_000) {
      reject(new Error('Ukuran foto maksimal 1,2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file gambar.'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}
