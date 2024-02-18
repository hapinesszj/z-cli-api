'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const {router, controller} = app;
  const io = app.io.of('/io');

  // websocket api
  io.route('publish', app.io.controller.publish.index);

  // business api
  router.get('/project/getTemplates', controller.project.getTemplates);
  router.get('/project/getOssTargetProject', controller.project.getOssTargetProject);
  router.get('/project/getOssTargetFile', controller.project.getOssTargetFile);

  // ping api
  router.get('/ping', controller.ping.index);
};
