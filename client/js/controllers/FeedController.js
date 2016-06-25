angular.module('ff.controllers').controller('FeedController', function($scope, Feed, Twitter, Instagram, Reddit, $timeout, $q, $state) {
  
  $scope.loading = true; // Flag for showing/hiding loading spinner GIF

  $scope.$watch(function() {
    return Feed.getQuery(); // Set watch expression; setQuery() done in MainController
  }, function(newQuery, oldQuery) {
    // newQuery - current listener call
    // oldQuery - previous listener call

    if (newQuery !== null) {                     // Makes sure there is a search term
      $scope.query = newQuery; // Grab search query

      //<START-------------------reddit testing---------------------------->
      Reddit.getData($scope.query).then(function(results) {
        var data = results.data.data.children;
        if (data.length > 10) {
          data = data.slice(0, 10);
        }
        console.log(data);

      });
      //<END---------------------reddit testing---------------------------->


      //<START-------------------CHANGE INSTAGRAM TO REDDIT---------------->
      //<START-------------------CHANGE INSTAGRAM TO REDDIT---------------->

      Twitter.getData($scope.query).then(function(results) {
        // If Twitter was authorized, store the returned results array
        // If not, set it to undefined

        if (!results.data) {
          $scope.twitterData = undefined;
        } else {
          $scope.twitterData = results.data;
        }
      }).then(function(){
          // Get search results from reddit
          Reddit.getData($scope.query).then(function(results) {
            var data = results.data.data.children;
            //store results in $scope for sort
            //check if data.length is greater than 10
            if (data.length > 10) {
              data = data.slice(0,9);
            }
            $scope.redditData = data;
          });
        }).then(function(){
          if ($scope.twitterData !== undefined && $scope.redditData !== undefined) {
            // Both Twitter and reddit accounts were authorized

            // Check whether data for both actually exists
            if ($scope.twitterData.length <= 0 && $scope.redditData.length <= 0) {
              Feed.setDataExists(false); // Set flag for no data found alert
              $state.go('home'); // Return state to home
            } else {
              $scope.sort($scope.twitterData, $scope.redditData); // Invoke sort function
            }
          } else if ($scope.twitterData !== undefined && $scope.redditData === undefined) {
            // Only Twitter authorized

            // Check whether Twitter data actually exists
            if ($scope.twitterData.length <= 0){
              Feed.setDataExists(false); // Set flag for no data found alert
              $state.go('home'); // Return state to home
            } else {
              $scope.sort($scope.twitterData, null); // Invoke sort function
            }
          } else if ($scope.redditData !== undefined && $scope.twitterData === undefined) {
            // Only reddit authorized

            // Check whether reddit data actually exists
            if ($scope.redditData.length <= 0){
              Feed.setDataExists(false); // Set flag for no data found alert
              $state.go('home'); // Return state to home
            } else {
              $scope.sort(null, $scope.redditData); // Invoke sort function
            }
          }
        }).catch(function(err) {
          // reddit catch()
          console.error(err);
        })
      .catch(function(err) {
        // Twitter catch()
        console.error(err);
      });
      //<END-------------------CHANGE INSTAGRAM TO REDDIT---------------->
      //<END-------------------CHANGE INSTAGRAM TO REDDIT---------------->

    }
  }, true);
  
  // Sort function organizes the API responses from Twitter and Instagram into one final sorted array
  $scope.sort = function(twitter, instagram) {
    // twitter = twitterData array
    // instagram = instagramData array

    $scope.unsorted = []; // Initialize unsorted array
    
    if (instagram !== null) {
      // Convert Instagram timestamp to be consistent with Twitter as epoch time

      instagram.forEach(function(val){
        var time = val.created_time;

        val.created_at = parseInt(time) * 1000; // Convert Instagram created_at time to milliseconds
        val.source_network = 'instagram'; // Add flag for data source
        
        $scope.unsorted.push(val); // Push each post into the unsorted array
      });
    };

    if (twitter !== null) {              // Checks to see if Twitter data was passed
      // Convert Twitter timestamp to be consistent with Instagram as epoch time
      
      twitter.forEach(function(val){
        var time = val.created_at;
        // var offset = val.user.utc_offset;
        var epochTime = epochConverter(time); // Converts created_at string to an epoch time integer
        var correctedTime = epochTime;

        val.created_at = parseInt(correctedTime); // Turns epoch time to a string again after last line
        val.source_network = 'twitter'; // Adds flag for data source
        
        $scope.unsorted.push(val); // Push each tweet into the unsorted array
      });
    };
    
    $scope.reverseSort = _.sortBy($scope.unsorted, function(val){
      return val.created_at;
    });
    
    $scope.sorted = $scope.reverseSort.reverse(); // Reverses sorted array so newest posts are on top

    $scope.callWidgets(); // Call for Twitter and Instagram widgets to activate embedded post styling

    function epochConverter(str){
      // Convert Twitter's original created_at timestamp string into epoch time

      var fullDate = str,
          day = str.substring(8,10),
          mon = str.substring(4,7),
          year = str.substring(26),
          hour = str.substring(11,13),
          min = str.substring(14,16),
          sec = str.substring(17,19);
      
      var mnths = { 
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      
      return Date.UTC(year, mnths[mon], day, hour, min, sec);
    };
  };

  $scope.refreshWidgets = function() {
    twttr.widgets.load(); // Call Twitter widget function (external script that gets included)
    instgrm.Embeds.process(); // Call Instagram widget function (external script that gets included)
    $scope.loading = false; // Stop spinner
  };

  $scope.callWidgets = function() {
    var twitterWidget = Feed.getTwitterWidget();
    var instagramWidget = Feed.getInstagramWidget();

    // Resolve widget calls before refreshing widgets and activating embedded post styling
    // Timeout is to allow time for photos (if any) to download
    $q.all([twitterWidget, instagramWidget]).then(function(results) {
      $timeout(function() {
        $scope.refreshWidgets();
      }, 2500);
    });
  };
  
});
