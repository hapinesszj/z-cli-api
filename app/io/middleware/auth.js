'use strict';

const {createCloudPublishTask} = require('../../models/cloudPublishTask');
const REDIS_PREFIX = 'cloudpublish';

module.exports = () => {
  return async (ctx, next) => {
    const {app, socket, logger, helper} = ctx;
    const {id} = socket;
    const {redis} = app;
    const query = socket.handshake.query;

    try {
      socket.emit(
        id,
        helper.parseMsg('connect', {
          type: 'connect',
          message: '云发布服务连接成功',
        })
      );
      let hasTask = await redis.get(`${REDIS_PREFIX}:${id}`);
      if (!hasTask) {
        await redis.set(`${REDIS_PREFIX}:${id}`, JSON.stringify(query));
      }
      hasTask = await redis.get(`${REDIS_PREFIX}:${id}`);
      logger.info('query', hasTask);

      await next();

      const cloudPublishTask = await createCloudPublishTask(ctx, app);
      await cloudPublishTask.clean();
      logger.info('disconnect!');
    } catch (e) {
      const cloudPublishTask = await createCloudPublishTask(ctx, app);
      await cloudPublishTask.clean();
      logger.error('publish error', e.message);
    }
  };
};
