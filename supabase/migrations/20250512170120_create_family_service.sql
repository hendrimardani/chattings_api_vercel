-- CREATE TYPE choice AS ENUM ('YA', 'TIDAK');

CREATE TABLE family_service(
  id SERIAL PRIMARY KEY,
  nama_kepala_keluarga VARCHAR(50) NOT NULL,
  alamat TEXT NOT NULL,
  nama_anak VARCHAR(50) NOT NULL,
  nama_bumil VARCHAR(50) NOT NULL,
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
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');