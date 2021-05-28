/**
 * Admin page data.
 */
const page = {
  'page_url': '/admin/*',
  'page_title': `${process.env.APP_NAME} Admin`,
  'theme': {
    'theme_name': '@mikro-cms/theme-mikro-panel'
  }
};

/**
 * Page permission.
 */
const permission = {
  'role_group': '(guest)'
};

/**
 * Admin page components.
 */
const variant = 'default';
const components = {
  'main': {
    // no options
  }
};

module.exports = {
  page,
  permission,
  variant,
  components
};
