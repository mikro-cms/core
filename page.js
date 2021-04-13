const modelPage = require('@mikro-cms/models/page');
const utils = require('./utils');

/**
 * Page service to get requested page.
 *
 * @public
 * @param   request
 * @param   response
 * @param   next
 * @return  void
 */
function servicePage(req, res, next) {
  if (req.error) return next();

  modelPage.findOne({ page_url: req.originalUrl })
    .populate('theme')
    .exec(function (err, page) {
      if (err) {
        req.error = err;
      } else if (page === null) {
        req.error = new Error(res.trans('exception.page_not_found'));
      } else {
        res.locals.page = page;

        // initialization utils
        req.utils = utils(req, res);
      }

      next();
    })
}

module.exports = servicePage;
