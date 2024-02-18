'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const userHome = require('user-home');
const glob = require('glob');
const Git = require('simple-git');
const {success, failed, checkCommand, exec} = require('../utils/tools');
const OSS = require('../models/oss');
const REDIS_PREFIX = 'cloudpublish';

class CloudPublishTask {
  /**
   * @description 云发布构造器
   * @param {object} options
   * @param {object} ctx
   * @param {object} app
   * @author by hapinesszj
   */
  constructor(options, ctx, app) {
    this._ctx = ctx;
    this._app = app;
    this._logger = this._ctx.logger; // 日志对象
    this._gitType = options.gitType; // Git类型
    this._login = options.login; // 远程仓库登录名
    this._name = options.name; // 项目名称
    this._version = options.version; // 项目版本号
    this._branch = options.branch; // 仓库分支号
    this._buildCmd = options.buildCmd; // 构建命令
    this._dir = path.resolve(userHome, '.z-cli', 'cloudbuild', `${this._name}@${this._version}`); // 缓存目录
    this._sourceCodeDir = path.resolve(this._dir, this._name); // 缓存源码目录
    this._prod = options.prod === 'true';
    this._isHistoryRouter = options.isHistoryRouter === 'true';
    this._logger.info('_dir', this._dir);
    this._logger.info('_sourceCodeDir', this._sourceCodeDir);
    this._logger.info('_prod', this._prod);
  }

  /**
   * @description 构建预检
   * @returns function success | function failed
   * @author by hapinesszj
   */
  async preBuild() {
    fse.ensureDirSync(this._dir);
    fse.emptyDirSync(this._dir);
    this._git = new Git(this._dir);

    if (this._prod) {
      this.oss = new OSS(process.env.OSS_PROD_BUCKET);
    } else {
      this.oss = new OSS(process.env.OSS_DEV_BUCKET);
    }

    return success();
  }

  /**
   * @description 源码下载
   * @returns function success | function failed
   * @author by hapinesszj
   */
  async codeDownload() {
    let repo = null;
    const gitType = this._gitType;
    const login = this._login;
    const name = this._name;
    if (gitType == 'github') {
      repo = `https://github.com/${login}/${name}.git`;
    } else if (gitType == 'gitee') {
      repo = `https://gitee.com/${login}/${name}.git`;
    }

    if (!repo) return failed();

    await this._git.clone(repo);
    this._git = new Git(this._sourceCodeDir);
    await this._git.checkout(['-b', this._branch, `origin/${this._branch}`]);
    return fs.existsSync(this._sourceCodeDir) ? success() : failed();
  }

  /**
   * @description 依赖安装
   * @returns function success | function failed
   * @author by hapinesszj
   */
  async libInstall() {
    const res = await this.execCommand('npm install --registry=https://registry.npmmirror.com --production=false');
    return res ? success() : failed();
  }

  /**
   * @description 构建任务
   * @returns function success | function failed
   * @author by hapinesszj
   */
  async buildTask() {
    let res;
    if (checkCommand(this._buildCmd)) {
      res = await this.execCommand(this._buildCmd);
    } else {
      res = false;
    }
    return res ? success() : failed();
  }

  /**
   * @description 发布预检
   * @returns function success | function failed
   * @author by hapinesszj
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
   * @description 执行发布
   * @returns Promise<true | false>
   * @author by hapinesszj
   */
  publishTask() {
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
   * @description 清理构建产物、redis缓存
   * @author by hapinesszj
   */
  async clean() {
    const {socket} = this._ctx;
    const client = socket.id;
    const redisKey = `${REDIS_PREFIX}:${client}`;

    if (fs.existsSync(this._dir)) {
      fse.removeSync(this._dir);
    }
    await this._app.redis.del(redisKey);
  }

  /**
   * @description 判断是否是正式发布环境
   * @returns boolean true | false
   * @author by hapinesszj
   */
  isProd() {
    return this._prod;
  }

  /**
   * @description 判断是否是history路由形式
   * @returns boolean true | false
   * @author by hapinesszj
   */
  isHistory() {
    return this._isHistoryRouter;
  }

  /**
   * @description 动态执行命令
   * @param {string} command
   * @author by hapinesszj
   */
  execCommand(command) {
    const commands = command.split(' ');
    if (commands.length === 0) return null;

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

/**
 * @description 创建构建任务
 * @param {object} ctx
 * @param {object} app
 * @returns class CloudPublishTask
 * @author by hapinesszj
 */
async function createCloudPublishTask(ctx, app) {
  const {socket, helper} = ctx;
  const client = socket.id;
  const redisKey = `${REDIS_PREFIX}:${client}`;
  const redisTask = await app.redis.get(redisKey);
  const task = JSON.parse(redisTask);
  socket.emit(
    'publish',
    helper.parseMsg('create task', {
      message: '创建云发布任务',
    })
  );
  return new CloudPublishTask(
    {
      gitType: task.gitType,
      login: task.login,
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
  CloudPublishTask,
  createCloudPublishTask,
};
