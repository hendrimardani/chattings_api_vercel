CREATE TYPE role AS ENUM ('pasien', 'pegawai');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');