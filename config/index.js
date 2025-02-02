const nodeEnv = process.env.NODE_ENV || 'demo';

const config = require(`./config.${nodeEnv}.json`);

module.exports = config;
