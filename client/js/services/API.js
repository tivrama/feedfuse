angular.module('ff.services').service('Twitter', function($http) {
  var getData = function(query) {
    return $http({
      method: 'POST',
      url: '/api/twitter/', // Makes request with query to server to call Twitter API
      data: JSON.stringify({search: query})
    }).then(function(data) {
      return data;
    }, function(error) {
      return error;
    })
  };

  return {
    getData: getData
  };
});

angular.module('ff.services').service('Instagram', function($http) {
  var getData = function(query) {
    return $http({
      method: 'POST',
      url: '/api/instagram/', // Makes request with query to server to call Instagram API
      data: JSON.stringify({search: query})
    }).then(function(data) {
      return data;
    }, function(error) {
      return error;
    })
  };

  return {
    getData: getData
  };
});

angular.module('ff.services').service('Reddit', function($http) {
  var getData = function(query) {
    return $http({
      method: 'POST',
      url: '/api/reddit/', // Makes request with query to server to call Reddit API
      data: JSON.stringify({search: query})
    }).then(function(data) {
      return data;
    }, function(error) {
      return error;
    })
  };

  return {
    getData: getData
  };
});
