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
      auth: false // Atur supaya tidak di unautorized
      
    }, 
    handler: handler.postLoginHandler,
  },
  {
    method: 'PUT',
    path: '/user_profile/{id}',
    handler: handler.putUserProfileByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
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
    path: '/user_profile/{id}',
    handler: handler.getUserProfileByIdHandler,
    options: {
      auth: 'jwt' // Tambahkan auth di sini
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
    method: 'POST',
    path: '/user/{user_profile_id}/group',
    handler: handler.postUserGroupHandler, // Nama entias relasinya
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'POST',
    path: '/user/{user_profile_id}/group/{group_id}/notification',
    handler: handler.postMessageHandler, // Nama entitas relasinya
    options: {
      auth: 'jwt' // Tambahkan auth di sini
    },
  },
  {
    method: 'PUT',
    path: '/message/{id}/user/{user_profile_id}/group/{group_id}',
    handler: handler.putMessageHandler,
    options: {
      auth: 'jwt'  // Tambahkan auth di sini
    },
  },
  {
    method: 'DELETE',
    path: '/message/{id}/user/{user_profile_id}',
    handler: handler.deleteMessageByIdHandler,
    options: {
      auth: 'jwt'  // Tambahkan auth di sini
    },
  },
];

module.exports = routes;