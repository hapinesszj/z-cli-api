const {Controller} = require('egg');
const {success} = require('../utils/tools');
const Package = require('../../package.json');

class PingController extends Controller {
  /**
   * @description ping
   * @returns success failed
   * @author by hapinesszj
   */
  async index() {
    const {ctx, app} = this;
    const {status} = app.redis;
    const {version} = await app.mongoose.connection.db.command({buildInfo: 1});

    ctx.body = success({
      mongoVersion: version,
      redisStatus: status,
      appVersion: Package.version,
      env: process.env.PING,
    });
  }
}

module.exports = PingController;
