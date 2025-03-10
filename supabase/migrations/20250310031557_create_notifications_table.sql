CREATE TABLE notifications(
  id SERIAL PRIMARY KEY,
  isi_notifikasi TEXT NOT NULL,
  is_status BOOLEAN DEFAULT FALSE NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');