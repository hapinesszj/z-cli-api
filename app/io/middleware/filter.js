'use strict';

module.exports = () => {
  return async (ctx, next) => {
    console.log('filter');
    await next();
    console.log('packet response!');
  };
};
