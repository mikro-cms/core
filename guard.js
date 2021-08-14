const modelPagePermission = require('@mikro-cms/models/page-permission');
const modelApiPermission = require('@mikro-cms/models/api-permission');

/**
 * Guard service to get current api permission.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function serviceApiGuard(req, res, next) {
  if (req.error) return next();

  let keyGuard = createKeyGuard(res.locals.session.user);

  keyGuard.api = res.locals.api._id;
  keyGuard.api_method = req.method.toLowerCase();

  if (typeof req.params.apiResource === 'string') {
    keyGuard.api_resource = '/' + req.params.apiResource;
  } else {
    req.status = 404;
    req.error = new Error(res.trans('exception.api_not_found'));

    return next();
  }

  modelApiPermission.findOne(keyGuard)
    .exec(function (err, permission) {
      if (err) {
        req.error = err;
      } else if (permission === null) {
        req.status = 403;
        req.error = new Error(res.trans('exception.api_access_denied'));
      } else {
        res.locals.permission = permission;
      }

      next();
    });
}

/**
 * Guard service to get current page permission.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function servicePageGuard(req, res, next) {
  if (req.error) return next();

  let keyGuard = createKeyGuard(res.locals.session.user);

  keyGuard.page = res.locals.page._id;

  modelPagePermission.findOne(keyGuard)
    .exec(function (err, permission) {
      if (err) {
        req.error = err;
      } else if (permission === null) {
        req.status = 403;
        req.error = new Error(res.trans('exception.page_access_denied'));
      } else {
        res.locals.permission = permission;
      }

      next();
    });
}

/**
 * Create key guard query to find match permission.
 *
 * @private
 * @param   object
 * @return  object
 */
function createKeyGuard(userRole) {
  const keyGuard = {};

  if (userRole.role.role_group === 'guest') {
    keyGuard.role_group = `(${userRole.role.role_group})`;
  } else {
    keyGuard.$or = [
      { role: userRole.role._id },
      {
        role_group: {
          $regex: `(${userRole.role.role_group})|(guest)|(member)`
        }
      }
    ];
  }

  return keyGuard;
}

module.exports = {
  api: serviceApiGuard,
  page: servicePageGuard
}
