'use strict';

const {SUCCESS, FAILED} = require('../const');

/**
 * 响应成功
 * @param {*} message
 * @param {*} data
 * @returns
 */
function success(message, data) {
  return response(SUCCESS, message, data);
}

/**
 * 响应失败
 * @param {*} message
 * @param {*} data
 * @returns
 */
function failed(message, data) {
  return response(FAILED, message, data);
}

/**
 * 响应结果
 * @param {*} code
 * @param {*} message
 * @param {*} data
 * @returns
 */
function response(code, message, data) {
  return {
    code,
    message,
    data,
  };
}

/**
 * 格式化名称
 * @param {*} name
 * @returns
 */
function formatName(name) {
  let _name = name;
  if (_name && _name.startsWith('@') && _name.indexOf('/') > 0) {
    const nameArray = _name.split('/');
    _name = nameArray.join('_').replace('@', '');
  }
  return _name;
}

/**
 * 子进程执行命令
 * @param {*} command
 * @param {*} args
 * @param {*} options
 * @returns
 */
function exec(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

/**
 * 命令检查
 * @param {*} command
 * @returns
 */
function checkCommand(command) {
  if (command) {
    const commands = command.split(' ');
    if (commands.length === 0 || ['npm', 'cnpm'].indexOf(commands[0]) < 0) {
      return false;
    }
    return true;
  }
  return false;
}

module.exports = {
  success,
  failed,
  response,
  formatName,
  exec,
  checkCommand,
};
