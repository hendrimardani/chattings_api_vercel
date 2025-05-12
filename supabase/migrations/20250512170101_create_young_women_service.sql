-- CREATE TYPE choice AS ENUM ('YA', 'TIDAK');

CREATE TABLE young_women_service(
  id SERIAL PRIMARY KEY,
  nama VARCHAR(50) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  tgl_lahir DATE NOT NULL,
  umur VARCHAR(50) NOT NULL,
  mendapat_ttd choice NOT NULL,
  periksa_anemia choice NOT NULL,
  hasil_periksa_anemia choice not NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');