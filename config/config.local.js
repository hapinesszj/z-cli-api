module.exports = (appInfo) => {
  /**
   * built-in local config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // add redis Server config
  config.redis = {
    client: {
      host: '127.0.0.1',
      port: 6379,
      password: '',
      db: 0,
    },
  };

  // add mongoose Server config
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/z-cli',
    options: {
      user: '',
      pass: '',
      useUnifiedTopology: true,
    },
  };

  return config;
};
