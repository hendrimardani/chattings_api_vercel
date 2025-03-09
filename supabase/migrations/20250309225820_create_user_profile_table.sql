CREATE TABLE user_profile (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  nama VARCHAR(50) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, 
  umur INTEGER NOT NULL,
  tgl_lahir DATE NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,

  -- Menetapkan user_id sebagai Foreign Key yang terhubung ke users(id)
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
