CREATE TABLE child_service(
  id SERIAL PRIMARY KEY,
  tinggi_cm VARCHAR(3) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');