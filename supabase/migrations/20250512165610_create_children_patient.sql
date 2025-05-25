-- CREATE TYPE gender AS ENUM ('laki-laki', 'perempuan');

CREATE TABLE children_patient(
  id SERIAL PRIMARY KEY,
  user_patient_id INTEGER NOT NULL,
  nama_anak VARCHAR(50) NULL,
  nik_anak VARCHAR(16) UNIQUE NULL,
  tgl_lahir DATE NULL,
  umur_anak VARCHAR(50) NULL,
  jenis_kelamin_anak gender NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_user_profile_patient FOREIGN KEY (user_patient_id) REFERENCES user_profile_patient(user_patient_id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');