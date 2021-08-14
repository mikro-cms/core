const { exists } = require('@mikro-cms/models/component');
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

/**
 * Create api loader for client request.
 *
 * @public
 * @param     object
 * @param     object
 * @return    function
 */
function api(req, res) {
  /**
   * Create resource loader for selected api.
   *
   * @param   string
   * @return  mixed
   */
  return function apiLoader(apiName) {
    let resources;

    try {
      resources = require(`${apiName}/resource`);

      if (typeof resources !== 'object') {
        throw new Error(`could not load api without resource ${apiName}`);
      }
    } catch (err) {
      throw err;
    }

    /**
     * Execute api resource.
     *
     * @param   string
     * @return  mixed
     */
    return async function apiExecute(resourceName) {
      let resource = resources[resourceName];

      if (typeof resource.get === 'undefined') {
        throw new Error(`could not load api without get method ${apiName}`);
      } else if (typeof resource.get.handler === 'undefined') {
        throw new Error(`could not load api without handler ${apiName}`);
      } else {
        resource = resource.get.handler;
      }

      if (typeof resource === 'function') {
        return resource.call({}, req, res);
      } else if (typeof resource === 'object') {
        let lastIndex = `${resource.length - 2}`;

        for (var resourceIndex in resource) {
          if (resourceIndex === lastIndex) break;

          resource[resourceIndex].call({}, req, res, apiNext);
        }

        await resource[lastIndex].call({}, req, res, apiNext);

        return res.result;
      } else {
        return null;
      }
    }
  }
}

/**
 * Api next handler.
 *
 * @private
 * @return  void
 */
function apiNext() {
  // no action
}

module.exports = {
  apiRouter,
  pageRouter,
  setInstance,
  use,
  get,
  public,
  api
};
