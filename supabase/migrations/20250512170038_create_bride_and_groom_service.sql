-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE bride_and_groom_service(
  id SERIAL PRIMARY KEY,
  perkiraan_tgl_pernikahan DATE NOT NULL,
  periksa_kesehatan choice NOT NULL,
  bimbingan_perkawinan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');