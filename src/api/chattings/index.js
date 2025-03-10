const ChattingsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'chattings',
  version: '1.0.0',
  register: async (server, { service }) => {
    const notesHandler = new ChattingsHandler(service);
    server.route(routes(notesHandler));
  },
};