// mengimpor dotenv dan menjalankan konfigurasinya
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const chattings = require('./api/chattings');
const auth = require('./auth/auth');
const ChattingsService = require('./services/supabase/ChattingsService');
const ClientError = require('./exceptions/ClientError');

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

    // Jika dijalankan di vercel
    await server.initialize();

    // Jika dijalankan di localhost
    // await server.start();
    // console.log(`Server berjalan pada ${server.info.uri}`);
  }
  return server;
};

// Jika dijalankan di localhost
// init();

// Jika dijalankan di vercel
module.exports = async (req, res) => {
  const server = await init();

  const response = await server.inject({
    method: req.method,
    url: req.url,
    payload: req.body,
    headers: req.headers
  });

  res.status(response.statusCode).json(response.result);
};
