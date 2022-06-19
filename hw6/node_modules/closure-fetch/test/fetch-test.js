describe('net.fetch', function () {
  var fetch = net.fetchImpl;

  var base64 = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

  // This method is just for testing. It is bad.
  function toBase64(arrayBuffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)))
  }

  it('resolves when fetching GET HTTP 200', function (done) {
    fetch('/200').then(function (response) {
      expect(response.ok, 'to be true');
      expect(response.status, 'to equal', 200);
      expect(response.statusText, 'to equal', 'OK');
      expect(response.arrayBuffer, 'to be a function');

      response.arrayBuffer().then(function (buffer) {
        expect(toBase64(buffer), 'to equal', base64);
        done();
      });
    }).catch(function (e) {
      done(e);
    });
  });

  it('rejects when fetching GET HTTP 404', function (done) {
    fetch('/404').then(function (response) {
      expect(response.ok, 'to be false');
      expect(response.status, 'to equal', 404);
      expect(response.statusText, 'to equal', 'Not Found');
      expect(response.arrayBuffer, 'to be a function');
      done();
    }).catch(function (e) {
      done(e);
    });
  });

  it('resolves when fetching POST HTTP 200', function (done) {
    fetch('/200', { method: 'POST' }).then(function (response) {
      expect(response.ok, 'to be true');
      expect(response.status, 'to equal', 200);
      expect(response.statusText, 'to equal', 'OK');
      expect(response.arrayBuffer, 'to be a function');

      response.arrayBuffer().then(function (buffer) {
        expect(toBase64(buffer), 'to equal', base64);
        done();
      });
    }).catch(function (e) {
      done(e);
    });
  });

  it('rejects when fetching POST HTTP 404', function (done) {
    fetch('/404', { method: 'POST' }).then(function (response) {
      expect(response.ok, 'to be false');
      expect(response.status, 'to equal', 404);
      expect(response.statusText, 'to equal', 'Not Found');
      expect(response.arrayBuffer, 'to be a function');
      done();
    }).catch(function (e) {
      done(e);
    });
  });

  it('can send data', function (done) {
    fetch('/send', { method: 'POST', body: 'hello=world', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}).then(function (response) {
      expect(response.ok, 'to be true');
      expect(response.status, 'to equal', 200);
      expect(response.statusText, 'to equal', 'OK');
      expect(response.arrayBuffer, 'to be a function');
      done();
    }).catch(function (e) {
      done(e);
    });
  });
});
