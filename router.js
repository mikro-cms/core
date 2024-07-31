const srcExpress = require('express');
const coreExpress = require('./express');
const config = require('./config');
const locale = require('./locale');
const middleware = require('./middleware');

// All router instance of the module
const source = {};

/**
 * Initializes routers based on the provided configuration and adds them to
 * the router collection.
 *
 * @return  void
 */
function loadRouting() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configRouter = config.source[moduleName].router;

    if (configRouter !== null) {
      for (var endpoint in configRouter) {
        const router = configRouter[endpoint];

        if (!Array.isArray(router)) {
          throw new Error(`Invalid router for module "${moduleName}" and router "${endpoint}"`);
        }

        const routerMiddleware = [
          locale.middleware.acceptedLanguage
        ];

        for (var selectedMiddleware of router) {
          if (typeof selectedMiddleware === 'string') {
            selectedMiddleware = [selectedMiddleware];
          } else if (!Array.isArray(selectedMiddleware)) {
            throw new Error(`Invalid router for module "${moduleName}" and router "${endpoint}"`);
          }

          const middlewareModuleName = selectedMiddleware[1] ? selectedMiddleware[0] : moduleName;
          const middlewareName = selectedMiddleware[1] || selectedMiddleware[0];

          if (typeof middleware.source[middlewareModuleName] === 'undefined') {
            throw new Error(`Could not find middleware "${middlewareModuleName}, ${middlewareName}" for module "${moduleName}" and router "${endpoint}"`);
          }

          if (typeof middleware.source[middlewareModuleName][middlewareName] === 'undefined') {
            throw new Error(`Could not find middleware "${middlewareModuleName}, ${middlewareName}" for module "${moduleName}" and router "${endpoint}"`);
          }

          routerMiddleware.push(middleware.source[middlewareModuleName][middlewareName]);
        }

        source[moduleName][endpoint] = srcExpress.Router();

        if (routerMiddleware.length > 0) {
          source[moduleName][endpoint].use(routerMiddleware);
        }
      }
    }
  }
}

/**
 * Embed all routers in the collection into Express.
 *
 * @return  void
 */
function routed() {
  for (var moduleName in source) {
    for (var endpoint in source[moduleName]) {
      coreExpress.source.instance.use(endpoint, source[moduleName][endpoint]);
    }
  }
}

module.exports = {
  source,
  loadRouting,
  routed
};
