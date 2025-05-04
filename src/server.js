// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const chattings = require('./api/chattings');
const auth = require('./auth/auth');
const ChattingsService = require('./services/supabase/ChattingsService');
const ClientError = require('./exceptions/ClientError');
const ChaatingValidator = require('./validator/chattings');

let server;

const init = async () => {
  if (!server) {
    const chattingsService = new ChattingsService();

    server = Hapi.server({
      port: process.env.PORT,
      host: process.env.HOST,
      routes: {
        cors: {
          origin: ['*'],
        },
      },
    });

    await server.register([
      auth,
      {
        plugin: chattings,
        options: {
          service: chattingsService,
          validator: ChaatingValidator,
        },
      }]);

    server.ext('onPreResponse', (request, h) => {
      const { response } = request;
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      return h.continue;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
  }
  return server;
};

init();
