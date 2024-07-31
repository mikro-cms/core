const coreExpress = require('./express');
const config = require('./config');

// List the full paths of the view directories
const source = [];

/**
 * Initializes view based on the provided configuration and adds them to
 * the service collection.
 *
 * @return  void
 */
function loadView() {
  for (var moduleName in config.source) {
    const configView = config.source[moduleName].view;

    if (configView !== null) {
      if (!Array.isArray(configView)) {
        throw new Error(`Invalid view for module "${moduleName}"`);
      }

      for (var viewIndex in configView) {
        const path = configView[viewIndex];

        if (typeof path !== 'string') {
          throw new Error(`Invalid view for module "${moduleName}" and index "${viewIndex}"`);
        }

        source.push(path);
      }
    }
  }
}

/**
 * Embed all view in the collection into Express.
 *
 * @return  void
 */
function publish() {
  coreExpress.source.instance.set('views', source);
}

module.exports = {
  source,
  loadView,
  publish
};
