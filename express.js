const express = require('express');

/**
 * Express app instance.
 */
let app = null;

// Express router
const apiRouter = express.Router();
const pageRouter = express.Router();

/**
 * Set current express app instance.
 *
 * @public
 * @param   object    express app instance
 * @return  void
 */
function setInstance(currentInstance) {
  app = currentInstance;
}

/**
 * Express use.
 *
 * @public
 * @param   string
 * @param   function
 * @return  void
 */
function use(path, handler) {
  app.use(path, handler);
}

/**
 * Express get.
 *
 * @public
 * @param   string
 * @return  mixed
 */
function get(path) {
  return app.get(path);
}

/**
 * Register public resource.
 *
 * @public
 * @param   string
 * @param   string
 * @return  void
 */
function public(pathURL, pathDir) {
  app.use(pathURL, express.static(pathDir));
}

module.exports = {
  apiRouter,
  pageRouter,
  setInstance,
  use,
  get,
  public
};
