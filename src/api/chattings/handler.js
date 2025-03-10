class ChattingsHandler {
  constructor(service) {
    this._service = service;

    this.postRegisterHandler = this.postRegisterHandler.bind(this);
    this.postLoginHandler = this.postLoginHandler.bind(this);
    this.putUserProfileByIdHandler = this.putUserProfileByIdHandler.bind(this);
  }

  async postRegisterHandler(request, h) {
    const { nama, email, password, repeat_password } = request.payload;
    const user = await this._service.addUser({ email, password, repeat_password });

    const user_id = user[0].id;
    const hashedPassword = user[0].password;
    await this._service.addUserProfile({ user_id, nama, email, hashedPassword });

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async postLoginHandler(request, h) {
    const { email, password } = request.payload;
    const user = await this._service.login({ email, password });

    const token = require('@hapi/jwt').token.generate(
      { id: user.id, email: user.email },
      { key: process.env.JWT_SECRET, algorithm: 'HS256' }
    );

    return {
      status: 'success',
      message: 'Berhasil masuk',
      token,   
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
}

module.exports = ChattingsHandler;