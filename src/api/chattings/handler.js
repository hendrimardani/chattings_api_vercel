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
    const { nama, email, password, repeat_password } = request.payload;
    const user = await this._service.addUser({ email, password, repeat_password });

    const id = user.id;
    const hashedPassword = user.password;
    const data = await this._service.addUserProfile({ id, nama, hashedPassword });

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
      data,
    });
    
    response.code(201);
    return response;
  }

  async postLoginHandler(request, h) {
    const { email, password } = request.payload;
    const user = await this._service.login({ email, password });

    const token = require('@hapi/jwt').token.generate(
      { id: user.id, email: user.email },
      { key: process.env.JWT_SECRET, algorithm: 'HS256' },
      { ttlSec: 604800 }// Token kedaluwarsa dalam 7 hari setelah login
    );

    return {
      status: 'success',
      message: 'Berhasil masuk',
      token,
    };
  }

  async getUsersHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const users = await this._service.getUsers();

    return {
      status: 'success',
      data: {
        users,
      },
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
      data: {
        dataUserProfileById,
      },
    };
  }

  async putUserProfileByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    // id ini digunakan ketika mengakses user sedang login lewat authentikasi
    // const id = request.auth.credentials.user.id;

    const { id } = request.params;
    const { nama, nik, umur, tgl_lahir } = request.payload;
    await this._service.editUserProfileById({ id, nama, nik, umur, tgl_lahir });

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
    const { nama_group } = request.payload;

    const group = await this._service.addGroup({ nama_group });
    const group_id = group.id;

    const data = await this._service.addUserGroup({ user_profile_id, group_id });

    const response = h.response({
      status: 'success',
      message: 'Group berhasil ditambahkan',
      data,
    });
    response.code(201);
    return response;
  }

  async getGroupsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const groups = await this._service.getGroups();

    return {
      status: 'success',
      data: {
        groups,
      },
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
      data: {
        dataGroupById,
      },
    };
  }

  async getUserGroupsHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const userGroups = await this._service.getUserGroups();

    return {
      status: 'success',
      data: {
        userGroups,
      },
    };
  }

  async putGroupByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }

    const { group_id } = request.params;
    const { nama_group } = request.payload;

    await this._service.editGroupById({ group_id, nama_group });

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

    const data = await this._service.addMessage({ user_profile_id, group_id, notification_id, isi_pesan });

    const response = h.response({
      status: 'success',
      message: 'Pesan berhasil ditambahkan',
      data,
    });
    response.code(201);
    return response;
  }

  async getMessagesHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const messages = await this._service.getMessages();

    return {
      status: 'success',
      data: {
        messages,
      },
    };
  } 

  async getMessageByIdHandler(request, h) {
    if (!request.auth || !request.auth.credentials) {
      return h.response({ message: 'Unauthorized' }).code(401);
    }
    const { id } = request.params;
    const dataMessageById = await this._service.getMessageById({ id });

    console.log(dataMessageById);
    return {
      status: 'success',
      data: {
        dataMessageById,
      },
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