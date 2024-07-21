const path = require('path');
const srcExpress = require('express');
const coreExpress = require('./express');
const config = require('./config');
const middleware = require('./middleware');

// All public of the module
const source = {};

/**
 * Initializes publics based on the provided configuration and adds them to
 * the public collection.
 *
 * @return  void
 */
function loadPublic() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configPublic = config.source[moduleName].public;

    if (configPublic !== null) {
      for (var endpoint in configPublic) {
        const public = configPublic[endpoint];
        const publicMiddleware = [];

        if (typeof public !== 'object') {
          throw new Error(`Invalid public for module "${moduleName}" and public "${endpoint}"`);
        }

        if (typeof public.path !== 'string') {
          throw new Error(`Invalid public for module "${moduleName}" and public "${endpoint}"`);
        }

        if (Array.isArray(public.middleware)) {
          for (var selectedMiddleware of public.middleware) {
            if (typeof selectedMiddleware === 'string') {
              selectedMiddleware = [selectedMiddleware];
            } else if (!Array.isArray(selectedMiddleware)) {
              throw new Error(`Invalid public middleware for module "${moduleName}" and public "${endpoint}"`);
            }

            const middlewareModuleName = selectedMiddleware[1] ? selectedMiddleware[0] : moduleName;
            const middlewareName = selectedMiddleware[1] || selectedMiddleware[0];

            if (typeof middleware.source[middlewareModuleName] === 'undefined') {
              throw new Error(`Could not find middleware "${middlewareModuleName}, ${middlewareName}" for module "${moduleName}" and public "${endpoint}"`);
            }

            if (typeof middleware.source[middlewareModuleName][middlewareName] === 'undefined') {
              throw new Error(`Could not find middleware "${middlewareModuleName}, ${middlewareName}" for module "${moduleName}" and public "${endpoint}"`);
            }

            publicMiddleware.push(middleware.source[middlewareModuleName][middlewareName]);
          }
        }

        publicMiddleware.push(
          srcExpress.static(public.path)
        );

        source[moduleName][endpoint] = publicMiddleware;
      }
    }
  }
}

/**
 * Embed all public in the collection into Express.
 *
 * @return  void
 */
function publish() {
  for (var moduleName in source) {
    for (var endpoint in source[moduleName]) {
      coreExpress.source.instance.use(endpoint, source[moduleName][endpoint]);
    }
  }
}

module.exports = {
  source,
  loadPublic,
  publish
};
