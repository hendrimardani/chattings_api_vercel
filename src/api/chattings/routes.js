const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    options: { auth: false }, // Harus di atur ke false
    handler: handler.postRegisterHandler,
  },
];

module.exports = routes;