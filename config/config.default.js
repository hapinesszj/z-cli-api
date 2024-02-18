/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({path: path.resolve(__dirname, '../.env')});

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
      '/io': {
        connectionMiddleware: ['auth'],
      },
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
