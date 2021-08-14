const component = require('@mikro-cms/models/component');
const express = require('@mikro-cms/core/express');

/**
 * Generate api service to compile requested api.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
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
 * Generate resource service to compile requested api resource result to response json.
 *
 * @public
 * @param     object
 * @param     object
 * @param     mixed
 * @return    void
 */
function serviceResourceGenerate(req, res, next) {
  res.status(res.result.status || 200)
    .json(res.result);
}

/**
 * Generate page service to compile requested page with components.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function servicePageGenerate(req, res, next) {
  if (req.error) {
    res.status(req.status || 500)
      .send(req.error.toString());
  } else {
    component.find({
      page: res.locals.page._id
    }).exec(async function (err, components) {
      if (err) {
        res.send(err);
      } else if (components === null) {
        res.locals.components = {};
      } else {
        res.locals.components = {};

        components.forEach(function (component) {
          res.locals.components[component.component_name] = component;
        });
      }

      const themeOptions = require(res.locals.page.theme.theme_options);
      const themeData = themeOptions[res.locals.page.variant].data || undefined;

      let dataView = null;

      if (typeof themeData !== 'undefined') {
        try {
          dataView = await themeData.call({
            req: req,
            res: res,
            api: express.api(req, res)
          });
        } catch (err) {
          next(err);

          return;
        }
      }

      const pathView = `${res.locals.page.theme.theme_view}/${res.locals.page.variant}`;
      const VarsBind = {
        ...req.utils,
        ...res.locals,
        trans: res.trans,
        data: dataView
      };

      res.render(pathView, VarsBind);
    });
  }
}

module.exports = {
  api: serviceApiGenerate,
  resource: serviceResourceGenerate,
  page: servicePageGenerate
};
