-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. users
CREATE TABLE public.ku_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nama text,
  nomor_telepon text,
  role text CHECK (role IN ('admin','penguji')),
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- 2. daerah
CREATE TABLE public.ku_daerah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  wilayah text CHECK (wilayah IN ('barat','timur')),
  created_at timestamp DEFAULT now()
);

-- 3. settings
CREATE TABLE public.ku_settings (
  tipe text PRIMARY KEY CHECK (tipe IN ('evaluasi','seleksi')),
  metadata_fields jsonb NOT NULL
);

-- Initialize settings
INSERT INTO public.ku_settings (tipe, metadata_fields) VALUES ('evaluasi', '[]');
INSERT INTO public.ku_settings (tipe, metadata_fields) VALUES ('seleksi', '[]');

-- 4. tes
CREATE TABLE public.ku_tes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipe text CHECK (tipe IN ('evaluasi','seleksi')),
  nama text,
  deskripsi text,
  "order" int,
  is_active boolean DEFAULT true,
  tipe_penilaian text CHECK (tipe_penilaian IN ('berbobot','statis')),
  rentang_nilai jsonb,
  pembagi_final numeric,
  batas_kelulusan numeric,
  label_lulus text,
  label_tidak_lulus text,
  catatan_akhir_aktif boolean,
  catatan_akhir_wajib boolean,
  pertanyaan jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 5. peserta
CREATE TABLE public.ku_peserta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text,
  usia int,
  daerah_id uuid REFERENCES public.ku_daerah(id),
  pekerjaan text,
  nomor_telepon text,
  tipe_peserta text CHECK (tipe_peserta IN ('evaluasi','seleksi')),
  metadata jsonb,
  created_by uuid REFERENCES public.ku_users(id),
  created_at timestamp DEFAULT now()
);

-- 6. hasil_tes
CREATE TABLE public.ku_hasil_tes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peserta_id uuid REFERENCES public.ku_peserta(id) ON DELETE CASCADE,
  tipe_tes text CHECK (tipe_tes IN ('evaluasi','seleksi')),
  tes_id uuid REFERENCES public.ku_tes(id),
  penguji_uid uuid REFERENCES public.ku_users(id),
  tanggal_tes timestamp DEFAULT now(),
  snapshot_tes jsonb NOT NULL,
  jawaban jsonb NOT NULL,
  skor_akhir numeric,
  is_lulus boolean,
  label_hasil text,
  catatan_akhir text
);

-- Enable Row Level Security
ALTER TABLE public.ku_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ku_daerah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ku_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ku_tes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ku_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ku_hasil_tes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admin Full Access Policy
CREATE POLICY "admin full access on users" ON public.ku_users FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));
CREATE POLICY "admin full access on daerah" ON public.ku_daerah FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));
CREATE POLICY "admin full access on settings" ON public.ku_settings FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));
CREATE POLICY "admin full access on tes" ON public.ku_tes FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));
CREATE POLICY "admin full access on peserta" ON public.ku_peserta FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));
CREATE POLICY "admin full access on hasil_tes" ON public.ku_hasil_tes FOR ALL USING (auth.uid() IN (SELECT id FROM public.ku_users WHERE role = 'admin'));

-- Read Public Data policies (Authenticated users can read)
CREATE POLICY "authenticated read on users" ON public.ku_users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read on daerah" ON public.ku_daerah FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read on tes" ON public.ku_tes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read on settings" ON public.ku_settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read on peserta" ON public.ku_peserta FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated read on hasil_tes" ON public.ku_hasil_tes FOR SELECT USING (auth.role() = 'authenticated');

-- Peserta Policies (Insert)
CREATE POLICY "insert peserta" ON public.ku_peserta FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Hasil Tes Policies (Insert)
CREATE POLICY "insert hasil" ON public.ku_hasil_tes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
