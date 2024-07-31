const config = require('./config');
const model = require('./model');
const locale = require('./locale');

// All middleware of the module
const source = {};

/**
 * Initializes middlewares based on the provided configuration and adds them to
 * the middleware collection.
 *
 * @return  void
 */
function loadMiddleware() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configMiddleware = config.source[moduleName].middleware;

    if (configMiddleware !== null) {
      for (var middlewareName in configMiddleware) {
        const middleware = configMiddleware[middlewareName];

        if (typeof middleware !== 'function') {
          throw new Error(`Invalid middleware for module "${moduleName}" and middleware "${middlewareName}"`);
        }

        try {
          source[moduleName][middlewareName] = middleware({
            env: config.env,
            model: model.selectModel(moduleName),
            locale: locale.trans,
            middleware: selectMiddleware(moduleName)
          });
        } catch (err) {
          throw new Error(`Failed to parsing middleware for module "${moduleName}" and middleware "${middlewareName}" : ${err}`);
        }
      }
    }
  }
}

/**
 * Select middleware.
 *
 * @return  function
 */
function selectMiddleware(moduleName) {
  return function (middleware) {
    const result = [];

    for (var selectedMiddleware of middleware) {
      if (typeof selectedMiddleware === 'string') {
        selectedMiddleware = [selectedMiddleware];
      } else if (!Array.isArray(selectedMiddleware)) {
        throw new Error('Invalid service middleware');
      }

      const middlewareModuleName = selectedMiddleware[1] ? selectedMiddleware[0] : moduleName;
      const middlewareName = selectedMiddleware[1] || selectedMiddleware[0];

      if (typeof source[middlewareModuleName] === 'undefined') {
        throw new Error(`Could not find module "${middlewareModuleName}" in the middleware collection`);
      }

      if (typeof source[middlewareModuleName][middlewareName] === 'undefined') {
        throw new Error(`Could not find middleware "${middlewareName}" in the middleware collection`);
      }

      result.push(source[middlewareModuleName][middlewareName]);
    }

    return result;
  }
}

module.exports = {
  source,
  loadMiddleware,
  selectMiddleware
};
