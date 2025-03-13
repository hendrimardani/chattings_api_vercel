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
  umur: Joi.number().integer(),
  tgl_lahir: Joi.date().required(),
});

const messagesSchema = Joi.object({
  isi_pesan: Joi.string().required(),
});

const groupSchema = Joi.object({
  nama_group: Joi.string().min(3).required(),
});

module.exports = { registerSchema, loginSchema, userProfileSchema, messagesSchema, groupSchema };