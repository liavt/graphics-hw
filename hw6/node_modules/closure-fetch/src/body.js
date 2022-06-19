goog.provide('net.Body');

goog.scope(function () {
  /**
   * @interface
   */
  net.Body = function () {};

  /**
   * @return {Promise.<ArrayBuffer>}
   */
  net.Body.prototype['arrayBuffer'] = function () {};
});
