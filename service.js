const config = require('./config');
const model = require('./model');
const locale = require('./locale');
const middleware = require('./middleware');
const router = require('./router');

// All service of the module
const source = {};

// List of allowed HTTP service methods
const methods = ['all', 'get', 'post', 'put', 'delete'];

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
            source[moduleName][serviceIndex][endpoint] = {};

            for (var method in service.handler[endpoint]) {
              if (methods.indexOf(method) < 0) {
                throw new Error(`Invalid method service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint "${endpoint}:${method}"`);
              }

              if (typeof service.handler[endpoint][method] !== 'function') {
                throw new Error(`Invalid service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint "${endpoint}:${method}"`);
              }

              try {
                source[moduleName][serviceIndex][endpoint][method] = service.handler[endpoint][method]({
                  env: config.env,
                  model: model.selectModel(moduleName),
                  locale: locale.trans,
                  middleware: middleware.selectMiddleware(moduleName)
                });

                router.source[routerModulename][routerEndpoint][method](
                  endpoint,
                  source[moduleName][serviceIndex][endpoint][method]
                );
              } catch (err) {
                throw new Error(`Failed to parsing service handler for module "${moduleName}" and service index "${serviceIndex}" and endpoint "${endpoint}:${method}" : ${err}`);
              }
            }
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
