'use strict';

module.exports = (app) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const TestSchema = new Schema({
    key: {type: String},
    content: {type: String},
  });

  return mongoose.model('Test', TestSchema, 'test');
};
