goog.require('net.fetch');

if (!window['fetch']) {
  window['fetch'] = net.fetchImpl;
  window['Response'] = net.Response;
}
