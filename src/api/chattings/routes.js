const ChaatingValidator = require('../../validator/chattings');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/register',
    options: {
      auth: false,
      validate: {
        payload: (value, options) => {
          return ChaatingValidator.validateRegister(value);
        },
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: error.details ? error.details.map((err) => err.message) : error.message,
          }).code(400).takeover();
        },
      },
    },
    handler: handler.postRegisterHandler,
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false,
      validate: {
        payload: (value, options) => {
          return ChaatingValidator.validateLogin(value);
        },
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: error.details ? error.details.map((err) => err.message) : error.message,
          }).code(400).takeover();
        },
      },
    },
    handler: handler.postLoginHandler,
  },
  {
    method: 'GET',
    path: '/users',
    handler: handler.getUsersHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'GET',
    path: '/user_profile/{user_id}',
    handler: handler.getUserProfileByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'PUT',
    path: '/user_profile/{user_id}',
    handler: handler.putUserProfileByIdHandler,
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data'
      },
    },
  },
  {
    method: 'DELETE',
    path: '/user/{id}',
    handler: handler.deleteUserByIdHandler,
    options: {
      auth: 'jwt'  // Tambahkan auth di sini
    },
  },
  {
    method: 'POST',
    path: '/user_profile/{user_id_list_string}/group',
    handler: handler.postUserGroupHandler, // Nama entias relasinya
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data'
      },
    },
  },
  {
    method: 'POST',
    path: '/group/{group_id}',
    handler: handler.postUserByGroupIdHandler,
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      validate: {
        payload: (value, options) => {
          return ChaatingValidator.validateUserGroup(value);
        },
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: error.details ? error.details.map((err) => err.message) : error.message,
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/group/{id}',
    handler: handler.getGroupByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'GET',
    path: '/user_profiles/groups',
    handler: handler.getUserGroupsHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'PUT',
    path: '/group/{group_id}',
    handler: handler.putGroupByIdHandler, // Nama entias relasinya
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        allow: 'multipart/form-data'
      },
    },
  },
  {
    method: 'DELETE',
    path: '/group/{id}',
    handler: handler.deleteGroupByIdHandler,
    options: {
      auth: 'jwt'  // Tambahkan auth di sini
    },
  },
  {
    method: 'POST',
    path: '/user_profile/{user_id}/group/{group_id}/notification',
    handler: handler.postMessageHandler, // Nama entitas relasinya
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      validate: {
        payload: (value, options) => {
          return ChaatingValidator.validateMessages(value);
        },
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: error.details ? error.details.map((err) => err.message) : error.message,
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/messages',
    handler: handler.getMessagesHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'GET',
    path: '/message/{id}',
    handler: handler.getMessageByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'PUT',
    path: '/message/{id}/user_profile/{user_id}/group/{group_id}',
    handler: handler.putMessageByIdHandler,
    options: {
      auth: 'jwt', // Tambahkan auth di sini
      validate: {
        payload: (value, options) => {
          return ChaatingValidator.validateMessages(value);
        },
        failAction: (request, h, error) => {
          return h.response({
            status: 'fail',
            message: error.details ? error.details.map((err) => err.message) : error.message,
          }).code(400).takeover();
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/message/{id}/user_profile/{user_id}',
    handler: handler.deleteMessageByIdHandler,
    options: {
      auth: 'jwt'  // Tambahkan auth di sini
    },
  },
];

module.exports = routes;