-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE bride_and_groom_service(
  id SERIAL PRIMARY KEY,
  pemeriksaan_id INTEGER not NULL,
  perkiraan_tgl_pernikahan DATE NOT NULL,
  periksa_kesehatan choice NOT NULL,
  bimbingan_perkawinan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL

  CONSTRAINT fk_pemeriksaan FOREIGN KEY (pemeriksaan_id) REFERENCES checks(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');