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
    options: { auth: false },
    handler: handler.postLoginHandler,
  }
];

module.exports = routes;