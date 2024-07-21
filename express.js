// The current instance of the Express application
var source = {};

/**
 * Sets the current instance of the Express application.
 *
 * @param   object
 * @return  void
 */
function setInstance(expressAPP) {
  source.instance = expressAPP;
}

module.exports = {
  source,
  setInstance
};
