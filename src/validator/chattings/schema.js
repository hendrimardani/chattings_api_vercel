const Joi = require('joi');

const registerSchema = Joi.object({
  nama: Joi.string().min(3).required(),
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  repeat_password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string().min(3).required(),
});

const userProfileSchema = Joi.object({
  nama: Joi.string().min(3).required(),
  nik: Joi.string().length(16),
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  umur: Joi.number().integer().max(2),
  tgl_lahir: Joi.date().required(),
});

const notificationsSchema = Joi.object({
  is_status: Joi.boolean(),
});

const groupsSchema = Joi.object({
  nama_group: Joi.string().min(3).required(),
});

const messagesSchema = Joi.object({
  user_profile_id: Joi.number().integer().required(),
  notification_id: Joi.number().integer().required(),
  group_id: Joi.number().integer().required(),
  isi_pesan: Joi.string().min(1).required(),
});

const userGroupSchema = Joi.object({
  user_profile_id: Joi.number().integer().required(),
  group_id: Joi.number().integer().required(),
  total_group: Joi.number().integer().required(),
});

module.exports = { registerSchema, loginSchema, userProfileSchema, notificationsSchema, groupsSchema, messagesSchema, userGroupSchema };