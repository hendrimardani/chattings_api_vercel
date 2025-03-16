CREATE TABLE notifications(
  id SERIAL PRIMARY KEY,
  is_status BOOLEAN DEFAULT FALSE NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');