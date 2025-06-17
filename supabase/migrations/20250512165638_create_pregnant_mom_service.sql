-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE pregnant_mom_service(
  id SERIAL PRIMARY KEY,
  pemeriksaan_id INTEGER NOT NULL,
  hari_pertama_haid_terakhir DATE NOT NULL,
  umur_kehamilan VARCHAR(50) NOT NULL,
  status_gizi_kesehatan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_pemeriksaan FOREIGN KEY (pemeriksaan_id) REFERENCES checks(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');