const component = require('@mikro-cms/models/component');

/**
 * Generate api service to compile requested api.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function serviceApiGenerate(req, res, next) {
  if (req.error) {
    res.status(req.status || 500)
      .send({
        message: req.error.toString()
      });
  } else {
    next();
  }
}

/**
 * Generate page service to compile requested page with components.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function servicePageGenerate(req, res, next) {
  if (req.error) {
    res.status(req.status || 500)
      .send(req.error.toString());
  } else {
    component.find({
      page: res.locals.page._id
    }).exec(function (err, components) {
      if (err) {
        res.send(err);
      } else if (components === null) {
        res.locals.components = {};
      } else {
        res.locals.components = {};

        components.forEach(function (component) {
          res.locals.components[component.component_name] = component;
        })
      }

      const VarsBind = {
        ...req.utils,
        ...res.locals,
        trans: res.trans
      };

      res.render(res.locals.page.theme.theme_view, VarsBind);
    });
  }
}

module.exports = {
  api: serviceApiGenerate,
  page: servicePageGenerate
};
