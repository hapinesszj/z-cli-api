'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const {router, controller} = app;
  // business api
  router.get('/project/getTemplates', controller.project.getTemplates);

  // oss api
  router.get('/project/getOssTargetProject', controller.project.getOssTargetProject);
  router.get('/project/getOssTargetFile', controller.project.getOssTargetFile);

  // websocket api
  app.io.route('build', app.io.controller.build.index);

  // test api
  router.get('/ping', controller.ping.index);
};
