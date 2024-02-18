'use strict';

module.exports = (app) => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const TemplateSchema = new Schema({
    name: {type: String},
    npmName: {type: String},
    version: {type: String},
    type: {type: String},
    installCommand: {type: String},
    startCommand: {type: String},
    isComplete: {type: Boolean},
    ignore: {type: Array},
    tag: {type: Array},
    buildPath: {type: String},
    examplePath: {type: String},
  });

  return mongoose.model('Template', TemplateSchema, 'template');
};
