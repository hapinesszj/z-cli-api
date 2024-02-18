'use strict';

const {SUCCESS, FAILED} = require('../const');

/**
 * @description 响应成功
 * @param {string} message
 * @param {object} data
 * @returns function response
 * @author by hapinesszj
 */
function success(message, data) {
  return response(SUCCESS, message, data);
}

/**
 * @description 响应失败
 * @param {string} message
 * @param {object} data
 * @returns function response
 * @author by hapinesszj
 */
function failed(message, data) {
  return response(FAILED, message, data);
}

/**
 * @description 响应结果
 * @param {string} code
 * @param {string} message
 * @param {object} data
 * @returns {code, messamge, data}
 * @author by hapinesszj
 */
function response(code, message, data) {
  return {
    code,
    message,
    data,
  };
}

/**
 * @description 格式化名称
 * @param {string} name
 * @returns string
 * @author by hapinesszj
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
 * @description 子进程执行命令
 * @param {string} command
 * @param {object} args
 * @param {object} options
 * @returns node child_process
 * @author by hapinesszj
 */
function exec(command, args, options) {
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;

  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

/**
 * @description 命令检查
 * @param {string} command
 * @returns boolean true | false
 * @author by hapinesszj
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
