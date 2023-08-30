const {Controller} = require('egg');
const {success, failed} = require('../utils/tools');

class MongoController extends Controller {
  /**
   * 获取测试数据
   */
  async getMongoTestData() {
    const {ctx} = this;
    const res = await ctx.model.Test.find();

    if (res && res.length > 0) {
      ctx.body = success('测试数据获取成功', res);
    } else {
      ctx.body = failed('暂无数据');
    }
  }
}

module.exports = MongoController;
