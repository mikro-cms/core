const fs = require('fs');
const path = require('path');
const express = require('express');
const locale = require('./locale');
const page = require('./page');
const auth = require('./auth');
const guard = require('./guard');
const generate = require('./generate');
const pageHome = require('./home');

// load models for initial availbility
const models = require('@mikro-cms/models');

/**
 * Express app instance.
 */
let app = null;

/**
 * Set current express app instance.
 *
 * @param   object    express app instance
 * @return  void
 */
function setInstance(currentInstance) {
  app = currentInstance;
}

/**
 * Bootstraping system pages.
 *
 * @param   object    express app instance
 * @param   callback
 * @return  void
 */
async function bootstrap(app, cb) {
  setInstance(app);

  const migrateStatus = await models.migration.migrate();

  // first time migration also initial system setup
  if (migrateStatus === null) {
    const importDefaultTheme = await plugin.importTheme('@mikro-cms/theme-web-stories');

    if (!importDefaultTheme) {
      console.log('bootstrap could not found theme!');

      return;
    }

    const createHomePage = await plugin.createPage(pageHome);

    if (!createHomePage) {
      console.log('bootstrap could not create home page!');

      return;
    }

    await plugin.loadPages();
    await plugin.setupComplete();

    handlePage();
    cb();
  } else {
    await plugin.loadPages();

    handlePage();
    cb();
  }
}

/**
 * Handle every requested page.
 *
 * @param   string
 * @return  void
 */
function handlePage() {
  const handler = [
    locale,
    auth,
    page,
    guard,
    generate
  ];

  app.use(handler);
}

/**
 * Plugin is api to focus handle theme and page.
 */
const plugin = {};

/**
 * Import installed theme into database.
 *
 * @param   string
 * @return  boolean
 */
plugin.importTheme = async function (themeName) {
  const themeInfo = plugin.themeInfo(themeName);

  if (!themeInfo) {
    return false;
  }

  const newTheme = new models.theme(themeInfo);

  await newTheme.save();

  return true;
};

/**
 * Create theme information from package
 * and check theme compilibity.
 *
 * @param   string
 * @return  mixed
 */
plugin.themeInfo = function (themeName) {
  const themePathRoot = path.resolve('node_modules', themeName);
  const themePathPackage = path.resolve(themePathRoot, 'package.json');
  const themePathOptions = path.resolve(themePathRoot, 'index.js');
  const themePathView = path.resolve(themePathRoot, 'views/index.ejs');
  const themePathPublic = path.resolve(themePathRoot, 'public');

  if (!plugin.isFile(themePathPackage)) return false;
  if (!plugin.isDirectory(themePathPublic)) return false;
  if (!plugin.isFile(themePathOptions)) return false;
  if (!plugin.isFile(themePathView)) return false;

  const themePackage = require(themePathPackage);

  const themeInfo = {
    'theme_path': themePathRoot,
    'theme_info': themePathPackage,
    'theme_path_options': themePathOptions,
    'theme_view': themePathView,
    'theme_public': themePathPublic,
    'theme_public_url': `/${process.env.PUBLIC_DIR}/${themePackage.name}`,
    'theme_name': themePackage.name,
    'theme_version': themePackage.version,
    'theme_url': themePackage.homepage,
    'theme_author': themePackage.author
  };

  return themeInfo;
};

/**
 * Is resouce file exists.
 *
 * @param   string
 * @return  boolean
 */
plugin.isFile = function (pathFile) {
  try {
    const stat = fs.statSync(pathFile);

    if (!stat.isFile()) throw new Error(pathFile + ' is not file')
  } catch (err) {
    console.error(err);

    return false;
  }

  return true;
};

/**
 * Is resouce directory exists.
 *
 * @param   string
 * @return  boolean
 */
plugin.isDirectory = function (pathDir) {
  try {
    const stat = fs.statSync(pathDir);

    if (!stat.isDirectory()) throw new Error(pathDir + ' is not directory')
  } catch (err) {
    console.error(err);

    return false;
  }

  return true;
};

/**
 * Create a new page.
 *
 * @param   string
 * @return  boolean
 */
plugin.createPage = async function (pageOptions) {
  const selectedTheme = await models.theme.findOne(pageOptions.theme);

  if (selectedTheme === null) {
    return false;
  }

  const newPageOptions = {
    'page_url': pageOptions.page.page_url,
    'page_title': pageOptions.page.page_title,
    'theme': selectedTheme._id
  };

  const newPage = models.page(newPageOptions);

  await newPage.save();

  pageOptions.page_id = newPage._id;
  pageOptions.theme_id = selectedTheme._id;

  await plugin.createComponents(selectedTheme, pageOptions);
  await plugin.createPermission(pageOptions);

  return true;
};

/**
 * Create component for page related to theme.
 *
 * @param   object
 * @param   object
 * @return  void
 */
plugin.createComponents = async function (theme, pageOptions) {
  if (!plugin.isFile(theme.theme_path_options)) return false;

  let themeOptions = require(theme.theme_path_options);

  themeOptions = {
    components: {},
    ...themeOptions
  }

  for (var componentIndex in themeOptions.components) {
    let themeComponent = {
      component_options: {},
      ...themeOptions.components[componentIndex],
      page: pageOptions.page_id
    };

    // override component options
    themeComponent.component_options = { ...themeComponent.component_options, ...pageOptions.components[componentIndex] };

    const newComponent = new models.component(themeComponent);

    await newComponent.save();
  }
};

/**
 * Create page permission.
 *
 * @param   object
 * @return  boolean
 */
plugin.createPermission = async function (pageOptions) {
  const pagePermission = {
    ...pageOptions.permission,
    page: pageOptions.page_id
  };
  const newPermission = new models.permission(pagePermission);

  await newPermission.save();

  return true;
};

/**
 * Load all available pages.
 *
 * @return    void
 */
plugin.loadPages = async function () {
  const pages = await models.page.find()
    .populate('theme')
    .exec();

  if (pages === null) {
    console.log('bootstrap successful without pages!');

    return;
  }

  pages.forEach(plugin.benchmarkPage);
};

/**
 * Benchmarking pages for setup and make fast process next requested.
 *
 * @param   object
 * @return  object
 */
plugin.benchmarkPage = function (page) {
  const locals = {
    page: page
  };

  plugin.registerPublic(page.theme.theme_public_url, page.theme.theme_public);

  return plugin;
};

/**
 * Register public resource.
 *
 * @param   string
 * @param   string
 * @return  void
 */
plugin.registerPublic = function (pathURL, pathDir) {
  app.use(pathURL, express.static(pathDir));
};

/**
 * Complete setup system.
 *
 * @return  void
 */
plugin.setupComplete = async function () {
  const migrateStatus = new models.migration.modelMigration({
    'migrate_status': true
  });

  await migrateStatus.save();
};

module.exports = {
  bootstrap,
  plugin
};
