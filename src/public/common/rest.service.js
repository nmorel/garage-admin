function restService($q, $http) {

  var service = {
    'get': get,
    'delete': del,
    'head': head,
    'jsonp': jsonp,
    'post': post,
    'put': put,
    'patch': patch,
    'http': http,
  };

  return service;

  function http(config) {
    return send(config);
  }

  function get(url, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'GET';
    config.url = url;

    return send(config);
  }

  function del(url, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'DELETE';
    config.url = url;

    return send(config);
  }

  function head(url, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'HEAD';
    config.url = url;

    return send(config);
  }

  function jsonp(url, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'JSONP';
    config.url = url;

    return send(config);
  }

  function post(url, data, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'POST';
    config.url = url;
    config.data = data;

    return send(config);
  }

  function put(url, data, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'PUT';
    config.url = url;
    config.data = data;

    return send(config);
  }

  function patch(url, data, config) {
    if (angular.isUndefined(config)) {
      config = {};
    }

    config.method = 'PATCH';
    config.url = url;
    config.data = data;

    return send(config);
  }

  function send(config) {
    console.log('Sending: ' + config.method + ' ' + config.url);

    // Abort stuff found here : http://www.bennadel.com/blog/2616-aborting-ajax-requests-using-http-and-angularjs.htm
    var deferredAbort = $q.defer();
    config.timeout = deferredAbort.promise;

    // Initiate the AJAX request.
    var request = $http(config);

    // Rather than returning the http-promise object, we want to pipe it
    // through another promise so that we can "unwrap" the response
    // without letting the http-transport mechansim leak out of the
    // service layer.
    var promise = request.then(
      function (response) {
        console.log('Success: ' + config.method + ' ' + config.url);
        return ( response.data );
      },
      function (error) {
        if (promise.aborted) {
          console.log('Aborted: ' + config.method + ' ' + config.url);
          return ( $q.reject('aborted') );
        } else if (error.status === 304) {
          console.log('304: Not modified: ' + config.method + ' ' + config.url);
          return ( $q.reject(error) );
        } else {
          console.log('Failed: ' + config.method + ' ' + config.url);
          return ( $q.reject(error) );
        }
      }
    );

    // Now that we have the promise that we're going to return to the
    // calling context, let's augment it with the abort method. Since
    // the $http service uses a deferred value for the timeout, then
    // all we have to do here is resolve the value and AngularJS will
    // abort the underlying AJAX request.
    promise.abort = function () {
      console.log('Aborting: ' + config.method + ' ' + config.url);
      promise.aborted = true;
      deferredAbort.resolve();
    };

    // Since we're creating functions and passing them out of scope,
    // we're creating object references that may be hard to garbage
    // collect. As such, we can perform some clean-up once we know
    // that the requests has finished.
    promise.finally(
      function () {
        promise.abort = angular.noop;
        deferredAbort = request = promise = null;
      }
    );

    return promise;
  }
}

angular.module('app')
  .factory('restService', restService);

