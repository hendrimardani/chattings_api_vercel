CREATE TABLE groups(
  id SERIAL PRIMARY KEY,
  nama_group VARCHAR(50) NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');