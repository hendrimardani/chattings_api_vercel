CREATE TABLE checks(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  children_patient_id INTEGER NOT NULL,
  category_service_id INTEGER NOT NULL,
  branch_id INTEGER NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,

  CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES user_profile(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_children_patient FOREIGN KEY (children_patient_id) REFERENCES children_patient(id) ON DELETE CASCADE,
  CONSTRAINT fk_category_service FOREIGN KEY (category_service_id) REFERENCES category_service(category_service_id) ON DELETE CASCADE,
  CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');