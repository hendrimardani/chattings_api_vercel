const { supabase } = require('./connections');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const bcrypt = require('bcrypt');

class ChattingsService {
  constructor() {
    this._supabase = supabase;
  }

  async addUser({ email, password, repeat_password }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    if (password !== repeat_password) {
      throw new ClientError('Kolom password dan kolom repeat password harus sama');
    }

    // Hash
    const saltRounds = 10;
    password = await bcrypt.hash(password, saltRounds);

    const { data, error } = await this._supabase
      .from('users')
      .insert([{ email, password, created_at, updated_at }])
      .select()
      .maybeSingle();

    // console.log('addUser: ', data, error);
    if (error && error.code === '23505') {
      throw new ClientError('Email sudah digunakan');
    } else if (error && error.code === '23502') {
      throw new InvariantError('Pengguna gagal ditambahkan. Pastikan tidak ada data yang kosong');
    }
    return data;
  }

  async addUserProfile({ id, nama, email, hashedPassword }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    await this._supabase
      .from('user_profile')
      .insert([{ id, nama, email, password: hashedPassword, created_at, updated_at }])
      .select();
  }

  async login({ email, password }) {
    const { data, error } = await this._supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    // console.log('login: ', data, error);
    const isValidPassword = await bcrypt.compare(password, data.password);

    if (!isValidPassword) {
      throw new InvariantError('Email atau password salah');
    }
    return data;
  }

  async editUserProfileById({ id, nama, nik, umur, tgl_lahir }) {
    const updateAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const { data, error } = await this._supabase
      .from('user_profile')
      .update({
        nama: nama,
        nik: nik,
        umur: umur,
        tgl_lahir: tgl_lahir,
        updated_at: updateAt
      })
      .eq('user_id', id)
      .select();

    // console.log('editUserProfileByid: ', data, error);
    if (error && error.code === '23505') {
      throw new ClientError('NIK atau email sudah digunakan');
    }
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui profile. Id tidak ditemukan');
    }
  }

  async getUsers() {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*');

    return data;
  }

  async addGroup({ nama_group }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const { data, error } = await this._supabase
        .from('groups')
        .insert({ nama_group, created_at, updated_at })
        .select()
        .maybeSingle();

    // console.log('addGroup ID: ', data, error);

    return data;
  }

  async addUserGroup({ user_profile_id, group_id, total_group }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const { data, error } = await this._supabase
        .from('user_profile')
        .select('*')
        .eq('id', user_profile_id)
        .maybeSingle();

    console.log('addUserGroup: ', typeof data, error);
    if (data === null) {
      throw new NotFoundError('Pengguna tidak ada');
    }
    
    await this._supabase
        .from('user_group')
        .insert({ user_profile_id, group_id, total_group, created_at, updated_at })
        .select('*')
        .maybeSingle();
  }

  async getGroups() {
    const { data, error } = await this._supabase
        .from('groups')
        .select('*');

    return data;
  }
}

module.exports = ChattingsService;