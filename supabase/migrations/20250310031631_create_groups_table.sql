CREATE TABLE groups(
  id SERIAL PRIMARY KEY,
  nama_group VARCHAR(50) NOT NULL,
  deksripsi TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');