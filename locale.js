const supportedLanguage = require(process.cwd() + '/locale');

/**
 * Locale request handler.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function locale(req, res, next) {
  const acceptedLanguage = getAccepetedLanguage(req.header('Accept-Language'));

  res.trans = function (key) {
    return trans(acceptedLanguage, key);
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

module.exports = locale;
