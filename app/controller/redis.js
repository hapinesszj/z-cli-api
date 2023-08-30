const {Controller} = require('egg');
const {success, failed} = require('../utils/tools');

class RedisController extends Controller {
  /**
   * 获取redis指定key
   */
  async getRedisTargetKey() {
    const {ctx, app} = this;
    const {key} = ctx.query;
    if (key) {
      const value = await app.redis.get(key);
      ctx.body = success('获取key成功', `redis[${key}]:${value}`);
    } else {
      ctx.body = failed('请提供参数key');
    }
  }
}

module.exports = RedisController;
