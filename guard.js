const modelPermission = require('@mikro-cms/models/permission');

/**
 * Guard service to get current page permission.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function serviceGuard(req, res, next) {
  if (req.error) return next();

  let pagePermission = {
    page: res.locals.page._id
  };

  if (res.locals.session.user.role.role_group === 'guest') {
    pagePermission.role_group = res.locals.session.user.role.role_group;
  } else {
    pagePermission.role = res.locals.session.user.role.role_id;
  }

  modelPermission.findOne(pagePermission).exec(function (err, permission) {
    if (err) {
      req.error = err;
    } else if (permission === null) {
      req.error = new Error(res.trans('exception.access_denied'));
    } else {
      res.locals.permission = permission;
    }

    next();
  });
}

module.exports = serviceGuard;
