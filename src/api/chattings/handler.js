class ChattingsHandler {
  constructor(service) {
    this._service = service;

    this.postRegisterHandler = this.postRegisterHandler.bind(this);
    this.postLoginHandler = this.postLoginHandler.bind(this);
  }

  async postRegisterHandler(request, h) {
    const { nama, email, password, repeat_password } = request.payload;
    const user = await this._service.addUser({ nama, email, password, repeat_password });

    const user_id = user[0].id;
    const hashedPassword = user[0].password;
    await this._service.addUserProfile({ user_id, nama, nik, email, hashedPassword, umur, tgl_lahir });

    const response = h.response({
      status: 'success',
      message: 'Pengguna berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async postLoginHandler(request, h) {
    // const id = request.auth.credentials.user.id;
    const { email, password } = request.payload;
    await this._service.login({ email, password });

    // const token = require('@hapi/jwt').token.generate(
    //   { id: user.id, email: user.email },
    //   { key: process.env.JWT_SECRET, algorithm: 'HS256' }
    // );

    return {
      status: 'success',
      message: 'Berhasil masuk',
    };
  }
  

}

module.exports = ChattingsHandler;