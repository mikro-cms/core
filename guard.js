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

  let apiPermission = {
    api: res.locals.api._id,
    api_method: req.method.toLowerCase()
  };

  if (typeof req.params.apiResource === 'string') {
    apiPermission.api_resource = '/' + req.params.apiResource;
  } else {
    req.status = 404;
    req.error = new Error(res.trans('exception.api_not_found'));

    return next();
  }

  if (res.locals.session.user.role.role_group === 'guest') {
    apiPermission.role_group = res.locals.session.user.role.role_group;
  } else {
    apiPermission.$or = [
      { role: res.locals.session.user.role._id },
      {
        role_group: {
          $regex: `.*${res.locals.session.user.role.role_group}.*`
        }
      }
    ];
  }

  modelApiPermission.findOne(apiPermission)
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

  let pagePermission = {
    page: res.locals.page._id
  };

  if (res.locals.session.user.role.role_group === 'guest') {
    pagePermission.role_group = res.locals.session.user.role.role_group;
  } else {
    apiPermission.$or = [
      { role: res.locals.session.user.role._id },
      {
        role_group: {
          $regex: `.*${res.locals.session.user.role.role_group}.*`
        }
      }
    ];
  }

  modelPagePermission.findOne(pagePermission)
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

module.exports = {
  api: serviceApiGuard,
  page: servicePageGuard
}
