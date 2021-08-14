const modelApi = require('@mikro-cms/models/api');

/**
 * Client api service to get requested api.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function serviceClientApi(req, res, next) {
  if (req.error) return next();

  let apiName = null;

  if (typeof req.params.apiName === 'string') {
    apiName = req.params.apiName + '/' + req.params.apiVersion;
  } else {
    req.status = 404;
    req.error = new Error(res.trans('exception.api_not_found'));

    return next();
  }

  modelApi.findOne({ api_name: apiName })
    .exec(function (err, api) {
      if (err) {
        req.error = err;
      } else if (api === null) {
        req.status = 404;
        req.error = new Error(res.trans('exception.api_not_found'));
      } else {
        res.locals.api = api;
      }

      next();
    });
}

module.exports = serviceClientApi;
