-- CREATE TYPE children_check_result AS ENUM ('NORMAL', 'STUNTING KURUS', 'STUNTING', 'STUNTING TINGGI');

CREATE TABLE child_service(
  id SERIAL PRIMARY KEY,
  pemeriksaan_id INTEGER NOT NULL,
  tinggi_cm VARCHAR(3) NOT NULL,
  hasil_pemeriksaan children_check_result NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL

  CONSTRAINT fk_pemeriksaan FOREIGN KEY (pemeriksaan_id) REFERENCES checks(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');