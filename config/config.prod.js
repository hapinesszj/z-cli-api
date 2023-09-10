module.exports = (appInfo) => {
  /**
   * built-in prod config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // add redis Server config
  config.redis = {
    client: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      db: 0,
    },
  };

  // add mongoose Server config
  config.mongoose = {
    url: process.env.MONGO_URL,
    options: {
      user: process.env.MONGO_USERNAME,
      pass: process.env.MONGO_PASSWORD,
      useUnifiedTopology: true,
    },
  };

  return config;
};
