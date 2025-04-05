CREATE TYPE gender AS ENUM ('laki-laki', 'perempuan');

CREATE TABLE user_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  nama VARCHAR(50) NOT NULL,
  jenis_kelamin gender NULL,
  nik VARCHAR(16) UNIQUE NULL,
  umur INTEGER NULL,
  tgl_lahir DATE NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()

  -- Menetapkan user_id sebagai Foreign Key yang terhubung ke users(id)
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');