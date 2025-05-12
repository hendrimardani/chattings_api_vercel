CREATE TYPE choice AS ENUM ('YA', 'TIDAK');

CREATE TABLE pregnant_mom_service(
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  tgl_lahir DATE NOT NULL,
  umur VARCHAR(50) NOT NULL,
  hari_pertama_haid_terakhir DATE NOT NULL,
  tgl_perkiraan_lahir DATE NOT NULL,
  umur_kehamilan VARCHAR(50) NOT NULL,
  status_gizi_kesehatan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');