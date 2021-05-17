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

  const pageUrls = [
    { page_url: req.originalUrl }
  ];

  // intergration with single page application routing system
  if (typeof req.params.pageName === 'undefined') {
    pageUrls.push({ page_url: '/' + req.params[0] + '/*' });
  } else {
    pageUrls.push({ page_url: '/' + req.params.pageName + '/*' })
  }

  modelPage.findOne({ $or: pageUrls })
    .populate('theme')
    .exec(function (err, page) {
      if (err) {
        req.error = err;
      } else if (page === null) {
        req.status = 404;
        req.error = new Error(res.trans('exception.page_not_found'));
      } else {
        res.locals.page = page;

        // initialization utils
        req.utils = utils(res.locals);
      }

      next();
    })
}

module.exports = servicePage;
