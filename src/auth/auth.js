const Jwt = require('@hapi/jwt');

module.exports = {
    name: 'auth',
    register: async (server) => {
        await server.register(Jwt);

        server.auth.strategy('jwt', 'jwt', {
            keys: process.env.JWT_SECRET, // Ganti dengan secret key yang kuat
            verify: { 
                aud: false, 
                iss: false, 
                sub: false, 
                maxAgeSec: 3600 // Token berlaku selama 1 jam
            },
            validate: (artifacts, request, h) => {
                return { isValid: true, credentials: { user: artifacts.decoded.payload } };
            }
        });

        server.auth.default('jwt'); // Gunakan strategi JWT sebagai default
    }
};
