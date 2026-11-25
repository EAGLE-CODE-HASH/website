export type ThemeKey = 'classic' | 'floral' | 'heritage';

export interface WeddingInfo {
  id: string;
  namaPria: string;
  namaWanita: string;
  fotoPria: string;
  fotoWanita: string;
  deskripsi: string;
  tema: ThemeKey;
}

export interface WeddingEvent {
  id: string;
  namaAcara: string;
  tanggal: string;
  waktu: string;
  zonaWaktu: 'WIB' | 'WITA' | 'WIT';
  lokasi: string;
  alamat: string;
  mapsUrl: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
}

export interface LoveStoryItem {
  id: string;
  tanggal: string;
  judul: string;
  deskripsi: string;
  imageUrl?: string;
}

export interface GuestEntry {
  id: string;
  namaAlias: string;
  statusKehadiran: string;
  jumlahTamu: number;
  ucapan: string;
  createdAt?: string;
}

export interface WeddingConfig {
  tema: ThemeKey;
  warnaUtama: string;
  musikUrl: string;
  coverImage: string;
  pesanPembuka: string;
}

export interface WeddingData {
  wedding: WeddingInfo;
  events: WeddingEvent[];
  gallery: GalleryItem[];
  guests: GuestEntry[];
  loveStory: LoveStoryItem[];
  config: WeddingConfig;
}
