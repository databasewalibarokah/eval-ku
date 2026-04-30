export interface User {
  id: string; // From auth.users
  email: string;
  nama: string;
  nomor_telepon: string;
  role: "admin" | "penguji";
  is_active: boolean;
  created_at: string;
}

export interface Daerah {
  id: string;
  nama: string;
  wilayah: "barat" | "timur";
  created_at: string;
}

export interface MetadataFieldConfig {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  is_required: boolean;
  group?: string;
  order: number;
}

export interface Settings {
  tipe: 'evaluasi' | 'seleksi';
  metadata_fields: MetadataFieldConfig[];
}

export interface RentangNilai {
  nilai: number;
  label: string;
}

export interface Pertanyaan {
  id: string;
  teks_utama: string;
  teks_sub?: string;
  bobot: number;
  catatan_aktif: boolean;
  catatan_wajib: boolean;
  order: number;
}

export interface Tes {
  id: string; // Changed from tes_id
  tipe: "evaluasi" | "seleksi";
  nama: string;
  deskripsi: string;
  order: number;
  is_active: boolean;
  tipe_penilaian: "berbobot" | "statis";
  rentang_nilai: RentangNilai[];
  pembagi_final: number;
  batas_kelulusan: number;
  label_lulus: string;
  label_tidak_lulus: string;
  catatan_akhir_aktif: boolean;
  catatan_akhir_wajib: boolean;
  pertanyaan: Pertanyaan[];
  created_at: string;
  updated_at: string;
}

export interface Peserta {
  id: string;
  nama: string;
  usia: number;
  daerah_id: string;
  pekerjaan: string;
  nomor_telepon: string;
  tipe_peserta: "evaluasi" | "seleksi";
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
}

export interface JawabanItem {
  pertanyaan_id: string;
  teks_pertanyaan: string;
  nilai: number;
  catatan?: string;
}

export interface HasilTes {
  id: string; // Changed from hasil_id
  peserta_id: string;
  tipe_tes: "evaluasi" | "seleksi";
  tes_id: string;
  penguji_uid: string;
  tanggal_tes: string;
  snapshot_tes: Omit<Tes, "created_at" | "updated_at">;
  jawaban: JawabanItem[];
  skor_akhir: number;
  is_lulus: boolean;
  label_hasil: string;
  catatan_akhir?: string;
}
