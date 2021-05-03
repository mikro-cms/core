const modelSession = require('@mikro-cms/models/session');

/**
 * Authorization service to filter request.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function serviceAuth(req, res, next) {
  if (req.error) return next();

  // initialization global variables
  res.locals = {};

  let token = null;

  if (req.cookies['token']) {
    token = req.cookies['token'];
  } else if (req.get('Authorization')) {
    token = req.get('Authorization');
  } else {
    // set as guest user
    res.locals.session = guestUser();

    return next();
  }

  modelSession.findOne({ token })
    .populate('user')
    .populate({ path: 'user', populate: { path: 'role' } })
    .exec(function (err, session) {
      if (err) {
        req.error = err;
      } else if (session === null) {
        // session not found
        // set as guest user
        res.locals.session = guestUser();
      } else {
        res.locals.session = session;
      }

      next();
    });
}

/**
 * Identification user as guest.
 *
 * @private
 * @return    object
 */
function guestUser() {
  return {
    user: {
      user_username: 'guest',
      role: {
        role_name: 'guest',
        role_group: 'guest'
      }
    }
  };
}

module.exports = serviceAuth;
