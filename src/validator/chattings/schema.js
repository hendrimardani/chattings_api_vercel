const Joi = require('joi');

const registerSchema = Joi.object({
  nama: Joi.string().min(3).required(),
  email: Joi.string().email().min(3).max(30).required(),
  role: Joi.string().valid('pasien', 'petugas').required(),
  nama_cabang: Joi.string().required(),
  password: Joi.string().min(6).required(),
  repeat_password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});


const pregnantMomService = Joi.object({
  nama: Joi.string().min(3).required(),
  nik: Joi.string().length(16).required(),
  tgl_lahir: Joi.date().required(),
  umur: Joi.string().max(3).required(),
  hari_pertama_haid_terakhir: Joi.date().required(),
  tgl_perkiraan_lahir: Joi.date().required(),
  umur_kehamilan: Joi.string().required(),
});

const userGroupSchema = Joi.object({
  user_id: Joi.array().items(Joi.number()),
  role: Joi.string().valid('member', 'admin').required(),
});


const messagesSchema = Joi.object({
  isi_pesan: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, userGroupSchema, messagesSchema };