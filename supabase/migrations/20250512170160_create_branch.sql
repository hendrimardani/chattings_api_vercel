CREATE TABLE branch(
  id SERIAL PRIMARY KEY,
  nama_cabang VARCHAR(50) NOT NULL,
  no_tlp VARCHAR(20) NOT NULL,
  alamat TEXT NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');