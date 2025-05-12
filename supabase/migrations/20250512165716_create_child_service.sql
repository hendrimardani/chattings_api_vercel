-- CREATE TYPE gender AS ENUM ('laki-laki', 'perempuan');

CREATE TABLE child_service(
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  jenis_kelamin gender NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  tgl_lahir DATE NOT NULL,
  umur_bulan VARCHAR(5) NOT NULL,
  tinggi_cm VARCHAR(3) NOT NULL,
  nama_orang_tua VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');