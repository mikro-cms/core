const config = require('./config');
const model = require('./model');
const locale = require('./locale');
const router = require('./router');

// All service of the module
const source = {};

/**
 * Initializes services based on the provided configuration and adds them to
 * the service collection.
 *
 * @return  void
 */
function loadServices() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configService = config.source[moduleName].service;

    if (configService !== null) {
      if (!Array.isArray(configService)) {
        throw new Error(`Invalid service for module "${moduleName}"`);
      }

      for (var serviceIndex in configService) {
        const service = configService[serviceIndex];

        if (typeof service !== 'object') {
          throw new Error(`Invalid service for module "${moduleName}" and service index "${serviceIndex}"`);
        }

        if (typeof service.router === 'string') {
          service.router = [service.router];
        } else if (!Array.isArray(service.router)) {
          throw new Error(`Invalid service router for module "${moduleName}" and service index "${serviceIndex}"`);
        }

        const routerModulename = service.router[1] ? service.router[0] : moduleName;
        const routerEndpoint = service.router[1] || service.router[0];

        if (typeof router.source[routerModulename] === 'undefined') {
          throw new Error(`Could not find router "${routerModulename}, ${routerEndpoint}" for module "${moduleName}" and service index "${serviceIndex}"`);
        }

        if (typeof router.source[routerModulename][routerEndpoint] === 'undefined') {
          throw new Error(`Could not find router "${routerModulename}, ${routerEndpoint}" for module "${moduleName}" and service index "${serviceIndex}"`);
        }

        if (typeof service.handler !== 'object') {
          throw new Error(`Invalid service handler for module "${moduleName}" and service index "${serviceIndex}"`);
        }

        try {
          source[moduleName][serviceIndex] = {};

          for (var endpoint in service.handler) {
            const serviceHandler = service.handler[endpoint];

            if (typeof serviceHandler !== 'object') {
              throw new Error(`Invalid service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint ${endpoint}`);
            }

            if (typeof serviceHandler.method !== 'string') {
              throw new Error(`Invalid method service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint ${endpoint}`);
            }

            if (typeof serviceHandler.handler !== 'function') {
              throw new Error(`Invalid service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint ${endpoint}`);
            }

            source[moduleName][serviceIndex][endpoint] = serviceHandler.handler(
              model.selectModel(moduleName),
              locale.trans
            );

            router.source[routerModulename][routerEndpoint][serviceHandler.method](
              endpoint,
              source[moduleName][serviceIndex][endpoint]
            );
          }
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }
}

module.exports = {
  source,
  loadServices
};
