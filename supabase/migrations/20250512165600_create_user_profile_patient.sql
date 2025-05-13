CREATE TABLE user_profile_patient(
  id SERIAL PRIMARY KEY,
  user_patient_id INTEGER UNIQUE NOT NULL,
  children_patient_id INTEGER NOT NULL,
  nama_ayah VARCHAR(50) NULL,
  nama_bumil VARCHAR(50) NULL,
  nik_bumil VARCHAR(16) unique null,
  tgl_lahir_bumil DATE NULL,
  umur_bumil VARCHAR(50) NULL,
  gambar_profile TEXT NULL,
  gambar_banner TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_users FOREIGN KEY (user_patient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_children_patient FOREIGN KEY (children_patient_id) REFERENCES children_patient(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');