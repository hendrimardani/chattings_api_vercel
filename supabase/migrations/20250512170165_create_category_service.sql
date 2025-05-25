CREATE TABLE category_service(
  id SERIAL PRIMARY KEY,
  category_service_id INTEGER UNIQUE NOT NULL,
  nama_layanan VARCHAR(50) NOT NULL,

  CONSTRAINT fk_child_service FOREIGN KEY (category_service_id) REFERENCES child_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_pregnant_mom_service FOREIGN KEY (category_service_id) REFERENCES pregnant_mom_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_bride_and_groom FOREIGN KEY (category_service_id) REFERENCES bride_and_groom_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_young_women_service FOREIGN KEY (category_service_id) REFERENCES young_women_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_family_service FOREIGN KEY (category_service_id) REFERENCES family_service(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');