CREATE TYPE gender AS ENUM ('laki-laki', 'perempuan');

CREATE TABLE user_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  branch_id INTEGER NOT NULL,
  nama VARCHAR(50) NOT NULL,
  jenis_kelamin gender NULL,
  alamat TEXT NULL,
  nik VARCHAR(16) UNIQUE NULL,
  umur VARCHAR(2) NULL,
  tgl_lahir DATE NULL,
  gambar_profile TEXT NULL,
  gambar_banner TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL

  -- Menetapkan user_id sebagai Foreign Key yang terhubung ke users(id)
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');