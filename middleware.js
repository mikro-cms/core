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
          source[moduleName][middlewareName] = middleware(
            model.selectModel(moduleName),
            locale.trans
          );
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }
}

module.exports = {
  source,
  loadMiddleware
};
