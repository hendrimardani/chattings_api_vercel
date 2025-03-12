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

  async getUserByEmail({ email }) {
    const { data, error } = await this._supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    const dataLoginByEmail = data;

    return dataLoginByEmail;
  }

  async login({ email, password }) {
    const dataLoginByEmail = await this.getUserByEmail({ email });

    // console.log('login: ', dataLoginByEmail);
    const isValidPassword = await bcrypt.compare(password, dataLoginByEmail.password);

    if (!isValidPassword) {
      throw new InvariantError('Email atau password salah');
    }
    return dataLoginByEmail;
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
      .insert([{ nama_group, created_at, updated_at }])
      .select()
      .maybeSingle();

    // console.log('addGroup ID: ', data, error);

    return data;
  }

  async getUserProfileById({ user_profile_id }) {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*')
      .eq('id', user_profile_id)
      .maybeSingle();

    if (data === null) {
      throw new NotFoundError('Pengguna tidak ada');
    }

    const dataUserProfileByid = data;
    return dataUserProfileByid;
  }

  async addUserGroup({ user_profile_id, group_id, total_group }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const dataUserProfileByid = await this.getUserProfileById({ user_profile_id });

    // console.log('addUserGroup: ', dataUserProfileByid);
    if (dataUserProfileByid === null) {
      throw new NotFoundError('Pengguna tidak ada');
    }

    await this._supabase
      .from('user_group')
      .insert([{ user_profile_id, group_id, total_group, created_at, updated_at }])
      .select('*')
      .maybeSingle();
  }

  async getGroups() {
    const { data, error } = await this._supabase
      .from('groups')
      .select('*');

    return data;
  }

  async addNotification({ is_status }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const { data, error } = await this._supabase
      .from('notifications')
      .insert([{ is_status, created_at, updated_at }])
      .select('*')
      .maybeSingle();
    
    return data;
  }

  async getGroupById({ group_id }) {
    const { data, error } = await this._supabase
      .from('groups')
      .select('*')
      .eq('id', group_id)
      .maybeSingle();

    if (data === null) {
      throw new NotFoundError('Group tidak ada');
    }

    const dataGroupByid = data;
    return dataGroupByid;
  }

  async getNotificationById({ notification_id }) {
    const { data, error } = await this._supabase
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .maybeSingle();

    const dataNotificationById = data;
    return dataNotificationById;
  }

  async addMessage({ user_profile_id, group_id, notification_id, isi_pesan }) {
    // 2025-03-10 02:25:09
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const dataUserProfileByid = await this.getUserProfileById({ user_profile_id });
    const dataGroupByid = await this.getGroupById({ group_id });
    const dataNotificationById = await this.getNotificationById({ notification_id });

    // console.log('addMessage: ', dataUserProfileByid);
    // console.log('addMessage: ', dataGroupByid);
    // console.log('addMessage: ', dataNotificationById);

    if (dataUserProfileByid === null) {
      throw new NotFoundError('Pengguna tidak ada');
    }
    if (dataGroupByid === null) {
      throw new NotFoundError('Group tidak ada');
    }
    if (dataNotificationById === null) {
      throw new NotFoundError('Notifikasi tidak ada');
    }

    await this._supabase
      .from('messages')
      .insert([{ user_profile_id, group_id, notification_id, isi_pesan, created_at, updated_at }])
      .select('*')
      .maybeSingle();
  }
}

module.exports = ChattingsService;