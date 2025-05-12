-- CREATE TYPE choice AS ENUM ('YA', 'TIDAK');

CREATE TABLE bride_and_groom_service(
  id SERIAL PRIMARY KEY,
  nama_catin_perempuan VARCHAR(50) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  tgl_lahir DATE NOT NULL,
  umur VARCHAR(50) NOT NULL,
  perkiraan_tgl_pernikahan DATE NOT NULL,
  bimbingan_perkawinan choice NOT NULL,
  periksa_kesehatan choice NOT NULL,  
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');