const { supabase } = require('./connections');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const ClientError = require('../../exceptions/ClientError');
const bcrypt = require('bcrypt');
const { format } = require('date-fns');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { createClient } = require('@supabase/supabase-js');

dayjs.extend(utc);
dayjs.extend(timezone);

class ChattingsService {
  constructor() {
    this._supabase = supabase;
  }

  async addUser({ email, password, repeat_password }) {
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();
    
    const created_at = localTime;
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
    const localTime = dayjs().tz('Asia/Jakarta').format();
    
    const created_at = localTime;
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
    const user_id = dataLoginByEmail.id;

    // console.log('login: ', dataLoginByEmail);
    const isValidPassword = await bcrypt.compare(password, dataLoginByEmail.password);

    if (!isValidPassword) {
      throw new InvariantError('Email atau password salah');
    }
    const dataLoginUserProfile = await this.getUserProfileById({ user_id });
    return dataLoginUserProfile;
  }

  async isGambarBannerAvailable(userId) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_id/${userId}/user_profile/gambar_banner/`, {
      limit: 3,
      sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
      // console.error('Gagal membaca folder:', error.message);
    } else if (data.length === 1 || data.length === 0) {
      const listGambarBanner = data;
      const jumlahData = 0;
      return { listGambarBanner, jumlahData };
    } else {
      const listGambarBanner = data;
      const jumlahData = data.length;
      return { listGambarBanner, jumlahData };
    }
  }

  async isGambarProfilevailable(userId) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_id/${userId}/user_profile/gambar_profile/`, {
      limit: 3,
      sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error) {
      // console.error('Gagal membaca folder:', error.message);
    } else if (data.length === 1 || data.length === 0) {
      const listGambarProfile = data;
      const jumlahData = 0;
      return { listGambarProfile, jumlahData };
    } else {
      const listGambarProfile = data;
      const jumlahData = data.length;
      return { listGambarProfile, jumlahData };
    }
  }
  
  async uploadFileGambarBanner(userId, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_id/${userId}/user_profile/gambar_banner/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  
  async uploadFileGambarProfile(userId, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_id/${userId}/user_profile/gambar_profile/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  async editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }) {
    console.log(dataJson);
    const updateAt = dayjs().tz('Asia/Jakarta').format();

    const { data, error } = await this._supabase
      .from('user_profile')
      .update({
        nama: dataJson.nama,
        nik: dataJson.nik,
        umur: dataJson.umur,
        jenis_kelamin: dataJson.jenis_kelamin,
        tgl_lahir: dataJson.tgl_lahir,
        alamat: dataJson.alamat,
        gambar_profile: absolutePathUrlGambarProfile,
        gambar_banner: absolutePathUrlGambarBanner,
        updated_at: updateAt
      })
      .eq('user_id', user_id)
      .select('*');

    console.log(data, error);

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

  async addGroup({ nama_group, deskripsi, gambar_profile, gambar_banner }) {
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();

    const created_at = localTime;
    const updated_at = created_at;

    const { data, error } = await this._supabase
      .from('groups')
      .insert([{ nama_group, deskripsi, gambar_profile, gambar_banner, created_at, updated_at }])
      .select()
      .maybeSingle();

    // console.log('addGroup ID: ', data, error);

    return data;
  }

  async getUserProfileById({ user_id }) {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // console.log('getUserProfileById', data);

    if (data === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    const dataUserProfileById = data;
    return dataUserProfileById;
  }

  async addUserGroup({ user_id_list, group_id, role, created_by }) {
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();

    const created_at = localTime;
    const updated_at = created_at;

    const dataUserProfileById = await this.getUserProfileByUserIdArray({ user_id_list });

    // console.log('addUserGroup : ', user_id_list);
    if (dataUserProfileById === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
    const insertData = user_id_list.map(user_id => ({
      user_id: user_id,
      group_id,
      role,
      created_by,
      created_at: created_at,
      updated_at: updated_at
    }));
    // console.log('addUserGroup insertData : ', insertData);
    
    const { data, error } = await this._supabase
      .from('user_group')
      .insert(insertData)
      .select();

      // console.log('addUserGroup : ', data, error);
    if (data === null) {
        throw new NotFoundError('Group tidak ditemukan');
    }
    return data;
  }

  async getUserProfileByUserIdArray({ user_id_list }) {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*')
      .in('user_id', user_id_list);

    // console.log('getUserProfileByUserIdArray : ', data, error);

    if (data === null || (Array.isArray(data) && data.length === 0)) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
    
    const dataUserProfileByIdArray = data;
    return dataUserProfileByIdArray;
  }

  async getUserGroupByUserIdGroupId({ user_id_list, group_id }) {
    const { data, error } = await this._supabase
      .from('user_group')
      .select('*')
      .in('user_id', user_id_list)
      .eq('group_id', group_id);

    if (data.length > 0) {
      throw new ClientError('Pengguna sudah ada di group');
    }
    const dataUserGroupByUserIdGroupId = data;
    return dataUserGroupByUserIdGroupId;
  }

  async editGroupById({ group_id, nama_group, deskripsi, gambar_profile, gambar_banner }) {
    const updateAt = dayjs().tz('Asia/Jakarta').format();
    const { data, error } = await this._supabase
      .from('groups')
      .update({
        nama_group: nama_group,
        deskripsi: deskripsi,
        gambar_profile: gambar_profile,
        gambar_banner: gambar_banner,
        updated_at: updateAt,
      })
      .eq('id', group_id)
      .select('*');

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
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();

    const created_at = localTime;
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
      .select('*, groups(*), user_profile(*)');  // Memanggil 2 parent entitas

    // console.log('getUserGroups', data, error);
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

  async addMessage({ user_id, group_id, notification_id, isi_pesan }) {
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();

    const created_at = localTime;
    const updated_at = created_at;

    const dataUserProfileById = await this.getUserProfileById({ user_id });
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
      .insert([{ user_id, group_id, notification_id, isi_pesan, created_at, updated_at }])
      .select('*')
      .maybeSingle();

    return data;
  }

  async getMessages() {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*, user_profile(*), groups(*), notifications(*)');   // Memanggil 3 parent entitas
    // console.log('getMessages', data, error);

    return data;
  }

  async getMessageById({ id }) {
    const { data, error } = await this._supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // console.log('getMessageById', data);
    if (data === null) {
      throw new NotFoundError('Pesan tidak ditemukan');
    }

    const dataMessageById = data;
    return dataMessageById;
  }

  async editMessageById({ id, user_id, group_id, isi_pesan }) {
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const { data, error } = await this._supabase
      .from('messages')
      .update({
        isi_pesan: isi_pesan,
        updated_at: updated_at
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .eq('group_id', group_id)
      .select('*')
      .maybeSingle();

    // console.log('editMessage: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui pesan. Id tidak ditemukan');
    }
  }

  async deleteMessageById({ id, user_id }) {
    const { data, error } = await this._supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    // console.log('deleteMessageById: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memghapus pesan. Id tidak ditemukan');
    }
  }
}

module.exports = ChattingsService;