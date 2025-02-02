const config = require('../config');

const Auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        throw new Error('No token, authorization denied');
    }

    if (token !== config.apiKeyToken) {
        throw new Error('Invalid token, authorization denied');
    }

    next();
};

module.exports = Auth;