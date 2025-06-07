CREATE TABLE category_service(
  id SERIAL PRIMARY KEY,
  nama_layanan VARCHAR(50) NOT NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');