/* eslint valid-jsdoc: "off" */

'use strict';
const {REDIS_PORT, REDIS_HOST, REDIS_PWD, MONGODB_URL} = require('./db');

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1690808505576_4510';

  // add your middleware config here
  config.middleware = [];

  // add WebSocket Server config
  config.io = {
    namespace: {
      '/': {
        connectionMiddleware: ['auth'],
        packetMiddleware: ['filter'],
      },
    },
  };

  // add redis Server config
  config.redis = {
    client: {
      port: REDIS_PORT,
      host: REDIS_HOST,
      password: REDIS_PWD,
      db: 0,
    },
  };

  // add mongoose Server config
  config.mongoose = {
    url: MONGODB_URL,
    options: {
      useUnifiedTopology: true,
    },
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
