goog.provide('net.fetch');

goog.require('net.Body');
goog.require('net.Response');

goog.scope(function () {
  var Body = net.Body,
      Response = net.Response;

  var SUPPORTS_RESPONSE_TYPE = !(window['XDomainRequest'] && !('responseType' in XMLHttpRequest.prototype))

  /**
   * @param {string} input
   * @param {net.RequestInit=} opt_init
   * @return {Promise.<net.Response>}
   */
  net.fetchImpl = function (input, opt_init) {
    var init = opt_init || /** @type {net.RequestInit} */ ({
      method: 'GET',
      headers: {},
      body: null
    });

    return new Promise(function (resolve, reject) {
      if (SUPPORTS_RESPONSE_TYPE) {
        var request = new XMLHttpRequest();

        request.onload = function () {
          resolve(new Response(/** @type {net.BodyInit} */ (request.response), {
            status: request.status,
            statusText: request.statusText
          }));
        };

        request.onerror = function (e) {
          reject(new TypeError('Network request failed'));
        };

        request.open(init.method, input);

        // If we didn't need to support IE9 we could use Blob here
        // and convert it to whatever response type we need.
        request.responseType = 'arraybuffer';

        if (init.headers) {
          Object.keys(/** @type {!Object} */ (init.headers)).forEach(function (header) {
            request.setRequestHeader(header, init.headers[header]);
          });
        }

        request.send(init.body);
      } else {
        var request = new XDomainRequest();

        request.open(init.method, input.replace(/^http(s)?:/i, window.location.protocol));

        request.ontimeout = function () { return true; };
        request.onprogress = function () { return true; };

        request.onload = function () {
          resolve(new Response(/** @type {net.BodyInit} */ (request.responseText), {
            status: request.status,
            statusText: request.statusText
          }));
        };

        request.onerror = function () {
          reject(new TypeError('Network request failed'));
        };

        setTimeout(function () {
          request.send(/** @type {string} */ (init.body));
        }, 0);
      }
    });
  };

  // FIXME: The native fetch is disabled until we figure out
  // what to do with the Referer header. It is set to about:client
  // when using fetch (on Firefox), and to a URL on Chrome. The spec
  // seems to indicate Firefox is correct, but we need the referrer
  // to be sent, so let's fallback on XMLHttpRequest for now (which
  // sends the referrer in both browsers).
  //if (window['fetch']) {
  //  net.fetch = window['fetch'].bind(window);
  //} else {
    net.fetch = net.fetchImpl;
  //}
});
