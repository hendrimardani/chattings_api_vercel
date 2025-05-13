-- CREATE TYPE gender AS ENUM ('laki-laki', 'perempuan');

CREATE TABLE children_patient(
  id SERIAL PRIMARY KEY,
  nama_anak VARCHAR(50) NULL,
  nik_anak VARCHAR(16) UNIQUE NULL,
  tgl_lahir VARCHAR(50) NULL,
  jenis_kelamin_anak gender NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');