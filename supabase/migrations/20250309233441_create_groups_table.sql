CREATE TABLE groups(
  id SERIAL PRIMARY KEY,
  nama_group VARCHAR(50) NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL
);