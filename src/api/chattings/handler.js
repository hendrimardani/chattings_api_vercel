const ClientError = require('../../exceptions/ClientError');
const { isReadableStream, streamToString, streamToBuffer } = require('../chattings/utils');
const { createClient } = require('@supabase/supabase-js');

class ChattingsHandler {
  constructor(service) {
    this._service = service;
  
    this.postRegisterHandler = this.postRegisterHandler.bind(this);
    this.postLoginHandler = this.postLoginHandler.bind(this);
    this.getUserProfilesHandler = this.getUserProfilesHandler.bind(this);
    this.getUserProfileByIdHandler = this.getUserProfileByIdHandler.bind(this);
    this.putUserProfileByIdHandler = this.putUserProfileByIdHandler.bind(this);

    this.getUserProfilePatientsHandler = this.getUserProfilePatientsHandler.bind(this);
    this.getUserProfilePatientByIdHandler = this.getUserProfilePatientByIdHandler.bind(this);
    this.putUserProfilePatientByIdHandler = this.putUserProfilePatientByIdHandler.bind(this);
    this.deleteUserByIdHandler = this.deleteUserByIdHandler.bind(this);

    this.postChildrenPatientHandler = this.postChildrenPatientHandler.bind(this);
    this.getChildrenPatientsHandler = this.getChildrenPatientsHandler.bind(this);
    this.getChildrenPatientByUserPatientIdHandler = this.getChildrenPatientByUserPatientIdHandler.bind(this);
    this.putChildrenPatientByUserPatientIdHandler = this.putChildrenPatientByUserPatientIdHandler.bind(this);

    this.postChildServiceHandler = this.postChildServiceHandler.bind(this);

    this.postPregnantMomServiceHandler = this.postPregnantMomServiceHandler.bind(this);
    
    this.getBranchByIdHandler = this.getBranchByIdHandler.bind(this);
    this.getBranchesHandler = this.getBranchesHandler.bind(this);

    this.getChecksHandler = this.getChecksHandler.bind(this);
    this.getPregnantMomServicesHandler = this.getPregnantMomServicesHandler.bind(this);
    this.getChildServicesHandler = this.getChildServicesHandler.bind(this);

    this.postUserGroupHandler = this.postUserGroupHandler.bind(this);
    this.postUserByGroupIdHandler = this.postUserByGroupIdHandler.bind(this);
    this.getGroupsHandler = this.getGroupsHandler.bind(this);
    this.getGroupByIdHandler = this.getGroupByIdHandler.bind(this);
    this.getUserGroupsHandler = this.getUserGroupsHandler.bind(this);
    this.putGroupByIdHandler = this.putGroupByIdHandler.bind(this);
    this.deleteGroupByIdHandler = this.deleteGroupByIdHandler.bind(this);

    this.postMessageHandler = this.postMessageHandler.bind(this);
    this.getMessagesHandler = this.getMessagesHandler.bind(this);
    this.getMessageByIdHandler = this.getMessageByIdHandler.bind(this);
    this.putMessageByIdHandler = this.putMessageByIdHandler.bind(this);
    this.deleteMessageByIdHandler = this.deleteMessageByIdHandler.bind(this);
  }

  async postRegisterHandler(request, h) {
    const { nama, email, role = 'pasien', nama_cabang, password, repeat_password } = request.payload;
    const user = await this._service.addUser({ email, role, password, repeat_password });

    // id ini digunakan ketika mengakses user sedang login lewat authentikasi
    // const id = request.auth.credentials.user.id;
    // console.log('ID dari token JWT', id);

    let dataRegister = null;
    const id = user.id;

    const dataCabangByNamaCabang = await this._service.getBranchByNamaCabang({ nama_cabang });
    const branch_id = dataCabangByNamaCabang.id;

    if (role === 'pasien') {
      dataRegister = await this._service.addUserProfilePatient({ id, nama, branch_id }); 
    } else {
      dataRegister = await this._service.addUserProfile({ id, nama, branch_id });
    }

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
      dataRegister,
    });

    response.code(201);
    return response;
  }

  async postLoginHandler(request, h) {
    const { email, password } = request.payload;
    const { role, dataLoginUser } = await this._service.login({ email, password });
    let token = null;

    if (role === 'pasien') {
        token = require('@hapi/jwt').token.generate(
        { id: dataLoginUser.user_patient_id, nama: dataLoginUser.nama_bumil },
        { key: process.env.JWT_SECRET, algorithm: 'HS256' },
        { ttlSec: 604800 }  // Token kedaluwarsa dalam 7 hari setelah login
      );
    } else {
        token = require('@hapi/jwt').token.generate(
        { id: dataLoginUser.user_id, nama: dataLoginUser.nama },
        { key: process.env.JWT_SECRET, algorithm: 'HS256' },
        { ttlSec: 604800 }  // Token kedaluwarsa dalam 7 hari setelah login
      );
    }

    return {
      status: 'success',
      message: 'Berhasil masuk',
      dataLogin: {
        dataLoginUser,
        role,
        token
      },
    };
  }

  async getUserProfilesHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataUserProfiles = await this._service.getUserProfiles();

    return {
      status: 'success',
      dataUserProfiles,
    };
  }

  async getUserProfileByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id } = request.params;
    const dataUserProfileById = await this._service.getUserProfileById({ user_id });

    return {
      status: 'success',
      dataUserProfileById,
    };
  }

  async putUserProfileByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id } = request.params;
    const { dataJsonString = null, gambar_profile = null, gambar_banner = null } = request.payload;
    
    let dataJson = null;
    let dataUpdateUserProfileById = null;
    let absolutePathUrlGambarProfile = null;
    let absolutePathUrlGambarBanner = null;

    if (dataJsonString !== null) {
      dataJson = JSON.parse(dataJsonString);
    }
    if (gambar_profile === null && gambar_banner === null) {
      const dataUserProfileById = await this._service.getUserProfileById({ user_id });
      const isNotNullGambarProfile = dataUserProfileById.gambar_profile;
      const isNotNullGambarBanner = dataUserProfileById.gambar_banner;
      
      if (isNotNullGambarProfile !== null || isNotNullGambarBanner !== null) {
        absolutePathUrlGambarProfile = isNotNullGambarProfile;
        absolutePathUrlGambarBanner = isNotNullGambarBanner;
      }
      // Jika yang diunggah tidak ada
      dataUpdateUserProfileById = await this._service.editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    } else if (gambar_profile === null) {     
      // Jika yang diunggah hanya file gambar banner 
      const { listGambarProfile, jumlahData } = await this._service.isGambarProfilevailableOnUserProfile(user_id);

      if (jumlahData === 0) {
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfile(user_id, bufferFileGambarBanner);
      } else {
        const latestGambarProfile = listGambarProfile[0].name;
        absolutePathUrlGambarProfile = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${user_id}/user_profile/gambar_profile/${latestGambarProfile}`;
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfile(user_id, bufferFileGambarBanner);
      }

      dataUpdateUserProfileById = await this._service.editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    } else if (gambar_banner === null) {
      // Jika yang diunggah hanya file gambar profile 
      const { listGambarBanner, jumlahData } = await this._service.isGambarBannerAvailableOnUserProfile(user_id);

      if (jumlahData === 0) {
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfile(user_id, bufferFileGambarProfile);
      } else {
        const latestGambarBanner = listGambarBanner[0].name;
        absolutePathUrlGambarBanner = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${user_id}/user_profile/gambar_banner/${latestGambarBanner}`;
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfile(user_id, bufferFileGambarProfile);
      }

      dataUpdateUserProfileById = await this._service.editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    } else {
      // Jika yang diunggah keduanya
      const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
      const absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfile(user_id, bufferFileGambarProfile);
  
      const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
      const absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfile(user_id, bufferFileGambarBanner);
  
      dataUpdateUserProfileById = await this._service.editUserProfileById({ user_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    }

    return {
      status: 'success',
      message: 'Profile berhasil diperbarui',
      dataUpdateUserProfileById
    };
  }

  async getUserProfilePatientsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataUserProfilePatients = await this._service.getUserProfilePatients();

    return {
      status: 'success',
      dataUserProfilePatients,
    };
  }

  async getUserProfilePatientByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { user_patient_id } = request.params;
    const dataUserProfilePatientById = await this._service.getUserProfilePatientById({ user_patient_id });

    return {
      status: 'success',
      dataUserProfilePatientById,
    };
  }

  async putUserProfilePatientByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_patient_id } = request.params;
    const { dataJsonString = null, gambar_profile = null, gambar_banner = null } = request.payload;

    let dataJson = null;
    let dataUpdateUserProfilePatientById = null;
    let absolutePathUrlGambarProfile = null;
    let absolutePathUrlGambarBanner = null;

    if (dataJsonString !== null) {
      dataJson = JSON.parse(dataJsonString);
    } 
    if (gambar_profile === null && gambar_banner === null) {
      const nama_cabang = dataJson.nama_cabang;
      const dataCabangByNamaCabang = await this._service.getBranchByNamaCabang({ nama_cabang });
      const branch_id = dataCabangByNamaCabang.id;

      dataUpdateUserProfilePatientById = await this._service.editUserProfilePatientById({ user_patient_id, branch_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });

      const isNotNullGambarProfile = dataJson.gambar_profile;
      const isNotNullGambarBanner = dataJson.gambar_banner;
      
      if (isNotNullGambarProfile !== null || isNotNullGambarBanner !== null) {
        absolutePathUrlGambarProfile = isNotNullGambarProfile;
        absolutePathUrlGambarBanner = isNotNullGambarBanner;
      }
      // Jika yang diunggah tidak ada
      dataUpdateUserProfilePatientById = await this._service.editUserProfilePatientById({ user_patient_id, branch_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner }); 
    } else if (gambar_profile === null) { 
      // Jika yang diunggah hanya file gambar banner 
      const { listGambarProfile, jumlahData } = await this._service.isGambarProfilevailableOnUserProfilePatient(user_patient_id);
      if (jumlahData === 0) {
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfilePatient(user_patient_id, bufferFileGambarBanner);
      } else {
        const latestGambarProfile = listGambarProfile[0].name;
        absolutePathUrlGambarProfile = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_patient_id/${user_patient_id}/user_profile/gambar_profile/${latestGambarProfile}`;
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfilePatient(user_patient_id, bufferFileGambarBanner);
      }

        dataUpdateUserProfilePatientById = await this._service.editUserProfilePatientById({ user_patient_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    } else if (gambar_banner === null) {
      // Jika yang diunggah hanya file gambar profile 
      const { listGambarBanner, jumlahData } = await this._service.isGambarBannerAvailableOnUserProfilePatient(user_patient_id);
      if (jumlahData === 0) {
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfilePatient(user_patient_id, bufferFileGambarProfile);
      } else {
        const latestGambarBanner = listGambarBanner[0].name;
        absolutePathUrlGambarBanner = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_patient_id/${user_patient_id}/user_profile/gambar_banner/${latestGambarBanner}`;
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfilePatient(user_patient_id, bufferFileGambarProfile);
      }

    dataUpdateUserProfilePatientById = await this._service.editUserProfilePatientById({ user_patient_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    } else {
      // Jika yang diunggah keduanya
      const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
      const absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnUserProfilePatient(user_patient_id, bufferFileGambarProfile);
  
      const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
      const absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnUserProfilePatient(user_patient_id, bufferFileGambarBanner);
  
      dataUpdateUserProfilePatientById = await this._service.editUserProfilePatientById({ user_patient_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
    }

    return {
      status: 'success',
      message: 'Data berhasil diperbarui',
      dataUpdateUserProfilePatientById
    };
  }

  async deleteUserByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    await this._service.deleteUserById({ id });

    return {
      status: 'success',
      message: 'Pengguna berhasil dihapus',
    };
  }

  async postChildServiceHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id } = request.params;
    const {
      category_service_id, catatan, nama_anak, tinggi_cm, hasil_pemeriksaan
    } = request.payload;

    const dataChildrenPatientByNamaAnak = await this._service.getChildrenPatientByNamaAnak({ nama_anak });
    const user_patient_id = dataChildrenPatientByNamaAnak.user_patient_id;
    const children_patient_id = dataChildrenPatientByNamaAnak.id;

    const dataCheck = await this._service.addCheckByUserId({ user_id, user_patient_id, children_patient_id, category_service_id, catatan });
    const pemeriksaan_id = dataCheck.id;
    const dataChildService = await this._service.addChildServiceByUserId({ pemeriksaan_id, tinggi_cm, hasil_pemeriksaan });

    const response = h.response({
      status: 'success',
      message: 'Pemeriksaan berhasil ditambahkan',
      dataChildService,
    });

    response.code(201);
    return response;
  }

  async postPregnantMomServiceHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id } = request.params;
    const { 
      category_service_id, catatan, nama_bumil, hari_pertama_haid_terakhir, 
      tgl_perkiraan_lahir, umur_kehamilan, status_gizi_kesehatan
    } = request.payload;

    const dataUserPatientById = await this._service.getUserProfilePatientByNamaBumil({ nama_bumil });
    const user_patient_id = dataUserPatientById.user_patient_id;
    const dataChildrenPatientByUserPatientId = await this._service.getChildrenPatientByUserPatientId({ user_patient_id });
    const children_patient_id = dataChildrenPatientByUserPatientId.id;

    const dataCheck = await this._service.addCheckByUserId({ user_id, user_patient_id, children_patient_id, category_service_id, catatan });
    const pemeriksaan_id = dataCheck.id;
    const dataPregnantMomService = await this._service.addPregnantMomService({ pemeriksaan_id, hari_pertama_haid_terakhir, tgl_perkiraan_lahir, umur_kehamilan, status_gizi_kesehatan });

    const response = h.response({
      status: 'success',
      message: 'Pemeriksaan berhasil ditambahkan',
      dataPregnantMomService,
    });

    response.code(201);
    return response;
  }

  async getPregnantMomServicesHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataPregnantMomServices = await this._service.getPregnantMomServices();
    return {
      status: 'success',
      dataPregnantMomServices,
    };
  }

  async postChildrenPatientHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_patient_id } = request.params;
    const { nama_anak, nik_anak, jenis_kelamin_anak, tgl_lahir_anak, umur_anak } = request.payload;
    const dataChildrenPatient = await this._service.addChildrenPatient({ user_patient_id, nama_anak, nik_anak, jenis_kelamin_anak, tgl_lahir_anak, umur_anak });

    const response = h.response({
      status: 'success',
      message: 'Data berhasil ditambahkan',
      dataChildrenPatient,
    });

    response.code(201);
    return response;
  }

  async getChildrenPatientsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataChildrenPatients = await this._service.getChildrenPatients();
    return {
      status: 'success',
      dataChildrenPatients,
    };
  }

  async getChildrenPatientByUserPatientIdHandler(request, h) {
    const { user_patient_id } = request.params;
    const dataChildrenPatientByUserPatientId = await this._service.getChildrenPatientByUserPatientId({ user_patient_id });

    return {
      status: 'success',
      dataChildrenPatientByUserPatientId,
    };
  }

  async putChildrenPatientByUserPatientIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_patient_id } = request.params;
    const { nama_anak, nik_anak, jenis_kelamin_anak, tgl_lahir_anak, umur_anak } = request.payload;
    const dataUpdateChildrenPatienttByUserPatientId = await this._service.editChildrenPatientByUserPatientId({ user_patient_id, nama_anak, nik_anak, jenis_kelamin_anak, tgl_lahir_anak, umur_anak });
    
    return {
      status: 'success',
      message: 'Data berhasil diperbarui',
      dataUpdateChildrenPatienttByUserPatientId
    };
  }

  async getBranchByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    const dataBranchById = await this._service.getBranchById({ id });

    return {
      status: 'success',
      dataBranchById,
    };
  }

  async getBranchesHandler(request, h) {
    const dataBranches = await this._service.getBranches();
    return {
      status: 'success',
      dataBranches,
    };
  }

  async getChecksHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataChecks = await this._service.getChecks();
    return {
      status: 'success',
      dataChecks,
    };
  }

  async getChildServicesHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataChildServices = await this._service.getChildServices();
    return {
      status: 'success',
      dataChildServices,
    };
  }

  async postUserGroupHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id_list_string } = request.params;
    // Ubah kedalam list
    const user_id_list = JSON.parse(user_id_list_string);

    // Ubah '[327]' ke 327
    const user_id = Number(user_id_list_string.replace(/[\[\]]/g, ""));
    const dataUserProfileById = await this._service.getUserProfileById({ user_id });
    const created_by = dataUserProfileById.nama;

    const { dataJsonString, role = 'admin', gambar_profile = null, gambar_banner = null } = request.payload;
    const dataJson = JSON.parse(dataJsonString);
    const namaGroup = dataJson.nama_group;

    let absolutePathUrlGambarProfile = null;
    let absolutePathUrlGambarBanner = null;
    let dataUserGroup = null;

    if (gambar_profile === null && gambar_banner === null) {
      // Jika yang diunggah tidak ada
      const group = await this._service.addGroup({ dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
      const group_id = group.id;
  
      dataUserGroup = await this._service.addUserGroup({ user_id_list, group_id, role, created_by });
    } else if (gambar_profile === null) {     
      // Jika yang diunggah hanya file gambar banner 
      const { listGambarProfile, jumlahData } = await this._service.isGambarProfilevailableOnGroups(user_id, namaGroup);

      if (jumlahData === 0) {
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(user_id, namaGroup, bufferFileGambarBanner);
      } else {
        const latestGambarProfile = listGambarProfile[0].name;
        absolutePathUrlGambarProfile = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${user_id}/groups/${namaGroup}/gambar_profile/${latestGambarProfile}`;
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(user_id, namaGroup, bufferFileGambarBanner);
      }

      const group = await this._service.addGroup({ dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
      const group_id = group.id;
  
      dataUserGroup = await this._service.addUserGroup({ user_id_list, group_id, role, created_by });
    } else if (gambar_banner === null) {
      // Jika yang diunggah hanya file gambar profile 
      const { listGambarBanner, jumlahData } = await this._service.isGambarBannerAvailableOnGroups(user_id, namaGroup);

      if (jumlahData === 0) {
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(user_id, namaGroup, bufferFileGambarProfile);
      } else {
        const latestGambarBanner = listGambarBanner[0].name;
        absolutePathUrlGambarBanner = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${user_id}/groups/${namaGroup}/gambar_banner/${latestGambarBanner}`;
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(user_id, namaGroup, bufferFileGambarProfile);
      }

      const group = await this._service.addGroup({ dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
      const group_id = group.id;
  
      dataUserGroup = await this._service.addUserGroup({ user_id_list, group_id, role, created_by });
    } else {
      // Jika yang diunggah keduanya
      const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
      const absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(user_id, namaGroup, bufferFileGambarProfile);
  
      const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
      const absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(user_id, namaGroup, bufferFileGambarBanner);
  
      const group = await this._service.addGroup({ dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });
      const group_id = group.id;
  
      dataUserGroup = await this._service.addUserGroup({ user_id_list, group_id, role, created_by });
    }

    const response = h.response({
      status: 'success',
      message: 'Group berhasil ditambahkan',
      dataUserGroup,
    });
    response.code(201);
    return response;
  }

  async postUserByGroupIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const currentUserName = request.auth.credentials.user.nama;
    // console.log('Nama saat ini dari token JWT', currentUserName);

    const { group_id } = request.params;
    const { user_id, role } = request.payload;
    const user_id_list = user_id;

    await this._service.getUserProfileByUserIdArray({ user_id_list });

    await this._service.getUserGroupByUserIdGroupId({ user_id_list, group_id });
    const created_by = currentUserName;
    const dataUserByGroupId = await this._service.addUserGroup({ user_id_list, group_id, role, created_by });

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan di group',
      dataUserByGroupId,
    });
    response.code(201);
    return response;
  }

  async getGroupsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataGroups = await this._service.getGroups();

    return {
      status: 'success',
      dataGroups,
    };
  }

  async getGroupByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id } = request.params;
    const group_id = id;
    const dataGroupById = await this._service.getGroupById({ group_id });

    return {
      status: 'success',
      dataGroupById,
    };
  }

  async getUserGroupsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const userGroups = await this._service.getUserGroups();

    return {
      status: 'success',
      userGroups,
    };
  }

  async putGroupByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { group_id } = request.params;
    const { dataJsonString = null, gambar_profile = null, gambar_banner = null} = request.payload;

    let userId = null;
    let namaGroup = null;
    let dataJson = null;
    let dataUpdateGroupById = null;
    let absolutePathUrlGambarProfile = null;
    let absolutePathUrlGambarBanner = null;

    if (dataJsonString !== null) {
      dataJson = JSON.parse(dataJsonString);
      userId = dataJson.user_id;  
      namaGroup = dataJson.nama_group;
    } else {
      dataJson = await this._service.getGroupById({ group_id });
      const dataGroupById = await this._service.getGroupById({ group_id });
      const isNotNullGambarProfile = dataGroupById.gambar_profile;
      const isNotNullGambarBanner = dataGroupById.gambar_banner;

      if (isNotNullGambarProfile !== null || isNotNullGambarBanner !== null) {
        absolutePathUrlGambarProfile = isNotNullGambarProfile;
        absolutePathUrlGambarBanner = isNotNullGambarBanner;
      }
      // Jika yang diunggah tidak ada
      dataUpdateGroupById = await this._service.editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    }

    if (gambar_profile === null && gambar_banner === null) {
      const dataGroupById = await this._service.getGroupById({ group_id });
      const isNotNullGambarProfile = dataGroupById.gambar_profile;
      const isNotNullGambarBanner = dataGroupById.gambar_banner;
      
      if (isNotNullGambarProfile !== null || isNotNullGambarBanner !== null) {
        absolutePathUrlGambarProfile = isNotNullGambarProfile;
        absolutePathUrlGambarBanner = isNotNullGambarBanner;
      }
      // Jika yang diunggah tidak ada
      dataUpdateGroupById = await this._service.editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    } else if (gambar_profile === null) {     
      // Jika yang diunggah hanya file gambar banner 
      const { listGambarProfile, jumlahData } = await this._service.isGambarProfilevailableOnGroups(userId, namaGroup);

      if (jumlahData === 0) {
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(userId, namaGroup, bufferFileGambarBanner);
      } else {
        const latestGambarProfile = listGambarProfile[0].name;
        absolutePathUrlGambarProfile = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${userId}/groups/${namaGroup}/gambar_profile/${latestGambarProfile}`;
        const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
        absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(userId, namaGroup, bufferFileGambarBanner);
      }

      dataUpdateGroupById = await this._service.editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    } else if (gambar_banner === null) {
      // Jika yang diunggah hanya file gambar profile 
      const { listGambarBanner, jumlahData } = await this._service.isGambarBannerAvailableOnGroups(userId, namaGroup);

      if (jumlahData === 0) {
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(userId, namaGroup, bufferFileGambarProfile);
      } else {
        const latestGambarBanner = listGambarBanner[0].name;
        absolutePathUrlGambarBanner = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/user_id/${userId}/groups/${namaGroup}/gambar_banner/${latestGambarBanner}`;
        const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
        absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(userId, namaGroup, bufferFileGambarProfile);
      }

      dataUpdateGroupById = await this._service.editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    } else {
      // Jika yang diunggah keduanya
      const bufferFileGambarProfile = await streamToBuffer(gambar_profile);
      absolutePathUrlGambarProfile = await this._service.uploadFileGambarProfileOnGroups(userId, namaGroup, bufferFileGambarProfile);
  
      const bufferFileGambarBanner = await streamToBuffer(gambar_banner);
      absolutePathUrlGambarBanner = await this._service.uploadFileGambarBannerOnGroups(userId, namaGroup, bufferFileGambarBanner);
  
      dataUpdateGroupById = await this._service.editGroupById({ group_id, dataJson, absolutePathUrlGambarProfile, absolutePathUrlGambarBanner });  
    }
    
    return {
      status: 'success',
      message: 'Group berhasil diperbarui',
      dataUpdateGroupById
    };
  }

  async deleteGroupByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    await this._service.deleteGroupById({ id });

    return {
      status: 'success',
      message: 'Group berhasil dihapus',
    };
  }

  async postMessageHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { user_id, group_id } = request.params;
    const { isi_pesan, is_status = false } = request.payload;

    const notification = await this._service.addNotification({ is_status });
    const notification_id = notification.id;

    const dataMessage = await this._service.addMessage({ user_id, group_id, notification_id, isi_pesan });

    const response = h.response({
      status: 'success',
      message: 'Pesan berhasil ditambahkan',
      dataMessage,
    });
    response.code(201);
    return response;
  }

  async getMessagesHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataMessages = await this._service.getMessages();

    return {
      status: 'success',
      dataMessages,
    };
  }

  async getMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    const dataMessageById = await this._service.getMessageById({ id });

    // console.log(dataMessageById);
    return {
      status: 'success',
      dataMessageById,
    };
  }

  async putMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id, user_id, group_id } = request.params;
    const { isi_pesan } = request.payload;

    await this._service.editMessageById({ id, user_id, group_id, isi_pesan });

    return {
      status: 'success',
      message: 'Pesan berhasil diperbarui',
    };
  }

  async deleteMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id, user_id } = request.params;
    await this._service.deleteMessageById({ id, user_id });

    return {
      status: 'success',
      message: 'Pesan berhasil dihapus',
    };
  }
}

module.exports = ChattingsHandler;