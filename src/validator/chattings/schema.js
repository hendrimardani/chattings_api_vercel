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

const childrenPatientSchema = Joi.object({
  nama_anak: Joi.string().min(3).required(),
  nik_anak: Joi.string().length(16).required(),
  jenis_kelamin_anak: Joi.string().valid('laki-laki', 'perempuan').required(),
  tgl_lahir_anak: Joi.date().required(),
  umur_anak: Joi.string().required(),
});

const userGroupSchema = Joi.object({
  user_id: Joi.array().items(Joi.number()),
  role: Joi.string().valid('member', 'admin').required(),
});


const messagesSchema = Joi.object({
  isi_pesan: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, childrenPatientSchema, userGroupSchema, messagesSchema };