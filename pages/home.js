/**
 * Home page data.
 */
const page = {
  'page_url': '/',
  'page_title': process.env.APP_NAME,
  'theme': {
    'theme_name': '@mikro-cms/theme-web-stories'
  }
};

/**
 * Page permission.
 */
const permission = {
  'role_group': '(guest)'
};

/**
 * Home page components.
 */
const variant = 'default';
const components = {
  'header': {
    'title': process.env.APP_NAME
  }
};

module.exports = {
  page,
  permission,
  variant,
  components
};
