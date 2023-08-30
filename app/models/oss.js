'use strict';

const config = require('../../config/db');

class OSS {
  constructor(bucket) {
    this.oss = require('ali-oss')({
      accessKeyId: config.OSS_ACCESS_KEY,
      accessKeySecret: config.OSS_ACCESS_SECRET_KEY,
      bucket,
      region: config.OSS_REGION,
    });
  }

  /**
   * 查询oss文件列表
   * @param {*} prefix
   * @returns
   */
  async list(prefix) {
    const ossFileList = await this.oss.list({
      prefix,
    });
    if (ossFileList && ossFileList.objects) {
      return ossFileList.objects;
    }
    return [];
  }

  /**
   * 文件推送oss
   * @param {*} object
   * @param {*} localPath
   * @param {*} options
   */
  async put(object, localPath, options = {}) {
    await this.oss.put(object, localPath, options);
  }
}

module.exports = OSS;
