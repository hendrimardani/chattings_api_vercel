CREATE TABLE groups(
  id SERIAL PRIMARY KEY,
  nama_group VARCHAR(50) NOT NULL,
  deksripsi TEXT NOT NULL,
  gambar_profile TEXT NULL,
  gambar_banner TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');