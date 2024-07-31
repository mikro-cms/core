const config = require('./config');
const database = require('./database');
const schema = require('./schema');

// All models of the module
const source = {};

/**
 * Initializes models based on the provided configuration and adds them to
 * the model collection.
 *
 * @return  void
 */
function loadModels() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configModel = config.source[moduleName].model;

    if (configModel !== null) {
      for (var modelName in configModel) {
        const model = configModel[modelName];

        if (typeof model !== 'function') {
          throw new Error(`Invalid model for module "${moduleName}" and model "${modelName}"`);
        }

        try {
          const modelInstance = model({
            env: config.env,
            db: database.selectDatabase,
            schema: schema.selectSchema(moduleName),
            model: selectModel(moduleName)
          });

          if (typeof modelInstance !== 'object') {
            throw new Error('invalid model');
          }

          if (typeof model.migration !== 'undefined') {
            if (typeof model.migration !== 'function') {
              throw new Error('invalid migration');
            }
          }

          source[moduleName][modelName] = modelInstance;
        } catch (err) {
          throw new Error(`Failed to parsing model for module "${moduleName}" and model "${modelName}" : ${err}`);
        }
      }
    }
  }
}

/**
 * Select model from the collection.
 *
 * @param   string
 * @return  function
 */
function selectModel(srcModuleName) {
  return function (modelName, moduleName = srcModuleName) {
    if (typeof source[moduleName] === 'undefined') {
      throw new Error(`Could not find module "${moduleName}" in the model collection`);
    }

    if (typeof source[moduleName][modelName] === 'undefined') {
      throw new Error(`Could not find model "${modelName}" in the model collection`);
    }

    return source[moduleName][modelName];
  }
}

/**
 * Process migration from the model,
 * do not execute this process before all models are initialized.
 *
 * @return  void
 */
function migrates() {
  for (var moduleName in source) {
    for (var modelName in source[moduleName]) {
      if (source[moduleName][modelName].migration) {
        try {
          source[moduleName][modelName].migration();
        } catch (err) {
          throw new Error(`migration faield "${moduleName}, ${modelName}" - ${err}`);
        }
      }
    }
  }
}

module.exports = {
  source,
  loadModels,
  selectModel,
  migrates
};
