const supportedLanguage = require(process.cwd() + '/locale');

/**
 * Add supported locale.
 *
 * @public
 * @param   string
 * @return  void
 */
function addLocale(pathLocale) {
  const language = require(pathLocale);

  for (var languageCode in language) {
    if (typeof supportedLanguage[languageCode] === 'undefined') {
      supportedLanguage[languageCode] = {};
    }

    for (var languageId in language[languageCode]) {
      if (typeof supportedLanguage[languageCode][languageId] === 'undefined') {
        supportedLanguage[languageCode][languageId] = language[languageCode][languageId];
      } else {
        supportedLanguage[languageCode][languageId] = {
          ...supportedLanguage[languageCode][languageId],
          ...language[languageCode][languageId]
        };
      }
    }
  }
}

/**
 * Locale request handler.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function handler(req, res, next) {
  const acceptedLanguage = getAccepetedLanguage(req.header('Accept-Language') || 'en-US,en;');

  res.trans = function (key) {
    return trans(acceptedLanguage, key);
  }

  res.transValidator = function (result) {
    for (var error of result) {
      error.msg = trans(acceptedLanguage, error.msg);
    }

    return result;
  }

  next();
}

/**
 * Collect accept languages from request.
 *
 * @private
 * @param   string
 * @return  void
 */
function getAccepetedLanguage(acceptLanguage) {
  const acceptLanguages = acceptLanguage.matchAll(/([^-;]*)(?:-([^;]*))?(?:;q=([0-9]\.[0-9]))?/g);
  const requestedLanguages = [];

  // place last matched language and region at first column
  for (var matchedLanguage of acceptLanguages) {
    if (matchedLanguage[1]) {
      requestedLanguages.unshift({
        code: matchedLanguage[1].replace(',', ''),
        regions: matchedLanguage[2] ? matchedLanguage[2].split(',') :  [],
        quality: matchedLanguage[3] || null
      });
    }
  }

  return requestedLanguages;
}

/**
 * Translate key from supported language.
 *
 * @private
 * @param   object
 * @param   string
 * @return  string
 */
function trans(acceptedLanguage, key) {
  const keys = key.split('.')
  const localeId = keys[0];
  const localeKey = keys[1];

  // search supported language
  for (var language of acceptedLanguage) {
    if (language.regions.length > 0) {
      for (var languageRegion of language.regions) {
        let languageCode = language.code + '-' + languageRegion

        if (typeof supportedLanguage[languageCode] !== 'undefined'
            && typeof supportedLanguage[languageCode][localeId] !== 'undefined'
            && typeof typeof supportedLanguage[languageCode][localeId][localeKey] !== 'undefined') {
              return supportedLanguage[languageCode][localeId][localeKey];
        }
      }
    } else {
      if (typeof supportedLanguage[language.code] !== 'undefined'
          && typeof supportedLanguage[language.code][localeId] !== 'undefined'
          && typeof typeof supportedLanguage[language.code][localeId][localeKey] !== 'undefined') {
            return supportedLanguage[language.code][localeId][localeKey];
      }
    }
  }

  // use default language
  if (typeof supportedLanguage['en-en'] !== 'undefined'
      && typeof supportedLanguage['en-en'][localeId] !== 'undefined'
      && typeof typeof supportedLanguage['en-en'][localeId][localeKey] !== 'undefined') {
        return supportedLanguage['en-en'][localeId][localeKey];
  } else {
    return 'undefined';
  }
}

module.exports = {
  addLocale,
  handler
};
