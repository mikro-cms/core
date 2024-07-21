const config = require('./config');

// All locales of the module
const source = {};

/**
 * Initializes locales based on the provided configuration and adds them to
 * the locale collection.
 *
 * @return  void
 */
function loadLocale() {
  for (var moduleName in config.source) {
    const configLocale = config.source[moduleName].locale;

    if (configLocale !== null) {
      for (var langCode in configLocale) {
        if (typeof source[langCode] === 'undefined') {
          source[langCode] = {};
        }

        const locale = configLocale[langCode];

        if (typeof locale !== 'object') {
          throw new Error(`Invalid locale for module "${moduleName}" and locale "${localeCode}"`);
        }

        source[langCode] = {
          ...source[langCode],
          ...locale
        };
      }
    }
  }
}

/**
 * Translation from the current active localization code.
 *
 * @param   string
 * @param   string
 * @param   object
 * @return  string
 */
function trans(langCode, localeId, bind) {
  if (typeof source[langCode] !== 'undefined' &&
    typeof source[langCode][localeId] !== 'undefined') {
    let result = source[langCode];

    for (var key in bind) {
      result = result.replaceAll(':' + key, bind[key]);
    }

    return result;
  } else {
    return 'none';
  }
}

module.exports = {
  source,
  loadLocale,
  trans
};
