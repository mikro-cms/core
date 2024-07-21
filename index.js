/**
 * Module dependencies.
 */
const express = require('./express');
const config = require('./config');
const database = require('./database');
const schema = require('./schema');
const model = require('./model');
const locale = require('./locale');
const middleware = require('./middleware');
const router = require('./router');
const service = require('./service');
const public = require('./public');

/**
 * Initialize the system by applying mikro-cms configuration.
 *
 * @param   object    express app instance
 * @param   object    mikro cms configuration
 * @param   callback
 * @return  void
 */
async function mikroCMS(expressAPP, mikroConfig, cb = null) {
  express.setInstance(expressAPP);
  config.setConfig(mikroConfig);

  await database.connect();

  schema.loadSchema();
  model.loadModels();
  model.migrates();
  locale.loadLocale();
  middleware.loadMiddleware();
  router.loadRouting();
  service.loadServices();
  public.loadPublic();
  public.publish();
  router.routed();

  if (typeof cb === 'function') {
    cb();
  }
}

module.exports = mikroCMS;
