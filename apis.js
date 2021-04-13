const express = require('express');
const models = require('@mikro-cms/models');
const utils = require('./utils');
const locale = require('./locale');
const page = require('./page');
const auth = require('./auth');
const guard = require('./guard');
const generate = require('./generate');

/**
 * Express app instance.
 */
let app = null;

/**
 * Set current express app instance.
 *
 * @param   object    express app instance
 * @return  void
 */
function setInstance(currentInstance) {
  app = currentInstance;
}

/**
 * Register public resource.
 *
 * @param   string
 * @param   string
 * @return  void
 */
function registerPublic(pathURL, pathDir) {
  app.use(pathURL, express.static(pathDir));
}

/**
 * Bootstraping system pages.
 *
 * @param   object    express app instance
 * @param   callback
 * @return  void
 */
function bootstrap(app, cb) {
  setInstance(app);

  models.page.find()
    .populate('theme')
    .exec(function (err, pages) {
      if (err) {
        console.error(err);
      } else if (pages !== null) {
        pages.forEach(benchmarkPage);

        // all pages benchmarked
        // lets handle request page
        handlePage();
        cb();
      } else {
        console.log('bootstrap successful without pages!');
      }
    });
}

/**
 * Benchmarking pages for setup and make fast process next requested.
 *
 * @param   object
 * @return  void
 */
function benchmarkPage(page) {
  const req = {};
  const res = {
    locals: {
      page: page
    }
  };
  const pageUtils = utils(req, res);

  registerPublic(pageUtils.themeURL, pageUtils.themePublic);
}

/**
 * Handle every requested page.
 *
 * @param   string
 * @return  void
 */
function handlePage() {
  const handler = [
    locale,
    auth,
    page,
    guard,
    generate
  ];

  app.use(handler);
}

module.exports = {
  bootstrap,
  registerPublic
};
