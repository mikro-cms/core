const path = require('path');

/**
 * Cache utils.
 */
const cachedUtils = {};

/**
 * Utility.
 *
 * @public
 * @param   request
 * @param   response
 * @return  object
 */
function utils(req, res) {
  if (typeof cachedUtils[res.locals.page._id] !== 'undefined') {
    return cachedUtils[res.locals.page._id];
  }

  const themeAuthor = correctedThemeAuthor(res.locals.page.theme.theme_author);
  const themeName = correctedThemeName(res.locals.page.theme.theme_name);
  const pathTheme = themePath(themeAuthor, themeName);
  const urlTheme = themePublicURL(themeAuthor, themeName);

  // a.k.a this
  const self = {
    themePath: pathTheme,
    themeView: themeViewPath(pathTheme),
    themePublic: themePublicPath(pathTheme),
    themeURL: urlTheme
  };

  /**
   * Create path view by current theme.
   *
   * @param   string
   * @return  string
   */
  self.theme = function (path) {
    return `${self.themeView}${path}`;
  }

  /**
   * Create assets url by current theme.
   *
   * @param   string
   * @return  string
   */
  self.assets = function (path) {
    return `${process.env.APP_URL}${self.themeURL}${path}`;
  }

  // make utils cache
  cachedUtils[res.locals.page._id] = self;

  return self;
}

/**
 * Corrected theme author format.
 *
 * @param   string
 * @return  string
 */
function correctedThemeAuthor(themeAuthor) {
  return themeAuthor.toLowerCase().replace(/\s/, '-');
}

/**
 * Corrected theme name format.
 *
 * @param   string
 * @return  string
 */
function correctedThemeName(themeName) {
  return themeName.toLowerCase().replace(/\s/, '-');
}

/**
 * Theme module path.
 *
 * @param   string
 * @param   string
 * @return  string
 */
function themePath(themeAuthor, themeName) {
  return path.resolve(process.cwd(), 'node_modules', '@' + themeAuthor, 'theme-' + themeName);
}

/**
 * Theme view path.
 *
 * @param   response
 * @return  string
 */
function themeViewPath(themePath) {
  return path.resolve(themePath, 'views');
}

/**
 * Theme public path.
 *
 * @param   string
 * @return  string
 */
function themePublicPath(themePath) {
  return path.resolve(themePath, 'public');
}

/**
 * Theme public url.
 *
 * @param   string
 * @param   string
 * @return  string
 */
function themePublicURL(themeAuthor, themeName) {
  return `/public/${themeAuthor}/${themeName}`;
}

module.exports = utils;
