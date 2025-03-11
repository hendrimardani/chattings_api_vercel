const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    options: { auth: false }, // Atur supaya tidak di unautorized
    handler: handler.postRegisterHandler,
  },
  {
    method: 'POST',
    path: '/login',
    options: { auth: false }, // Atur supaya tidak di unautorized
    handler: handler.postLoginHandler,
  },
  {
    method: 'PUT',
    path: '/user_profile/{id}',
    handler: handler.putUserProfileByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    }
  },
  {
    method: 'GET',
    path: '/users',
    handler: handler.getUsersHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    }
  },
  {
    method: 'POST',
    path: '/user/{user_profile_id}/group',
    handler: handler.postUserGroupHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    }
  }
];

module.exports = routes;