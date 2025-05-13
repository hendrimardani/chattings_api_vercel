CREATE TABLE services(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_patient_id INTEGER NOT NULL,
  category_service_id INTEGER NOT NULL,
  child_service_id INTEGER NOT NULL,
  pregnant_mom_service_id INTEGER NOT NULL,
  bride_and_groom_service_id INTEGER NOT NULL,
  young_women_service_id INTEGER NOT NULL,
  family_service_id INTEGER NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_profile_patient_id FOREIGN KEY (user_patient_id) REFERENCES user_profile_patient(user_patient_id) ON DELETE CASCADE,
  CONSTRAINT fk_category_service FOREIGN KEY (category_service_id) REFERENCES category_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_child_service FOREIGN KEY (child_service_id) REFERENCES child_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_pregnant_mom_service FOREIGN KEY (pregnant_mom_service_id) REFERENCES pregnant_mom_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_bride_and_groom_service FOREIGN KEY (bride_and_groom_service_id) REFERENCES bride_and_groom_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_young_women_service FOREIGN KEY (young_women_service_id) REFERENCES young_women_service(id) ON DELETE CASCADE,
  CONSTRAINT fk_family_service FOREIGN KEY (family_service_id) REFERENCES family_service(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');