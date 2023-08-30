'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const userHome = require('user-home');
const Git = require('simple-git');
const glob = require('glob');
const {success, failed, exec, checkCommand} = require('../utils/tools');
const config = require('../../config/db');
const OSS = require('../models/oss');
const REDIS_PREFIX = 'cloudbuild';

class CloudBuildTask {
  constructor(options, ctx, app) {
    this._ctx = ctx;
    this._app = app;
    this._logger = this._ctx.logger; // 日志对象
    this._repo = options.repo; // 仓库地址
    this._name = options.name; // 项目名称
    this._version = options.version; // 项目版本号
    this._branch = options.branch; // 仓库分支号
    this._buildCmd = options.buildCmd; // 构建命令
    this._dir = path.resolve(userHome, '.z-cli-dev', 'cloudbuild', `${this._name}@${this._version}`); // 缓存目录
    this._sourceCodeDir = path.resolve(this._dir, this._name); // 缓存源码目录
    this._prod = options.prod === 'true';
    this._isHistoryRouter = options.isHistoryRouter === 'true';
    this._logger.info('_dir', this._dir);
    this._logger.info('_sourceCodeDir', this._sourceCodeDir);
    this._logger.info('_prod', this._prod);
  }

  /**
   * 构建准备
   */
  async preBuild() {
    fse.ensureDirSync(this._dir);
    fse.emptyDirSync(this._dir);
    this._git = new Git(this._dir);
    if (this._prod) {
      this.oss = new OSS(config.OSS_PROD_BUCKET);
    } else {
      this.oss = new OSS(config.OSS_DEV_BUCKET);
    }
    this._logger.info('OSS', this.oss);
    return success();
  }

  /**
   * 下载源码
   */
  async download() {
    await this._git.clone(this._repo);
    this._git = new Git(this._sourceCodeDir);
    await this._git.checkout(['-b', this._branch, `origin/${this._branch}`]);
    return fs.existsSync(this._sourceCodeDir) ? success() : failed();
  }

  /**
   * 安装依赖
   */
  async install() {
    //npm install --registry=https://registry.npm.taobao.org
    const res = await this._execCommand('npm install');
    return res ? success() : failed();
  }

  /**
   * 执行构建
   */
  async build() {
    let res;
    const buildCmd = this._buildCmd;
    if (checkCommand(buildCmd)) {
      res = await this._execCommand(buildCmd);
    } else {
      res = false;
    }
    return res ? success() : failed();
  }

  /**
   * 发布准备
   */
  prePublish() {
    const buildDirs = ['dist', 'build'];
    const buildPath = buildDirs.find((dir) => fs.existsSync(path.resolve(this._sourceCodeDir, dir)));
    this._ctx.logger.info('buildPath', buildPath);
    let resolvePath = null;
    if (buildPath) {
      resolvePath = path.resolve(this._sourceCodeDir, buildPath);
    }

    if (!resolvePath) return failed('未找到构建结果，请检查');

    this._buildPath = resolvePath;
    return success();
  }

  /**
   * 执行发布
   */
  publish() {
    return new Promise((resolve) => {
      glob(
        '**',
        {
          cwd: this._buildPath,
          nodir: true,
          ignore: '**/node_modules/**',
        },
        (err, files) => {
          if (err) {
            resolve(false);
          } else {
            Promise.all(
              files.map(async (file) => {
                const filePath = path.resolve(this._buildPath, file);
                const uploadOSSRes = await this.oss.put(`${this._name}/${file}`, filePath);
                return uploadOSSRes;
              })
            )
              .then(() => {
                resolve(true);
              })
              .catch((err) => {
                this._ctx.logger.error(err);
                resolve(false);
              });
          }
        }
      );
    });
  }

  /**
   * 清理构建产物、redis缓存
   */
  async clean() {
    if (fs.existsSync(this._dir)) {
      fse.removeSync(this._dir);
    }
    const {socket} = this._ctx;
    const client = socket.id;
    const redisKey = `${REDIS_PREFIX}:${client}`;
    await this._app.redis.del(redisKey);
  }

  /**
   * 判断是否是正式发布
   * @returns
   */
  isProd() {
    return this._prod;
  }

  /**
   * 判断是否是history路由形式
   * @returns
   */
  isHistory() {
    return this._isHistoryRouter;
  }

  /**
   * 动态执行命令
   * @param {*} command
   * @returns
   */
  _execCommand(command) {
    const commands = command.split(' ');
    if (commands.length === 0) {
      return null;
    }
    const firstCommand = commands[0];
    const leftCommand = commands.slice(1) || [];
    return new Promise((resolve) => {
      const p = exec(
        firstCommand,
        leftCommand,
        {
          cwd: this._sourceCodeDir,
        },
        {stdio: 'pipe'}
      );
      p.on('error', (e) => {
        this._ctx.logger.error('build error', e);
        resolve(false);
      });
      p.on('exit', (c) => {
        this._ctx.logger.info('build exit', c);
        resolve(true);
      });
      p.stdout.on('data', (data) => {
        this._ctx.socket.emit('building', data.toString());
      });
      p.stderr.on('data', (data) => {
        this._ctx.socket.emit('building', data.toString());
      });
    });
  }
}

async function createCloudBuildTask(ctx, app) {
  const {socket, helper} = ctx;
  const client = socket.id;
  const redisKey = `${REDIS_PREFIX}:${client}`;
  const redisTask = await app.redis.get(redisKey);
  const task = JSON.parse(redisTask);
  socket.emit(
    'build',
    helper.parseMsg('create task', {
      message: '创建云构建任务',
    })
  );
  return new CloudBuildTask(
    {
      repo: task.repo,
      name: task.name,
      version: task.version,
      branch: task.branch,
      buildCmd: task.buildCmd,
      prod: task.prod,
      isHistoryRouter: task.isHistoryRouter,
    },
    ctx,
    app
  );
}

module.exports = {
  CloudBuildTask,
  createCloudBuildTask,
};
