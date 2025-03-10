class ChattingsHandler {
  constructor(service) {
    this._service = service;
    this.postRegisterHandler = this.postRegisterHandler.bind(this);
  }

  async postRegisterHandler(request, h) {
    const { nama, nik, email, password, umur, tgl_lahir } = request.payload;
    const user = await this._service.addUser({ nama, email, password });

    const user_id = user[0].id
    const userProfile = await this._service.addUserProfile({ user_id, nama, nik, email, password, umur, tgl_lahir });

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
      data: {
        user,
      },
    });
    response.code(201);
    return response;
  }

}

module.exports = ChattingsHandler;