/**
 * Cache utils.
 */
const cachedUtils = {};

/**
 * Utility.
 *
 * @public
 * @param   object
 * @return  object
 */
function utils(locals) {
  if (typeof cachedUtils[locals.page._id] !== 'undefined') {
    return cachedUtils[locals.page._id];
  }

  // a.k.a this
  const self = {};

  /**
   * Create path view by current theme.
   *
   * @param   string
   * @return  string
   */
  self.theme = function (path) {
    return `${locals.page.theme.theme_path}${path}`;
  }

  /**
   * Create assets url by current theme.
   *
   * @param   string
   * @return  string
   */
  self.assets = function (path) {
    return `${process.env.APP_URL}${locals.page.theme.theme_public_url}${path}`;
  }

  // make utils cache
  cachedUtils[locals.page._id] = self;

  return self;
}

module.exports = utils;
