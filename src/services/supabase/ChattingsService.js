const { supabase } = require('./connections');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const bcrypt = require('bcrypt');
const { format } = require('date-fns');

class ChattingsService {
  constructor() {
    this._supabase = supabase;
  }

  async addUser({ email, password, repeat_password }) {
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
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

  async addUserProfile({ id, nama }) {
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const updated_at = created_at;

    const { data, error } =  await this._supabase
      .from('user_profile')
      .insert([{ user_id: id, nama, created_at, updated_at }])
      .select()
      .maybeSingle();
      
      // console.log('addUserProfile', data, error);
    return data;
  }

  async getUserByEmail({ email }) {
    const { data, error } = await this._supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    // console.log('getUserByEmail', data, error);
    if (data === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const dataLoginByEmail = data;

    return dataLoginByEmail;
  }

  async login({ email, password }) {
    const dataLoginByEmail = await this.getUserByEmail({ email });
    const user_profile_id = dataLoginByEmail.id;

    // console.log('login: ', dataLoginByEmail);
    const isValidPassword = await bcrypt.compare(password, dataLoginByEmail.password);

    if (!isValidPassword) {
      throw new InvariantError('Email atau password salah');
    }
    const dataLoginUserProfile = await this.getUserProfileById({ user_profile_id });
    return dataLoginUserProfile;
  }

  async editUserProfileById({ id, nama, nik, umur, jenis_kelamin, tgl_lahir }) {
    // console.log(id, nama, nik, umur, tgl_lahir);
    const updateAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const { data, error } = await this._supabase
      .from('user_profile')
      .update({
        nama: nama,
        nik: nik,
        umur: umur,
        jenis_kelamin: jenis_kelamin,
        tgl_lahir: tgl_lahir,
        updated_at: updateAt
      })
      .eq('user_id', id)
      .select('');

    // console.log('editUserProfileByid: ', data, error);
    if (error && error.code === '23505') {
      throw new ClientError('NIK atau email sudah digunakan');
    }
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui profile. Id tidak ditemukan');
    }
  }

  async deleteUserById({ id }) {
    const { data, error } = await this._supabase
      .from('users')
      .delete()
      .select()
      .eq('id', id);

    // console.log('deleteUserById: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memghapus pengguna. Id tidak ditemukan');
    }
  }

  async getUsers() {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*, users(*)');

    return data;
  }

  async addGroup({ nama_group, deskripsi }) {
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const updated_at = created_at;

    const { data, error } = await this._supabase
      .from('groups')
      .insert([{ nama_group, deskripsi, created_at, updated_at }])
      .select()
      .maybeSingle();

    // console.log('addGroup ID: ', data, error);

    return data;
  }

  async getUserProfileById({ user_profile_id }) {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user_profile_id)
      .maybeSingle();

    // console.log('getUserProfileById', data);

    if (data === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const dataUserProfileById = data;
    return dataUserProfileById;
  }

  async addUserGroup({ user_profile_id, group_id, role, created_by }) {
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const updated_at = created_at;

    const dataUserProfileById = await this.getUserProfileById({ user_profile_id });

    // console.log('addUserGroup: ', dataUserProfileById);
    if (dataUserProfileById === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const { data, error } = await this._supabase
      .from('user_group')
      .insert([{ user_profile_id, group_id, role, created_by, created_at, updated_at }])
      .select('user_profile_id, group_id, role, created_by')
      .maybeSingle();

    if (data === null) {
        throw new NotFoundError('Group tidak ditemukan');
    }
    return data;
  }

  async getUserGroupByUserId({ user_id }) {
    const { data, error } = await this._supabase
      .from('user_group')
      .select('*, user_profile(*), groups(*)')
      .eq('user_profile_id', user_id);

    // console.log('getUserGroupByUserId', data);

    if (data === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const dataUserGroupByUserId = data;
    return dataUserGroupByUserId;
  }

  async getUserGroupByUserIdGroupId({ user_id, group_id }) {
    const { data, error } = await this._supabase
      .from('user_group')
      .select('*')
      .eq('user_profile_id', user_id)
      .eq('group_id', group_id);

    // console.log('getUserGroupByUserIdGroupId : ', data, error);

    if (data.length > 0) {
      throw new ClientError('Pengguna sudah ada di group');
    }
    const dataUserGroupByUserIdGroupId = data;
    return dataUserGroupByUserIdGroupId;
  }

  async editGroupById({ group_id, nama_group, deskripsi }) {
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data, error } = await this._supabase
      .from('groups')
      .update({
        nama_group: nama_group,
        deskripsi: deskripsi,
        updated_at: updated_at,
      })
      .eq('id', group_id)
      .select('id, nama_group');

    // console.log('editUserGroup: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui pesan. Id tidak ditemukan');
    }
  }

  async deleteGroupById({ id }) {
    const { data, error } = await this._supabase
      .from('groups')
      .delete()
      .eq('id', id)
      .select();

    // console.log('deleteGroupById: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memghapus group. Id tidak ditemukan');
    }
  }

  async addNotification({ is_status }) {
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const updated_at = created_at;

    const { data, error } = await this._supabase
      .from('notifications')
      .insert([{ is_status, created_at, updated_at }])
      .select('*')
      .maybeSingle();

    return data;
  }

  async getUserGroups() {
    const { data, error } = await this._supabase
      .from('user_group')
      .select('groups(*), user_profile(*)');  // Memanggil 2 parent entitas

    console.log('getUserGroups', data, error);
    return data;
  }

  async getGroupById({ group_id }) {
    const { data, error } = await this._supabase
      .from('groups')
      .select('*')
      .eq('id', group_id)
      .maybeSingle();

    if (data === null) {
      throw new NotFoundError('Group tidak ditemukan');
    }

    const dataGroupById = data;
    return dataGroupById;
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
    // 2025-03-10 13:30:12
    const created_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const updated_at = created_at;

    const dataUserProfileById = await this.getUserProfileById({ user_profile_id });
    const dataGroupById = await this.getGroupById({ group_id });
    const dataNotificationById = await this.getNotificationById({ notification_id });

    // console.log('addMessage: ', dataUserProfileById);
    // console.log('addMessage: ', dataGroupById);
    // console.log('addMessage: ', dataNotificationById);

    if (dataUserProfileById === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
    if (dataGroupById === null) {
      throw new NotFoundError('Group tidak ditemukan');
    }
    if (dataNotificationById === null) {
      throw new NotFoundError('Notifikasi tidak ditemukan');
    }

    const { data, error } = await this._supabase
      .from('messages')
      .insert([{ user_profile_id, group_id, notification_id, isi_pesan, created_at, updated_at }])
      .select('*')
      .maybeSingle();

    return data;
  }

  async getMessages() {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*');

    return data;
  }

  async getMessageById({ id }) {
    const { data, error } = await this._supabase
      .from('messages')
      .select('id, user_profile_id, group_id, isi_pesan')
      .eq('id', id)
      .maybeSingle();

    // console.log('getMessageById', data);
    if (data === null) {
      throw new NotFoundError('Pesan tidak ditemukan');
    }

    const dataMessageById = data;
    return dataMessageById;
  }

  async getMessageByGroupId({ group_id }) {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*')
      .eq('group_id', group_id);

    // console.log('getMessageByGroupId', data);
    if (data === null) {
      throw new NotFoundError('Pesan tidak ditemukan');
    }

    const dataMessagesByGroupId = data;
    return dataMessagesByGroupId;
  }

  async editMessageById({ id, user_profile_id, group_id, isi_pesan }) {
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data, error } = await this._supabase
      .from('messages')
      .update({
        isi_pesan: isi_pesan,
        updated_at: updated_at
      })
      .eq('id', id)
      .eq('user_profile_id', user_profile_id)
      .eq('group_id', group_id)
      .select('id, user_profile_id, group_id, notification_id, isi_pesan')
      .maybeSingle();

    // console.log('editMessage: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui pesan. Id tidak ditemukan');
    }
  }

  async deleteMessageById({ id, user_profile_id }) {
    const { data, error } = await this._supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('user_profile_id', user_profile_id)
      .select();

    // console.log('deleteMessageById: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memghapus pesan. Id tidak ditemukan');
    }
  }
}

module.exports = ChattingsService;