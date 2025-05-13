-- CREATE TYPE choice AS ENUM ('ya', 'tidak');

CREATE TABLE pregnant_mom_service(
  id SERIAL PRIMARY KEY,
  status_gizi_kesehatan choice NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');