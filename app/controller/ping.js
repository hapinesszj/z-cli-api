const {Controller} = require('egg');
const {success} = require('../utils/tools');

class PingController extends Controller {
  /**
   * @description ping api
   * @author by hapinesszj
   */
  async index() {
    const {ctx, app} = this;
    const {status} = app.redis;
    const {version} = await app.mongoose.connection.db.command({buildInfo: 1});

    ctx.body = success({
      mongoVersion: version,
      redisStatus: status,
      env: process.env.PING,
      releaseVersion: process.env.VERSION,
    });
  }
}

module.exports = PingController;
