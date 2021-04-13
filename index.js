/**
 * Module dependencies.
 */
 const apis = require('./apis');

 /**
  * Create mikro-cms middleware.
  *
  * @param   object    express app instance
  * @param   callback
  * @return  void
  */
 function mikroCMS(app, cb) {
   apis.bootstrap(app, cb);
 }

 module.exports = mikroCMS;
