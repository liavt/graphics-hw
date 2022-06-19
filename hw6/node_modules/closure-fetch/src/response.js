goog.provide('net.Response');

goog.scope(function () {
  /**
   * @constructor
   * @implements {net.Body}
   *
   * @param {net.BodyInit} body
   * @param {net.ResponseInit} init
   */
  net.Response = function (body, init) {
    /**
     * @type {number}
     */
    this['status'] = init.status;

    /**
     * @type {boolean}
     */
    this['ok'] = (init.status >= 200 && init.status < 300) || init.status === 0;

    /**
     * @type {string}
     */
    this['statusText'] = init.statusText;

    /**
     * @type {net.BodyInit}
     */
    this.body = body;
  };

  var Response = net.Response;

  /**
   * @return {Promise.<ArrayBuffer>}
   */
  Response.prototype['arrayBuffer'] = function () {
    return Promise.resolve(/** @type {ArrayBuffer} */ (this.body));
  };
});
