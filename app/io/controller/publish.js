'use strict';

const {createCloudPublishTask} = require('../../models/cloudPublishTask');
const {FAILED} = require('../../const');

/**
 * @description 构建预检
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function preBuild(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('prepare', {
      message: '开始执行构建预检工作',
    })
  );
  const prepareRes = await cloudPublishTask.preBuild();
  if (!prepareRes || prepareRes.code === FAILED) {
    socket.emit(
      'publish',
      helper.parseMsg('prepare failed', {
        message: '执行执行构建预检工作失败',
      })
    );
    return;
  }
  socket.emit(
    'publish',
    helper.parseMsg('prepare', {
      message: '执行构建预检工作成功',
    })
  );
}

/**
 * @description 源码下载
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function codeDownload(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('download repo', {
      message: '开始下载源码',
    })
  );
  const downloadRes = await cloudPublishTask.codeDownload();
  if (!downloadRes || downloadRes.code === FAILED) {
    socket.emit(
      'publish',
      helper.parseMsg('download failed', {
        message: '源码下载失败',
      })
    );
    return;
  }
  socket.emit(
    'publish',
    helper.parseMsg('download repo', {
      message: '源码下载成功',
    })
  );
}

/**
 * @description 依赖安装
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function libInstall(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('install', {
      message: '开始安装依赖',
    })
  );
  const installRes = await cloudPublishTask.libInstall();
  if (!installRes || installRes.code === FAILED) {
    socket.emit(
      'publish',
      helper.parseMsg('install failed', {
        message: '安装依赖失败',
      })
    );
    return;
  }
  socket.emit(
    'publish',
    helper.parseMsg('install', {
      message: '安装依赖成功',
    })
  );
}

/**
 * @description 构建任务
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function buildTask(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('build', {
      message: '开始启动云构建任务',
    })
  );
  const buildRes = await cloudPublishTask.buildTask();
  if (!buildRes || buildRes.code === FAILED) {
    socket.emit(
      'publish',
      helper.parseMsg('build failed', {
        message: '云构建任务执行失败',
      })
    );
    return;
  }
  socket.emit(
    'publish',
    helper.parseMsg('build', {
      message: '云构建任务执行成功',
    })
  );
}

/**
 * @description 发布预检
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function prePublish(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('pre-publish', {
      message: '开始执行发布预检工作',
    })
  );
  const prePublishRes = await cloudPublishTask.prePublish();
  if (!prePublishRes || prePublishRes.code === FAILED) {
    socket.emit(
      'publish',
      helper.parseMsg('pre-publish failed', {
        message: '发布前检查失败，失败原因：' + (prePublishRes && prePublishRes.message ? prePublishRes.message : '未知'),
      })
    );
    throw new Error('发布终止');
  }
  socket.emit(
    'publish',
    helper.parseMsg('pre-publish', {
      message: '执行发布预检工作成功',
    })
  );
}

/**
 * @description 发布任务
 * @param {object} cloudPublishTask
 * @param {object} socket
 * @param {object} helper
 * @author by hapinesszj
 */
async function publishTask(cloudPublishTask, socket, helper) {
  socket.emit(
    'publish',
    helper.parseMsg('publish', {
      message: '开始启动云发布任务',
    })
  );
  const buildRes = await cloudPublishTask.publishTask();
  if (!buildRes) {
    socket.emit(
      'publish',
      helper.parseMsg('publish failed', {
        message: '云发布任务执行失败',
      })
    );
    return;
  }
  socket.emit(
    'publish',
    helper.parseMsg('publish', {
      message: '云发布任务执行成功',
    })
  );
}

module.exports = (app) => {
  class Controller extends app.Controller {
    async index() {
      const {ctx, app} = this;
      const {socket, helper} = ctx;
      const cloudPublishTask = await createCloudPublishTask(ctx, app);
      try {
        // 构建流程
        await preBuild(cloudPublishTask, socket, helper);
        await codeDownload(cloudPublishTask, socket, helper);
        await libInstall(cloudPublishTask, socket, helper);
        await buildTask(cloudPublishTask, socket, helper);

        // 发布流程
        await prePublish(cloudPublishTask, socket, helper);
        await publishTask(cloudPublishTask, socket, helper);

        let messageUrlTip = '云发布成功，访问链接：';

        if (cloudPublishTask.isProd()) {
          if (cloudPublishTask.isHistory()) {
            messageUrlTip += `https://project.hapinesszj.cn/${cloudPublishTask._name}`;
          } else {
            messageUrlTip += `https://cli.hapinesszj.cn/${cloudPublishTask._name}/index.html`;
          }
        } else {
          if (cloudPublishTask.isHistory()) {
            messageUrlTip += `https://test-project.hapinesszj.cn/${cloudPublishTask._name}`;
          } else {
            messageUrlTip += `https://test-cli.hapinesszj.cn/${cloudPublishTask._name}/index.html`;
          }
        }

        // 发布结果
        socket.emit(
          'publish',
          helper.parseMsg('publish success', {
            message: messageUrlTip,
          })
        );
        socket.disconnect();
      } catch (error) {
        socket.emit(
          'publish',
          helper.parseMsg('error', {
            message: '云发布失败，失败原因：' + error.message,
          })
        );
        socket.disconnect();
      }
    }
  }
  return Controller;
};
