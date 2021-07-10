const fs = require('fs');
const path = require('path');
const express = require('express');
const locale = require('./locale');
const clientApi = require('./client-api');
const page = require('./page');
const auth = require('./auth');
const guard = require('./guard');
const generate = require('./generate');
const defaultThemes = require('./themes/index.js');
const defaultApis = require('./apis/index.js');
const defaultPages = require('./pages/index.js');

// load models for initial availbility
const models = require('@mikro-cms/models');

/**
 * Express app instance.
 */
let app = null;

// Express router
const apiRouter = express.Router();
const pageRouter = express.Router();

/**
 * Set current express app instance.
 *
 * @public
 * @param   object    express app instance
 * @return  void
 */
function setInstance(currentInstance) {
  app = currentInstance;
}

/**
 * Bootstraping system pages.
 *
 * @public
 * @param   object    express app instance
 * @param   callback
 * @return  void
 */
async function bootstrap(app, cb) {
  setInstance(app);

  const migrateStatus = await models.migration.migrate();

  // first time migration also initial system setup
  if (migrateStatus === null) {
    if (!await importDefaultApis()) return;
    if (!await importDefaultThemes()) return;
    if (!await createDefaultPages()) return;

    await plugin.setupComplete();
  }

  handleApi();
  handlePage();

  await plugin.loadApis();
  await plugin.loadPages();

  app.use(process.env.API_PREFIX, apiRouter);
  app.use('/', pageRouter);
  cb();
}

/**
 * Import default themes.
 *
 * @private
 * @return    boolean
 */
async function importDefaultApis() {
  for (var defaultApi of defaultApis) {
    const importDefaultApi = await plugin.importApi(defaultApi);

    if (!importDefaultApi) {
      console.log('bootstrap could not found api!');

      return false;
    }
  }

  return true;
}

/**
 * Import default themes.
 *
 * @private
 * @return    boolean
 */
async function importDefaultThemes() {
  for (var defaultTheme of defaultThemes) {
    const importDefaultTheme = await plugin.importTheme(defaultTheme);

    if (!importDefaultTheme) {
      console.log('bootstrap could not found theme!');

      return false;
    }
  }

  return true;
}

/**
 * Create default pages.
 *
 * @private
 * @return    boolean
 */
async function createDefaultPages() {
  for (var pageOptions of defaultPages) {
    const createdPage = await plugin.createPage(pageOptions);

    if (!createdPage) {
      console.log('bootstrap could not create default page!');

      return false;
    }
  }

  return true;
}

/**
 * Handle every requested api.
 *
 * @private
 * @return    void
 */
function handleApi() {
  const handler = [
    locale.handler,
    auth,
    clientApi,
    guard.api,
    generate.api
  ];

  apiRouter.all('/:apiName/:apiVersion/:apiResource', handler);
}

/**
 * Handle every requested page.
 *
 * @private
 * @return    void
 */
function handlePage() {
  const handler = [
    locale.handler,
    auth,
    page,
    guard.page,
    generate.page
  ];

  pageRouter.all('/:pageName?/*', handler);
}

/**
 * Plugin is api to focus handle theme and page.
 */
const plugin = {};

/**
 * Import installed api into database.
 *
 * @public
 * @param   string
 * @return  boolean
 */
plugin.importApi = async function (apiName) {
  const apiInfo = plugin.apiInfo(apiName);

  if (!apiInfo) {
    return false;
  }

  const apiOptions = require(apiInfo.api_options);

  if (typeof apiOptions.migration === 'function') {
    await apiOptions.migration();
  }

  const newApi = new models.api(apiInfo);

  await newApi.save();

  const resources = plugin.resourceInfo(newApi);

  if (!resources) {
    return false;
  }

  resources.forEach(plugin.createApiPermission);

  return true;
};

/**
 * Create api information from package
 * and check api compilibity.
 *
 * @public
 * @param   string
 * @return  mixed
 */
plugin.apiInfo = function (apiName) {
  const apiPathRoot = path.resolve('node_modules', apiName);
  const apiPathPackage = path.resolve(apiPathRoot, 'package.json');
  const apiPathOptions = path.resolve(apiPathRoot, 'index.js');
  let apiPathLocale = path.resolve(apiPathRoot, 'locale/index.js');
  const apiPathResource = path.resolve(apiPathRoot, 'resource/index.js');

  if (!plugin.isFile(apiPathPackage)) return false;
  if (!plugin.isFile(apiPathOptions)) return false;
  if (!plugin.isFile(apiPathLocale, false)) apiPathLocale = null;
  if (!plugin.isFile(apiPathResource)) return false;

  const apiPackage = require(apiPathPackage);

  const apiInfo = {
    'api_name': apiName,
    'api_version': apiPackage.version,
    'api_author': apiPackage.author.name,
    'api_url': apiPackage.homepage,
    'api_path': apiPathRoot,
    'api_info': apiPathPackage,
    'api_options': apiPathOptions,
    'api_locale': apiPathLocale,
    'api_resource': apiPathResource
  };

  return apiInfo;
};

/**
 * Create resource information
 * and check resource compilibity.
 *
 * @public
 * @param   object
 * @return  mixed
 */
plugin.resourceInfo = function (apiInfo) {
  const resources = require(apiInfo.api_resource);

  if (resources.constructor.toString().indexOf("Object") < 0) return false;

  const resourceInfo = [];

  for (var resourceIndex in resources) {
    const resource = resources[resourceIndex];

    if (resource.constructor.toString().indexOf("Object") > -1) {
      for (var resourceMethod in resource) {
        resourceInfo.push({
          'api': apiInfo._id,
          'role': resource[resourceMethod].permission.role,
          'role_group': resource[resourceMethod].permission.role_group,
          'api_resource': resourceIndex,
          'api_method': resourceMethod
        });
      }
    }
  }

  return resourceInfo;
};

/**
 * Import installed theme into database.
 *
 * @public
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
 * @public
 * @param   string
 * @return  mixed
 */
plugin.themeInfo = function (themeName) {
  const themePathRoot = path.resolve('node_modules', themeName);
  const themePathPackage = path.resolve(themePathRoot, 'package.json');
  const themePathOptions = path.resolve(themePathRoot, 'index.js');
  let themePathLocale = path.resolve(themePathRoot, 'locale/index.js');
  const themePathView = path.resolve(themePathRoot, 'views');
  const themePathPublic = path.resolve(themePathRoot, 'public');
  let themePathCustomize = path.resolve(themePathRoot, 'views/customize.ejs');

  if (!plugin.isFile(themePathPackage)) return false;
  if (!plugin.isFile(themePathOptions)) return false;
  if (!plugin.isFile(themePathLocale, false)) themePathLocale = null;
  if (!plugin.isDirectory(themePathView)) return false;
  if (!plugin.isDirectory(themePathPublic)) return false;
  if (!plugin.isFile(themePathCustomize, false)) themePathCustomize = null;

  const themePackage = require(themePathPackage);
  const themeOptions = require(themePathOptions);
  const themeComponents = [];

  for (var variant in themeOptions) {
    for (var componentIndex in themeOptions[variant]) {
      const themePathVariant = path.resolve(themePathRoot, `views/${variant}.ejs`);

      if (typeof themeOptions[variant][componentIndex].component_name === 'undefined') return false;
      if (typeof themeOptions[variant][componentIndex].component_options === 'undefined') return false;
      if (!plugin.isFile(themePathVariant)) return false;
    }

    themeComponents.push(variant);
  }

  // no component exists
  if (themeComponents.length < 1) return false;

  const themeInfo = {
    'theme_name': themePackage.name,
    'theme_version': themePackage.version,
    'theme_author': themePackage.author.name,
    'theme_url': themePackage.homepage,
    'theme_path': themePathRoot,
    'theme_info': themePathPackage,
    'theme_options': themePathOptions,
    'theme_locale': themePathLocale,
    'theme_view': themePathView,
    'theme_customize': themePathCustomize,
    'theme_public_path': themePathPublic,
    'theme_public_url': `/${process.env.PUBLIC_DIR}/${themePackage.name}`,
    'theme_components': themeComponents
  };

  return themeInfo;
};

/**
 * Is resouce file exists.
 *
 * @public
 * @param   string
 * @param   boolean
 * @return  boolean
 */
plugin.isFile = function (pathFile, showError = true) {
  try {
    const stat = fs.statSync(pathFile);

    if (!stat.isFile()) throw new Error(pathFile + ' is not file')
  } catch (err) {
    if (showError) console.error(err);

    return false;
  }

  return true;
};

/**
 * Is resouce directory exists.
 *
 * @public
 * @param   string
 * @param   boolean
 * @return  boolean
 */
plugin.isDirectory = function (pathDir, showError = true) {
  try {
    const stat = fs.statSync(pathDir);

    if (!stat.isDirectory()) throw new Error(pathDir + ' is not directory')
  } catch (err) {
    if (showError) console.error(err);

    return false;
  }

  return true;
};

/**
 * Create a new page.
 *
 * @public
 * @param   object
 * @return  mixed
 */
plugin.createPage = async function (pageOptions) {
  const themeOptions = {};

  if (pageOptions.page.theme.theme_id) {
    themeOptions._id = pageOptions.page.theme.theme_id;
  } else {
    themeOptions.theme_name = pageOptions.page.theme.theme_name;
  }

  const selectedTheme = await models.theme.findOne(themeOptions);

  if (selectedTheme === null) return false;

  const newPageOptions = {
    'page_url': pageOptions.page.page_url,
    'page_title': pageOptions.page.page_title,
    'theme': selectedTheme._id,
    'variant': pageOptions.variant
  };

  const newPage = new models.page(newPageOptions);

  await newPage.save();

  pageOptions.page = newPage;

  await plugin.createComponents(selectedTheme, pageOptions);
  await plugin.createPagePermission(pageOptions);

  return pageOptions;
};

/**
 * Edit selected page.
 *
 * @public
 * @param   object
 * @return  mixed
 */
plugin.editPage = async function (pageOptions) {
  const selectedPage = await models.page.findOne({
    _id: pageOptions.page.page_id
  });

  if (selectedPage === null) return false;

  if (pageOptions.page.theme.theme_id || pageOptions.page.theme.theme_name) {
    const themeOptions = {};

    if (pageOptions.page.theme.theme_id) {
      themeOptions._id = pageOptions.page.theme.theme_id;
    } else {
      themeOptions.theme_name = pageOptions.page.theme.theme_name;
    }

    const selectedTheme = await models.theme.findOne(themeOptions);

    if (selectedTheme === null) return false;

    selectedPage.theme = selectedTheme._id;
  }

  if (pageOptions.page.page_url) {
    selectedPage.page_url = pageOptions.page.page_url;
  }

  if (pageOptions.page.page_title) {
    selectedPage.page_title = pageOptions.page.page_title;
  }

  if (pageOptions.variant) {
    selectedPage.variant = pageOptions.variant;
  }

  await selectedPage.save();

  pageOptions.page = selectedPage;

  await plugin.editPagePermission(pageOptions);

  return pageOptions;
};

/**
 * Create component for page related to theme.
 *
 * @public
 * @param   object
 * @param   object
 * @return  void
 */
plugin.createComponents = async function (theme, pageOptions) {
  if (!plugin.isFile(theme.theme_options)) return false;

  const themeOptions = require(theme.theme_options);

  if (typeof themeOptions[pageOptions.variant] === 'undefined') return false;

  const components = themeOptions[pageOptions.variant];

  for (var componentIndex in components) {
    let themeComponent = {};

    if (typeof pageOptions.components[componentIndex] !== 'undefined') {
      themeComponent = {
        ...components[componentIndex],
        ...pageOptions.components[componentIndex]
      };
    } else {
      themeComponent = {
        ...components[componentIndex]
      };
    }

    themeComponent.page = pageOptions.page._id;

    const newComponent = new models.component(themeComponent);

    await newComponent.save();
  }
};

/**
 * Create api permission.
 *
 * @public
 * @param   object
 * @return  boolean
 */
plugin.createApiPermission = async function (apiOptions) {
  const newPermission = new models.apiPermission(apiOptions);

  await newPermission.save();

  return true;
};

/**
 * Create page permission.
 *
 * @public
 * @param   object
 * @return  boolean
 */
plugin.createPagePermission = async function (pageOptions) {
  const pagePermission = {
    ...pageOptions.permission,
    page: pageOptions.page._id
  };
  const newPermission = new models.pagePermission(pagePermission);

  await newPermission.save();

  return true;
};

/**
 * Edit selected page permission.
 *
 * @param   object
 * @return  boolean
 */
plugin.editPagePermission = async function (pageOptions) {
  const selectedPermission = await models.pagePermission.findOne({
    page: pageOptions.page._id
  });

  if (pageOptions.permission.role || pageOptions.permission.role === null) {
    selectedPermission.role = pageOptions.permission.role;
  }

  if (pageOptions.permission.role_group) {
    selectedPermission.role_group = pageOptions.permission.role_group;
  }

  await selectedPermission.save();

  return true;
}

/**
 * Load all available apis.
 *
 * @public
 * @return    void
 */
plugin.loadApis = async function () {
  const apis = await models.api.find();

  if (apis === null) {
    console.log('bootstrap successful without apis!');

    return;
  }

  apis.forEach(plugin.benchmarkApi);
};

/**
 * Benchmarking apis for setup and make fast process next requested.
 *
 * @public
 * @param   object
 * @return  void
 */
plugin.benchmarkApi = function (api) {
  if (api.api_locale !== null) {
    locale.addLocale(api.api_locale);
  }

  const resources = require(api.api_resource);

  for (var resourceIndex in resources) {
    const resourcePath = '/' + api.api_name + resourceIndex;
    const resource = resources[resourceIndex];

    for (var resourceMethod in resource) {
      apiRouter[resourceMethod](resourcePath, resource[resourceMethod].handler);
    }
  }
};

/**
 * Load all available pages.
 *
 * @public
 * @return    void
 */
plugin.loadPages = async function () {
  const pages = await models.page.find().populate('theme')

  if (pages === null) {
    console.log('bootstrap successful without pages!');

    return;
  }

  pages.forEach(plugin.benchmarkPage);
};

/**
 * Benchmarking pages for setup and make fast process next requested.
 *
 * @public
 * @param   object
 * @return  void
 */
plugin.benchmarkPage = function (page) {
  if (page.theme.theme_locale !== null) {
    locale.addLocale(page.theme.theme_locale);
  }

  plugin.registerPublic(page.theme.theme_public_url, page.theme.theme_public_path);
};

/**
 * Register public resource.
 *
 * @public
 * @param   string
 * @param   string
 * @return  void
 */
plugin.registerPublic = function (pathURL, pathDir) {
  app.use(pathURL, express.static(pathDir));
};

/**
 * Create a new label.
 *
 * @public
 * @param   object
 * @return  mixed
 */
plugin.createLabel = async function (labelOptions) {
  const label = await models.label.findOne({ label_name: labelOptions.label_name });

  if (label) return false;

  const newLabel = new models.label({
    'created_by': labelOptions.created_by,
    'label_name': labelOptions.label_name
  });

  await newLabel.save();

  return newLabel;
};

/**
 * Create a new post.
 *
 * @public
 * @param   object
 * @return  mixed
 */
plugin.createPost = async function (postOptions) {
  const newPost = new models.post({
    'created_by': postOptions.created_by,
    'post_title': postOptions.post_title,
    'post_content': postOptions.post_content,
    'post_status': postOptions.post_status,
    'post_options': postOptions.post_options
  });

  await newPost.save();

  const newPostLabel = new models.postLabel({
    'post': newPost._id,
    'label': postOptions.label
  });

  await newPostLabel.save();

  return {
    post: newPost,
    post_label: newPostLabel
  };
};

/**
 * Complete setup system.
 *
 * @public
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
