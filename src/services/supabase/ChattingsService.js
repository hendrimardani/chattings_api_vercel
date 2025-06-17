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

  async addUser({ email, role, password, repeat_password }) {
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
      .insert([{ email, role, password, created_at, updated_at }])
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

  async addUserProfilePatient({ id, nama, branch_id }) {    
    const localTime = dayjs().tz('Asia/Jakarta').format();
    
    const created_at = localTime;
    const updated_at = created_at;

    const { data, error } =  await this._supabase
      .from('user_profile_patient')
      .insert([{ user_patient_id: id, branch_id: branch_id, nama_bumil: nama, created_at, updated_at }])
      .select()
      .maybeSingle();
      
      // console.log('addUserProfilePatient', data, error);
    return data;
  }

  async addUserProfile({ id, nama, branch_id }) {    
    const localTime = dayjs().tz('Asia/Jakarta').format();
    
    const created_at = localTime;
    const updated_at = created_at;

    const { data, error } =  await this._supabase
      .from('user_profile')
      .insert([{ user_id: id, branch_id: branch_id, nama, created_at, updated_at }])
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
    const role = dataLoginByEmail.role;

    // console.log('login: ', dataLoginByEmail);
    const isValidPassword = await bcrypt.compare(password, dataLoginByEmail.password);

    if (!isValidPassword) {
      throw new InvariantError('Email atau password salah');
    }
    if (role === 'pasien') {
      const user_patient_id = user_id;
      const dataLoginUser = await this.getUserProfilePatientById({ user_patient_id });
      return { role, dataLoginUser };
    } else {
      const dataLoginUser = await this.getUserProfileById({ user_id });
      return { role, dataLoginUser };
    }
  }

  async isGambarBannerAvailableOnGroups(userId, namaGroup) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_id/${userId}/groups/${namaGroup}/gambar_banner/`, {
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

  async isGambarProfilevailableOnGroups(userId, namaGroup) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_id/${userId}/groups/${namaGroup}/gambar_profile/`, {
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

  async uploadFileGambarBannerOnGroups(userId, namaGroup, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_id/${userId}/groups/${namaGroup}/gambar_banner/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  
  async uploadFileGambarProfileOnGroups(userId, namaGroup, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_id/${userId}/groups/${namaGroup}/gambar_profile/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  async isGambarBannerAvailableOnUserProfile(userId) {
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

  async isGambarProfilevailableOnUserProfile(userId) {
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
  
  async uploadFileGambarBannerOnUserProfile(userId, bufferFile) {
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

  
  async uploadFileGambarProfileOnUserProfile(userId, bufferFile) {
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

    async isGambarBannerAvailableOnUserProfilePatient(userPatientId) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_patient_id/${userPatientId}/user_profile/gambar_banner/`, {
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

  async isGambarProfilevailableOnUserProfilePatient(userPatientId) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseGetFile = createClient(supabaseUrl, supabaseKeyRole);

    const { data, error } = await supabaseGetFile.storage.from('avatars').list(`user_patient_id/${userPatientId}/user_profile/gambar_profile/`, {
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
  
  async uploadFileGambarBannerOnUserProfilePatient(userPatientId, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_patient_id/${userPatientId}/user_profile/gambar_banner/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  async uploadFileGambarProfileOnUserProfilePatient(userPatientId, bufferFile) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKeyRole = process.env.SUPABASE_KEY_SERVICE_ROLE;
    const supabaseUploadFile = createClient(supabaseUrl, supabaseKeyRole);

    const date = dayjs().tz('Asia/Jakarta').format();
    const createdAt = dayjs(date).utc().format('YYYY_MM_DD_HH_mm_ss');

    const { data, error } = await supabaseUploadFile.storage.from('avatars').upload(`user_patient_id/${userPatientId}/user_profile/gambar_profile/${createdAt}.jpg`, bufferFile, {
      contentType: 'image/*',
    });
    if (error) {
      // console.log(error);
    } else {
      const absolutePathUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      return absolutePathUrl;
    }
  }

  async getUserProfiles() {
    const { data, error } = await this._supabase
      .from('user_profile')
      .select('*, users(*), branch(*)');

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

  async editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }) {
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

    if (error && error.code === '23505') {
      throw new ClientError('NIK atau email sudah digunakan');
    }
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui profile. Id tidak ditemukan');
    }
    return data;
  }

  async getUserProfilePatients() {
    const { data, error } = await this._supabase
      .from('user_profile_patient')
      .select('*, users(*), branch(*)');
    return data;
  }

  async getUserProfilePatientById({ user_patient_id }) {
    const { data, error } = await this._supabase
      .from('user_profile_patient')
      .select('*, branch(*)')
      .eq('user_patient_id', user_patient_id)
      .maybeSingle();
    // console.log('getUserProfileById', data);
    if (data === null) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
    const dataUserProfilePatientById = data;
    return dataUserProfilePatientById;
  }

  async editUserProfilePatientById({ user_patient_id, branch_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }) {
    const updateAt = dayjs().tz('Asia/Jakarta').format();

    const { data, error } = await this._supabase
      .from('user_profile_patient')
      .update({
        branch_id: branch_id,
        nama_bumil: dataJson.nama_bumil,
        nik_bumil: dataJson.nik_bumil,
        tgl_lahir_bumil: dataJson.tgl_lahir_bumil,
        umur_bumil: dataJson.umur_bumil,
        alamat: dataJson.alamat,
        nama_ayah: dataJson.nama_ayah,
        gambar_profile: absolutePathUrlGambarProfile,
        gambar_banner: absolutePathUrlGambarBanner,
        updated_at: updateAt
      })
      .eq('user_patient_id', user_patient_id)
      .select('*');

    if (error && error.code === '23505') {
      throw new ClientError('NIK atau email sudah digunakan');
    }
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui profile. Id tidak ditemukan');
    }
    return data;
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

  async addChildrenPatient({ user_patient_id, nama_anak, nik_anak, jenis_kelamin_anak, tgl_lahir_anak, umur_anak }) {
    const localTime = dayjs().tz('Asia/Jakarta').format();
    const created_at = localTime;
    const updated_at = created_at;

    const { data, error } =  await this._supabase
      .from('children_patient')
      .insert([{
        user_patient_id: user_patient_id,
        nama_anak: nama_anak,
        nik_anak: nik_anak,
        jenis_kelamin_anak: jenis_kelamin_anak,
        tgl_lahir_anak: tgl_lahir_anak,
        umur_anak: umur_anak,
        created_at: created_at, 
        updated_at: updated_at
      }])
      .select()
      .maybeSingle();
      
    // console.log('addChildrenPatient', data, error);
    if (error && error.code === '23505') {
      throw new ClientError('NIK anak sudah digunakan');
    } else if (error && error.code === '23502') {
      throw new InvariantError('Gagal ditambahkan. Pastikan tidak ada data yang kosong');
    }
    return data;
  }

  async getChildrenPatientByUserPatientId({ user_patient_id }) {
    // Tidak menggunakan metode maybeSingle()
    const { data, error } = await this._supabase
      .from('children_patient')
      .select('*')
      .eq('user_patient_id', user_patient_id);
    // console.log('getChildrenPatientByUserPatientId', data);
    if (data.length === 0) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }
    const dataChildrenPatientByUserPatientId = data;
    return dataChildrenPatientByUserPatientId;
  }

  async getBranches() {
    const { data, error } = await this._supabase
      .from('branch')
      .select('*');

    return data;
  }

  async getBranchById({ branch_id }) {
    const { data, error } = await this._supabase
      .from('branch')
      .select('*')
      .eq('id', branch_id)
      .maybeSingle();

    // console.log('getBranchByCabangName', data, error);
    if (data === null) {
      throw new NotFoundError('Cabang tidak ditemukan');
    }

    const dataBranchById = data;
    return dataBranchById;
  }

  async getBranchByNamaCabang({ namaCabang }) {
    const { data, error } = await this._supabase
      .from('branch')
      .select('*')
      .eq('nama_cabang', namaCabang)
      .maybeSingle();

    // console.log('getBranchByCabangName', data, error);
    if (data === null) {
      throw new NotFoundError('Cabang tidak ditemukan');
    }

    const dataCabangByNamaCabang = data;
    return dataCabangByNamaCabang;
  }

  async getChecks() {
    const { data, error } = await this._supabase
      .from('checks')
      .select('*, user_profile(*), user_profile_patient(*), children_patient(*), category_service(*)');
    return data;
  }

  async getPregnantMomServices() {
    const { data, error } = await this._supabase
      .from('pregnant_mom_service')
      .select('*');
    return data;
  }

  async getChildServices() {
    const { data, error } = await this._supabase
      .from('child_service')
      .select('*')
    return data;
  }

  async addGroup({ dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }) {
    // 2025-04-19 09:15:03
    const localTime = dayjs().tz('Asia/Jakarta').format();

    const created_at = localTime;
    const updated_at = created_at;

    const { data, error } = await this._supabase
      .from('groups')
      .insert([{ 
        nama_group: dataJson.nama_group, 
        deskripsi: dataJson.deskripsi, 
        gambar_profile: absolutePathUrlGambarProfile, 
        gambar_banner: absolutePathUrlGambarBanner, 
        created_at, 
        updated_at
       }])
      .select()
      .maybeSingle();

    // console.log('addGroup ID: ', data, error);

    return data;
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
      group_id: group_id,
      role: role,
      created_by: created_by,
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

  async editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }) {
    const updateAt = dayjs().tz('Asia/Jakarta').format();
    const { data, error } = await this._supabase
      .from('groups')
      .update({
        nama_group: dataJson.nama_group,
        deskripsi: dataJson.deskripsi,
        gambar_profile: absolutePathUrlGambarProfile,
        gambar_banner: absolutePathUrlGambarBanner,
        updated_at: updateAt,
      })
      .eq('id', group_id)
      .select('*');

    // console.log('editUserGroup: ', data, error);
    if (data.length === 0) {
      throw new NotFoundError('Gagal memperbarui pesan. Id tidak ditemukan');
    }

    return data;
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