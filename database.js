const { Sequelize } = require('sequelize');
const config = require('./config');

// All database connections of the module
const source = {};

/**
 * Establishes database connections based on the provided configuration
 * and adds them to the database collection.
 *
 * @return  void
 */
async function connect() {
  for (var moduleName in config.source) {
    const configDatabase = config.source[moduleName].database;

    if (configDatabase !== null) {
      for (var connectionName in configDatabase) {
        if (typeof source[connectionName] !== 'undefined') {
          throw new Error(`Duplicate database connection for module "${moduleName}" and connection "${connectionName}"`);
        }

        const db = configDatabase[connectionName];

        if (typeof db !== 'object') {
          throw new Error(`Invalid database for module "${moduleName}" and connection "${connectionName}"`);
        }

        if (typeof db.database !== 'string') {
          throw new Error(`Invalid database name for module "${moduleName}" and connection "${connectionName}"`);
        }

        if (typeof db.username !== 'string') {
          throw new Error(`Invalid database username for module "${moduleName}" and connection "${connectionName}"`);
        }

        if (typeof db.password !== 'string') {
          throw new Error(`Invalid database password for module "${moduleName}" and connection "${connectionName}"`);
        }

        if (typeof db.sequelize !== 'object') {
          throw new Error(`Invalid database sequelize for module "${moduleName}" and connection "${connectionName}"`);
        } else if (typeof db.sequelize.host !== 'string') {
          throw new Error(`Missing database hostname for module "${moduleName}" and connection "${connectionName}"`); 
        } else if (typeof db.sequelize.port !== 'number') {
          throw new Error(`Missing database port for module "${moduleName}" and connection "${connectionName}"`); 
        } else if (typeof db.sequelize.dialect !== 'string') {
          throw new Error(`Missing sequelize dialect for module "${moduleName}" and connection "${connectionName}"`); 
        }

        try {
          source[connectionName] = new Sequelize(
            db.database,
            db.username,
            db.password,
            db.sequelize
          );

          await source[connectionName].authenticate();
        } catch (err) {
          throw new Error(err);
        }
      }
    }
  }
}

/**
 * Select database from the collection.
 *
 * @param   string
 * @return  object
 */
function selectDatabase(connectionName = 'default') {
  if (typeof source[connectionName] === 'undefined') {
    throw new Error(`Could not find connection "${connectionName}" in the database collection`);
  }

  return source[connectionName];
}

module.exports = {
  source,
  connect,
  selectDatabase
};
