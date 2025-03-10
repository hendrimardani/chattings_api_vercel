CREATE TABLE messages(
  id SERIAL PRIMARY KEY,
  user_profile_id INTEGER NOT NULL,
  notification_id INTEGER NOT NULL,
  group_id INTEGER NOT NULL,
  isi_pesan TEXT NOT NULL,
  created_at DATE NOT NULL,
  updated_at DATE NOT NULL,

  CONSTRAINT fk_user_profile FOREIGN KEY (user_profile_id) REFERENCES user_profile(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  CONSTRAINT fk_groups FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Atur auto increment
ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');