'use strict';

const {createCloudBuildTask} = require('../../models/cloudBuildTask');
const {FAILED} = require('../../const');

/**
 * 构建准备
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function preBuild(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('pre-build', {
      message: '开始执行构建前准备工作',
    })
  );
  const prepareRes = await cloudBuildTask.preBuild();
  if (!prepareRes || prepareRes.code === FAILED) {
    socket.emit(
      'build',
      helper.parseMsg('pre-build failed', {
        message: '执行构建前准备工作失败',
      })
    );
    return;
  }
  socket.emit(
    'build',
    helper.parseMsg('pre-build', {
      message: '构建前准备工作成功',
    })
  );
}

/**
 * 下载源码
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function download(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('download repo', {
      message: '开始下载源码',
    })
  );
  const downloadRes = await cloudBuildTask.download();
  if (!downloadRes || downloadRes.code === FAILED) {
    socket.emit(
      'build',
      helper.parseMsg('download failed', {
        message: '源码下载失败',
      })
    );
    return;
  }
  socket.emit(
    'build',
    helper.parseMsg('download repo', {
      message: '源码下载成功',
    })
  );
}

/**
 * 安转依赖
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function install(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('install', {
      message: '开始安装依赖',
    })
  );
  const installRes = await cloudBuildTask.install();
  if (!installRes || installRes.code === FAILED) {
    socket.emit(
      'build',
      helper.parseMsg('install failed', {
        message: '安装依赖失败',
      })
    );
    return;
  }
  socket.emit(
    'build',
    helper.parseMsg('install', {
      message: '安装依赖成功',
    })
  );
}

/**
 * 执行构建
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function build(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('build', {
      message: '开始启动云构建',
    })
  );
  const buildRes = await cloudBuildTask.build();
  if (!buildRes || buildRes.code === FAILED) {
    socket.emit(
      'build',
      helper.parseMsg('build failed', {
        message: '云构建任务执行失败',
      })
    );
    return;
  }
  socket.emit(
    'build',
    helper.parseMsg('build', {
      message: '云构建任务执行成功',
    })
  );
}

/**
 * 发布准备
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function prePublish(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('pre-publish', {
      message: '开始发布前检查',
    })
  );
  const prePublishRes = await cloudBuildTask.prePublish();
  if (!prePublishRes || prePublishRes.code === FAILED) {
    socket.emit(
      'build',
      helper.parseMsg('pre-publish failed', {
        message: '发布前检查失败，失败原因：' + (prePublishRes && prePublishRes.message ? prePublishRes.message : '未知'),
      })
    );
    throw new Error('发布终止');
  }
  socket.emit(
    'build',
    helper.parseMsg('pre-publish', {
      message: '发布前检查通过',
    })
  );
}

/**
 * 执行发布
 * @param {*} cloudBuildTask
 * @param {*} socket
 * @param {*} helper
 */
async function publish(cloudBuildTask, socket, helper) {
  socket.emit(
    'build',
    helper.parseMsg('publish', {
      message: '开始发布',
    })
  );
  const buildRes = await cloudBuildTask.publish();
  if (!buildRes) {
    socket.emit(
      'build',
      helper.parseMsg('publish failed', {
        message: '发布失败',
      })
    );
    return;
  }
  socket.emit(
    'build',
    helper.parseMsg('publish', {
      message: '发布成功',
    })
  );
}

module.exports = (app) => {
  class Controller extends app.Controller {
    async index() {
      const {ctx, app} = this;
      const {socket, helper} = ctx;
      const cloudBuildTask = await createCloudBuildTask(ctx, app);
      try {
        // 构建流程
        await preBuild(cloudBuildTask, socket, helper);
        await download(cloudBuildTask, socket, helper);
        await install(cloudBuildTask, socket, helper);
        await build(cloudBuildTask, socket, helper);

        // 发布流程
        await prePublish(cloudBuildTask, socket, helper);
        await publish(cloudBuildTask, socket, helper);

        let messageUrlTip = '云构建成功，访问链接：';

        if (cloudBuildTask.isProd()) {
          if (cloudBuildTask.isHistory()) {
            messageUrlTip += `https://z-cli.hapinesszj.cn/history-${cloudBuildTask._name}`;
          } else {
            messageUrlTip += `https://z-cli.hapinesszj.cn/${cloudBuildTask._name}`;
          }
        } else {
          if (cloudBuildTask.isHistory()) {
            messageUrlTip += `http://z-cli-test.hapinesszj.cn/history-${cloudBuildTask._name}`;
          } else {
            messageUrlTip += `http://z-cli-test.hapinesszj.cn/${cloudBuildTask._name}`;
          }
        }

        // 发布结果
        socket.emit(
          'build',
          helper.parseMsg('build success', {
            message: messageUrlTip,
          })
        );
        socket.disconnect();
      } catch (error) {
        socket.emit(
          'build',
          helper.parseMsg('error', {
            message: '云构建失败，失败原因：' + error.message,
          })
        );
        socket.disconnect();
      }
    }
  }
  return Controller;
};
