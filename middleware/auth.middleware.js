const config = require('../config');

const Auth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(403).json({
            status: 'ERROR', 
            message :'No token, authorization denied'
        });
    }

    if (token !== config.apiKeyToken) {
        return res.status(403).json({
            status: 'ERROR', 
            message :'Invalid token, authorization denied'
        });
    }

    next();
};

module.exports = Auth;