CREATE TABLE user_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  nama VARCHAR(50) NOT NULL,
  nik VARCHAR(16) UNIQUE NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, 
  umur INTEGER NULL,
  tgl_lahir DATE NULL,
  created_at DATE NULL,
  updated_at DATE NULL,

  -- Menetapkan user_id sebagai Foreign Key yang terhubung ke users(id)
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');