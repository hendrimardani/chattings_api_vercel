CREATE TABLE child_service(
  id SERIAL PRIMARY KEY,
  umur_anak_dalam_bulan VARCHAR(50) NOT NULL,
  tinggi_cm VARCHAR(3) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');