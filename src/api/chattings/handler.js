class ChattingsHandler {
  constructor(service) {
    this._service = service;

    this.postRegisterHandler = this.postRegisterHandler.bind(this);
    this.postLoginHandler = this.postLoginHandler.bind(this);
    this.getUsersHandler = this.getUsersHandler.bind(this);
    this.getUserProfileByIdHandler = this.getUserProfileByIdHandler.bind(this);
    this.putUserProfileByIdHandler = this.putUserProfileByIdHandler.bind(this);
    this.deleteUserByIdHandler = this.deleteUserByIdHandler.bind(this);

    this.postUserGroupHandler = this.postUserGroupHandler.bind(this);
    this.postUserByGroupIdHandler = this.postUserByGroupIdHandler.bind(this);
    this.getUserGroupByUserIdHandler = this.getUserGroupByUserIdHandler.bind(this);
    this.getGroupsHandler = this.getGroupsHandler.bind(this);
    this.getGroupByIdHandler = this.getGroupByIdHandler.bind(this);
    this.getUserGroupsHandler = this.getUserGroupsHandler.bind(this);
    this.putGroupByIdHandler = this.putGroupByIdHandler.bind(this);
    this.deleteGroupByIdHandler = this.deleteGroupByIdHandler.bind(this);

    this.postMessageHandler = this.postMessageHandler.bind(this);
    this.getMessagesHandler = this.getMessagesHandler.bind(this);
    this.getMessageByIdHandler = this.getMessageByIdHandler.bind(this);
    this.getMessageByGroupIdHandler = this.getMessageByGroupIdHandler.bind(this);
    this.putMessageByIdHandler = this.putMessageByIdHandler.bind(this);
    this.deleteMessageByIdHandler = this.deleteMessageByIdHandler.bind(this);
  }

  async postRegisterHandler(request, h) {
    const { nama, email, password, repeat_password } = request.payload;
    const user = await this._service.addUser({ email, password, repeat_password });

    // id ini digunakan ketika mengakses user sedang login lewat authentikasi
    // const id = request.auth.credentials.user.id;
    // console.log('ID dari token JWT', id);

    const id = user.id;
    const hashedPassword = user.password;
    const dataRegister = await this._service.addUserProfile({ id, nama, hashedPassword });

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
    const dataLoginUserProfile = await this._service.login({ email, password });

    const token = require('@hapi/jwt').token.generate(
      { id: dataLoginUserProfile.user_id, nama: dataLoginUserProfile.nama },
      { key: process.env.JWT_SECRET, algorithm: 'HS256' },
      { ttlSec: 604800 }// Token kedaluwarsa dalam 7 hari setelah login
    );

    return {
      status: 'success',
      message: 'Berhasil masuk',
      dataLogin: {
        dataLoginUserProfile,
        token
      },
    };
  }

  async getUsersHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const dataUsers = await this._service.getUsers();

    return {
      status: 'success',
      dataUsers,
    };
  }

  async getUserProfileByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id } = request.params;
    const user_profile_id = id;
    const dataUserProfileById = await this._service.getUserProfileById({ user_profile_id });

    return {
      status: 'success',
      dataUserProfileById,
    };
  }

  async putUserProfileByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    const { nama, nik, umur, jenis_kelamin, tgl_lahir } = request.payload;

    await this._service.editUserProfileById({ id, nama, nik, umur, jenis_kelamin, tgl_lahir });

    return {
      status: 'success',
      message: 'Profile berhasil diperbarui',
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

  async postUserGroupHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { user_profile_id } = request.params;
    const dataUserProfileById = await this._service.getUserProfileById({ user_profile_id });
    const created_by = dataUserProfileById.nama;
    const { nama_group, deskripsi, role='admin' } = request.payload;

    const group = await this._service.addGroup({ nama_group, deskripsi });
    const group_id = group.id;

    const dataUserGroup = await this._service.addUserGroup({ user_profile_id, group_id, role, created_by });

    const response = h.response({
      status: 'success',
      message: 'Group berhasil ditambahkan',
      dataUserGroup,
    });
    response.code(201);
    return response;
  }

  async getUserGroupByUserIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { user_id } = request.params;

    const dataUserGroupByUserId = await this._service.getUserGroupByUserId({ user_id });

    return {
      status: 'success',
      dataUserGroupByUserId,
    };
  }

  async postUserByGroupIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const currentUserName = request.auth.credentials.user.nama;
    // console.log('Nama saat ini dari token JWT', currentUserName);

    const { group_id } = request.params;
    const { user_profile_id, role } = request.payload;

    const addedOtherUser = await this._service.getUserProfileByUserIdArray({ user_profile_id });
    const dataUserProfileByIdArray = addedOtherUser.map((item) => item.user_id);

    const user_id = dataUserProfileByIdArray;
    await this._service.getUserGroupByUserIdGroupId({ user_id, group_id });
    const created_by = currentUserName;

    const dataUserByGroupId = await this._service.addUserGroup({ user_profile_id: dataUserProfileByIdArray, group_id, role, created_by });

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
    const { nama_group, deskripsi } = request.payload;

    await this._service.editGroupById({ group_id, nama_group, deskripsi });

    return {
      status: 'success',
      message: 'Group berhasil diperbarui',
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

    const { user_profile_id, group_id } = request.params;
    const { isi_pesan, is_status=false } = request.payload;

    const notification = await this._service.addNotification({ is_status });
    const notification_id = notification.id;

    const dataMessage = await this._service.addMessage({ user_profile_id, group_id, notification_id, isi_pesan });

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

  async getMessageByGroupIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { group_id } = request.params;
    const dataMessagesByGroupId = await this._service.getMessageByGroupId({ group_id });

    // console.log(dataMessagesByGroupId);
    return {
      status: 'success',
      dataMessagesByGroupId,
    };
  }

  async putMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id, user_profile_id, group_id } = request.params;
    const { isi_pesan } = request.payload;

    await this._service.editMessageById({ id, user_profile_id, group_id, isi_pesan });

    return {
      status: 'success',
      message: 'Pesan berhasil diperbarui',
    };
  }

  async deleteMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { id, user_profile_id } = request.params;
    await this._service.deleteMessageById({ id, user_profile_id });

    return {
      status: 'success',
      message: 'Pesan berhasil dihapus',
    };
  }
}

module.exports = ChattingsHandler;