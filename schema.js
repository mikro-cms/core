const { DataTypes } = require('sequelize');
const config = require('./config');
const database = require('./database');

// All schemas of the module
const source = {};

/**
 * Initializes schemas based on the provided configuration and adds them to
 * the schema collection.
 *
 * @return  void
 */
function loadSchema() {
  for (var moduleName in config.source) {
    source[moduleName] = {};

    const configSchema = config.source[moduleName].schema;

    if (configSchema !== null) {
      for (var schemaName in configSchema) {
        const schema = configSchema[schemaName];

        if (typeof schema !== 'object') {
          throw new Error(`Invalid schema for module "${moduleName}" and schema "${schemaName}"`);
        }

        if (typeof schema.connection === 'undefined') {
          schema.connection = 'default';
        } else if (typeof schema.connection !== 'string') {
          throw new Error(`Missing schema connection for module "${moduleName}" and schema "${schemaName}"`);
        }

        if (typeof database.source[schema.connection] === 'undefined') {
          throw new Error(`Could not find schema connection for module "${moduleName}" and schema "${schemaName}"`);
        }

        if (typeof schema.structure !== 'function') {
          throw new Error(`Invalid schema structure for module "${moduleName}" and schema "${schemaName}"`);
        }

        try {
          const schemaStructure = schema.structure(DataTypes);

          if (typeof schemaStructure !== 'object') {
            throw new Error(`Invalid schema structure for module "${moduleName}" and schema "${schemaName}"`);
          }

          if (typeof schemaStructure.attributes !== 'object') {
            throw new Error(`Invalid schema attributes for module "${moduleName}" and schema "${schemaName}"`);
          }

          if (typeof schemaStructure.options !== 'object') {
            throw new Error(`Invalid schema options for module "${moduleName}" and schema "${schemaName}"`);
          }

          source[moduleName][schemaName] = database.source[schema.connection].define(
            schemaName,
            schemaStructure.attributes,
            schemaStructure.options
          );
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }
}

/**
 * Select schema from the collection.
 *
 * @param   string
 * @return  function
 */
function selectSchema(srcModulename) {
  return function (schemaName, moduleName = srcModulename) {
    if (typeof source[moduleName] === 'undefined') {
      throw new Error(`Could not find module "${moduleName}" in the schema collection`);
    }
  
    if (typeof source[moduleName][schemaName] === 'undefined') {
      throw new Error(`Could not find schema "${schemaName}" in the schema collection`);
    }
  
    return source[moduleName][schemaName];
  }
}

module.exports = {
  source,
  loadSchema,
  selectSchema
};
