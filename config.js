// Contains all configuration settings for mikro-cms
const source = {};

/**
 * Applies the mikro-cms configuration settings.
 *
 * @param   object
 * @return  void
 */
function setConfig(conf) {
  for (var moduleName in conf) {
    if (source[moduleName]) {
      throw new Error(`Duplicate module name: "${moduleName}"`);
    }

    const mdul = conf[moduleName];

    source[moduleName] = {
      database: null,
      schema: null,
      model: null,
      locale: null,
      middleware: null,
      router: null,
      service: null,
      public: null
    };

    if (typeof mdul !== 'object') {
      throw new Error(`Invalid configuration for module "${moduleName}"`);
    }

    if (typeof mdul.database === 'object') {
      source[moduleName].database = mdul.database;
    }

    if (typeof mdul.schema === 'object') {
      source[moduleName].schema = mdul.schema;
    }

    if (typeof mdul.model === 'object') {
      source[moduleName].model = mdul.model;
    }

    if (typeof mdul.locale === 'object') {
      source[moduleName].locale = mdul.locale;
    }

    if (typeof mdul.middleware === 'object') {
      source[moduleName].middleware = mdul.middleware;
    }

    if (typeof mdul.router === 'object') {
      source[moduleName].router = mdul.router;
    }

    if (typeof mdul.service === 'object') {
      source[moduleName].service = mdul.service;
    }

    if (typeof mdul.public === 'object') {
      source[moduleName].public = mdul.public;
    }
  }
}

module.exports = {
  source,
  setConfig
};
