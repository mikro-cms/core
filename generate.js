const component = require('@mikro-cms/models/component');

/**
 * Generate service to compile requested page with components.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 */
function serviceGenerate(req, res, next) {
  if (req.error) {
    res.send(req.error.toString());
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

      const ThemeIndexPath = req.utils.theme('/index');
      const VarsBind = {
        ...req.utils,
        ...res.locals,
        trans: res.trans
      };

      res.render(ThemeIndexPath, VarsBind);
    });
  }
}

module.exports = serviceGenerate;
