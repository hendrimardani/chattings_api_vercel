CREATE TABLE user_group(
  user_profile_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  total_group INTEGER NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,

  CONSTRAINT fk_user_profile FOREIGN KEY (user_profile_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  CONSTRAINT fk_groups FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');