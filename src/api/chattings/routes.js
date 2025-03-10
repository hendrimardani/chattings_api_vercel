const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    handler: handler.postRegisterHandler,
  },
];

module.exports = routes;