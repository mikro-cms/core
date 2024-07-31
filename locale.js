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
 * Locale middleware.
 *
 * @localization    handles localization based on the header.
 */
const middleware = {
  acceptedLanguage: function (req, res, next) {
    const acceptedLanguage = getAccepetedLanguage(
      req.header('Accept-Language') || 'en-US,en;'
    );

    req.trans = function (localeId, bind) {
      return transAcceptedLanguage(acceptedLanguage, localeId, bind);
    };

    req.transvalidator = function (messages) {
      for (var message of messages) {
        message.msg = transAcceptedLanguage(acceptedLanguage, message.msg);
      }
  
      return messages;
    }

    next();
  }
}

/**
 * Retrieves the list of accepted languages specified in the request headers.
 *
 * @param   string
 * @return  object
 */
function getAccepetedLanguage(acceptLanguage) {
  const acceptLanguages = acceptLanguage.matchAll(/([^-;]*)(?:-([^;]*))?(?:;q=([0-9]\.[0-9]))?/g);
  const acceptedLanguage = [];

  // place the most recently matched language and region in the first column
  for (var matchedLanguage of acceptLanguages) {
    if (matchedLanguage[1]) {
      acceptedLanguage.unshift({
        code: matchedLanguage[1].replace(',', ''),
        regions: matchedLanguage[2] ? matchedLanguage[2].split(',') : [],
        quality: matchedLanguage[3] || null
      });
    }
  }

  return acceptedLanguage;
}

/**
 * Translation based on the localization code.
 *
 * @param   string
 * @param   string
 * @param   object
 * @return  string
 */
function trans(langCode, localeId, bind) {
  if (typeof source[langCode] !== 'undefined' &&
    typeof source[langCode][localeId] !== 'undefined') {
    let result = source[langCode][localeId];

    if (typeof bind === 'object') {
      for (var key in bind) {
        result = result.replaceAll(':' + key, bind[key]);
      }
    }

    return result;
  } else {
    return null;
  }
}

/**
 * Translation from the accepted language.
 *
 * @param   object
 * @param   string
 * @param   object
 * @return  string
 */
function transAcceptedLanguage(acceptedLanguage, localeId, bind) {
  let result = null;

  for (var language of acceptedLanguage) {
    if (language.regions.length > 0) {
      for (var languageRegion of language.regions) {
        let langCode = language.code + '-' + languageRegion;

        result = trans(langCode, localeId, bind);

        if (result) {
          return result;
        }
      }
    }

    result = trans(language.code, localeId, bind);

    if (result) {
      return result;
    }
  }

  return result;
}

module.exports = {
  source,
  loadLocale,
  middleware,
  trans
};
