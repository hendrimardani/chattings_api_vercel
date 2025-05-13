-- CREATE TYPE choiceService AS ENUM ('bumil', 'anak', 'calon pengantin', 'remaja putri', 'keluarga');

CREATE TABLE category_service(
  id SERIAL PRIMARY KEY,
  nama_layanan choiceService NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');