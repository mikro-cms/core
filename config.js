// Contains all environment variables
const env = {};

// Contains all configuration settings for mikro-cms
const source = {};

/**
 * Applies the mikro-cms configuration settings.
 *
 * @param   object
 * @return  void
 */
function setConfig(conf) {
  if (typeof conf !== 'object') {
    throw new Error('Invalid mikrocms config');
  }

  if (typeof conf.env === 'object') {
    for (var name in conf.env) {
      env[name] = conf.env[name];
    }
  }

  if (typeof conf.modules !== 'object') {
    throw new Error('Invalid module config');
  }

  for (var moduleName in conf.modules) {
    if (source[moduleName]) {
      throw new Error(`Duplicate module name: "${moduleName}"`);
    }

    const mdul = conf.modules[moduleName];

    source[moduleName] = {
      database: null,
      schema: null,
      model: null,
      locale: null,
      view: null,
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

    if (typeof mdul.view === 'object') {
      source[moduleName].view = mdul.view;
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
  env,
  source,
  setConfig
};
