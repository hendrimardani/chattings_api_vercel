const { supabase } = require('./connections');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');

class ChattingsService {
  constructor() {
    this._supabase = supabase;
  }

  async addUser({ email, password }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
    const updated_at = created_at;
    const { data, error } = await this._supabase
                              .from('users')
                              .insert([{ email, password, created_at, updated_at }])
                              .select();
    // console.log('addUser:', data, error);
      if (error && error.code === '23505') {
        throw new ClientError('NIK atau email sudah digunakan');
      } else if (error && error.code === '23502') {
        throw new InvariantError('Pengguna gagal ditambahkan. Pastikan tidak ada data yang kosong');
      }
    return data;
  }

  async addUserProfile({ user_id, nama, nik, email, password, umur, tgl_lahir }) {
      // 2025-03-10 02:25:09
      const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
      const updated_at = created_at;
      const { data, error } = await this._supabase
                                .from('user_profile')
                                .insert([{ user_id, nama, nik, email, password, umur, tgl_lahir, created_at, updated_at }])
                                .select();
    // console.log('addUserProfile:', data, error);
    if (error && error.code === '23505') {
      throw new ClientError('NIK atau email sudah digunakan');
    } else if (error && error.code === '23502') {
      throw new InvariantError('Pengguna gagal ditambahkan. Pastikan tidak ada data yang kosong');
    }
    return data;
  }
}

module.exports = ChattingsService;