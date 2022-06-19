# Closure Fetch

A minimal fetch implementation that supports sending ArrayBuffer and plain strings. Retrieval only supports array buffers as response.


    fetch('/myfile.zip').then(function (response) {
      response.arrayBuffer().then(function (buffer) {
      });
    });
