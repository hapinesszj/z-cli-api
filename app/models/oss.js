'use strict';

class OSS {
  /**
   * @description OSS构造器
   * @param {string} bucket
   * @author by hapinesszj
   */
  constructor(bucket) {
    this.oss = require('ali-oss')({
      accessKeyId: process.env.OSS_ACCESS_KEY,
      accessKeySecret: process.env.OSS_ACCESS_SECRET_KEY,
      bucket,
      region: process.env.OSS_REGION,
    });
  }

  /**
   * @description 查询oss文件列表
   * @param {string} prefix
   * @returns array
   * @author by hapinesszj
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
   * @description 文件推送至OSS
   * @param {object} object
   * @param {string} localPath
   * @param {object} options
   * @author by hapinesszj
   */
  async put(object, localPath, options = {}) {
    await this.oss.put(object, localPath, options);
  }
}

module.exports = OSS;
