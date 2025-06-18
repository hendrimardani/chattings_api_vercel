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

const childServiceSchema = Joi.object({
  category_service_id: Joi.number().required(),
  catatan: Joi.string(),
  nama_anak: Joi.string().required(),
  nik_anak: Joi.string().required(),
  jenis_kelamin_anak: Joi.string().valid('laki-laki', 'perempuan').required(),
  tgl_lahir_anak: Joi.string().required(),
  umur_anak: Joi.string().required(),
  tinggi_cm: Joi.string().required(),
  hasil_pemeriksaan: Joi.string().required(),
});

const pregnantMomServiceSchema = Joi.object({
  category_service_id: Joi.number().required(),
  catatan: Joi.string(),
  nama_bumil: Joi.string().required(),
  hari_pertama_haid_terakhir: Joi.string().required(),
  tgl_perkiraan_lahir: Joi.string().required(),
  umur_kehamilan: Joi.string().required(),
  status_gizi_kesehatan: Joi.string().valid('YA', 'TIDAK').required(),
});

const userProfilePatientSchema = Joi.object({
  nama_bumil: Joi.string().required(),
  nik_bumil: Joi.string().length(16).required(),
  tgl_lahir_bumil: Joi.string().required(),
  umur_bumil: Joi.string().required(),
  alamat: Joi.string().required(),
  nama_ayah: Joi.string().required(),
  nama_cabang: Joi.string().required(),
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

module.exports = { registerSchema, loginSchema, childServiceSchema, pregnantMomServiceSchema, userProfilePatientSchema, childrenPatientSchema, userGroupSchema, messagesSchema };