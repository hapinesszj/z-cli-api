'use strict';

module.exports = {
  /**
   * @description 格式信息
   * @param {object} action
   * @param {object} payload
   * @param {object} metadata
   * @author by hapinesszj
   */
  parseMsg(action, payload = {}, metadata = {}) {
    const meta = Object.assign(
      {},
      {
        timestamp: Date.now(),
      },
      metadata
    );

    return {
      meta,
      data: {
        action,
        payload,
      },
    };
  },
};
