const nodeEnv = process.env.NODE_ENV || 'example';

const config = require(`./config.${nodeEnv}.json`);

module.exports = config;
