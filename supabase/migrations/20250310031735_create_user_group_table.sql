CREATE TABLE user_group(
  user_profile_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  role VARCHAR(50) DEFAULT member NOT NULL,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_user_profile FOREIGN KEY (user_profile_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  CONSTRAINT fk_groups FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');