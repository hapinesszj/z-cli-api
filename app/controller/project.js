'use strict';

const {Controller} = require('egg');
const OSS = require('../models/oss');
const config = require('../../config/db');
const {success, failed} = require('../utils/tools');

class ProjectController extends Controller {
  /**
   * 获取模版数据
   */
  async getTemplates() {
    try {
      const {ctx} = this;
      const res = await ctx.model.Template.find();

      if (res && res.length > 0) {
        ctx.body = success('获取模版数据成功', res);
      } else {
        ctx.body = success('暂无数据', []);
      }
    } catch (error) {
      ctx.body = failed('获取模版数据异常', error);
    }
  }

  /**
   * 获取oss项目文件
   * @returns
   */
  async getOssTargetProject() {
    const {ctx} = this;
    const ossProjectName = ctx.query.name;
    let ossProjectType = ctx.query.type;

    if (!ossProjectName) {
      ctx.body = failed('项目名称不存在');
      return;
    }

    if (!ossProjectType) {
      ossProjectType = 'prod';
    }
    let oss;
    if (ossProjectType === 'prod') {
      oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      oss = new OSS(config.OSS_DEV_BUCKET);
    }
    if (oss) {
      const fileList = await oss.list(ossProjectName);
      if (fileList && fileList.length > 0) {
        ctx.body = success('获取项目文件成功', fileList);
      } else {
        ctx.body = success('获取项目文件失败');
      }
    } else {
      ctx.body = success('获取项目文件失败');
    }
  }

  /**
   * 获取oss指定文件
   */
  async getOssTargetFile() {
    const {ctx} = this;
    const dir = ctx.query.name;
    const file = ctx.query.file;
    let ossProjectType = ctx.query.type;
    if (!dir || !file) {
      ctx.body = failed('请提供OSS文件名称');
      return;
    }
    if (!ossProjectType) {
      ossProjectType = 'prod';
    }
    let oss;
    if (ossProjectType === 'prod') {
      oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      oss = new OSS(config.OSS_DEV_BUCKET);
    }
    if (oss) {
      const fileList = await oss.list(dir);
      const fileName = `${dir}/${file}`;
      const finalFile = fileList.find((item) => item.name === fileName);
      ctx.body = success('获取项目文件成功', finalFile);
    } else {
      ctx.body = failed('获取项目文件失败');
    }
  }
}

module.exports = ProjectController;
