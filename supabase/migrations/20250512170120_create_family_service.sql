-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE family_service(
  id SERIAL PRIMARY KEY,
  pemeriksaan_id INTEGER NOT NULL,
  kategori_keluarga_rentan choice NOT NULL,
  memiliki_kartu_keluarga choice NOT NULL,
  memiliki_jamban_sehat choice NOT NULL,
  memiliki_sumber_air_bersih choice NOT NULL,
  peserta_jaminan_sosial choice NOT NULL,
  memiliki_akses_sanitasi_pembuangan_limbah_layak choice NOT NULL,
  pendampingan_keluarga_oleh_tpk choice NOT NULL,
  peserta_kegiatan_ketahanan_pangan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL

  CONSTRAINT fk_pemeriksaan FOREIGN KEY (pemeriksaan_id) REFERENCES checks(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');