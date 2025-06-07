-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE young_women_service(
  id SERIAL PRIMARY KEY,
  pemeriksaan_id INTEGER NOT NULL,
  mendapat_ttd choice NOT NULL,
  periksa_anemia choice NOT NULL,
  hasil_periksa_anemia choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL

  CONSTRAINT fk_pemeriksaan FOREIGN KEY (pemeriksaan_id) REFERENCES checks(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');