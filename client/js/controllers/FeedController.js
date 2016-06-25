angular.module('ff.controllers').controller('FeedController', function($scope, Feed, Twitter, Instagram, Reddit, $timeout, $q, $state) {
  
  $scope.loading = true; // Flag for showing/hiding loading spinner GIF

  $scope.$watch(function() {
    return Feed.getQuery(); // Set watch expression; setQuery() done in MainController
  }, function(newQuery, oldQuery) {
    // newQuery - current listener call
    // oldQuery - previous listener call

    if (newQuery !== null) {                     // Makes sure there is a search term
      $scope.query = newQuery; // Grab search query



      // twitter promise
      var twitterGet = Twitter.getData($scope.query).then(function(results) {
        // If Twitter was authorized, store the returned results array
        // If not, set it to undefined
        if (!results.data) {
          $scope.twitterData = undefined;
        } else {
          $scope.twitterData = results.data;
        }
      });

      //reddit promise
      var redditGet =  Reddit.getData($scope.query).then(function(results) {
        var data = results.data.data.children;
        //store results in $scope for sort
        //check if data.length is greater than 10
        if (data.length > 10) {
          //get first 10 results
          data = data.slice(0, 10);
        }
        //add results to $scope
        $scope.redditData = data;
        console.log($scope.redditData, 'redditData in presort');
      });

      //when both twitter and reddit come back
      $q.all([twitterGet, redditGet]).then(function() {
        //check if no results
        console.log('rData', $scope.redditData, 'tData', $scope.twitterData);
        if (!$scope.twitterData && !$scope.redditData) {
          Feed.setDataExists(false); // Set flag for no data found alert
          $state.go('home'); // Return state to home
        }
        $scope.sort($scope.twitterData, $scope.redditData);
      });


  }, true);
  



  // Sort function organizes the API responses from Twitter and Instagram into one final sorted array
  // $scope.sort = function(twitter, instagram) {
  $scope.sort = function(twitter, reddit) {
    // twitter = twitterData array
    // reddit = redditData array

    $scope.unsorted = []; // Initialize unsorted array



    if (twitter !== null) {              // Checks to see if Twitter data was passed
      // Convert Twitter timestamp to be consistent with Instagram as epoch time
      twitter.forEach(function(val){
        var time = val.created_at;
        var epochTime = epochConverter(time); // Converts created_at string to an epoch time integer
        var correctedTime = epochTime;

        val.created_at = parseInt(correctedTime); // Turns epoch time to a string again after last line
        val.source_network = 'twitter'; // Adds flag for data source
        
        $scope.unsorted.push(val); // Push each tweet into the unsorted array
      });
    };

    if (reddit !== null) {              // Checks to see if Reddit data was passed
      // Convert Reddit timestamp to be consistent with Twitter as epoch time
      reddit.forEach(function(val){
        var time = val.data.created_utc; //EXAMPLE 1305208232.0
        val.created_at = parseInt(time) * 1000; // Convert Reddit created_at time to milliseconds
        val.source_network = 'reddit'; // Add flag for data source
        
        $scope.unsorted.push(val); // Push each post into the unsorted array
      });
    };

    $scope.reverseSort = _.sortBy($scope.unsorted, function(val){
      return val.created_at;
    });
    
    $scope.firstSort = $scope.reverseSort.reverse(); // Reverses sorted array so newest posts are on top

    //------begin shuffle--------------------------------------------

    function shuffleRedditAndTwitter(sorted) {
      var shuffled = [];
      for (var i = 0; i < 10; i++) {
        shuffled.push(sorted[i]);
        shuffled.push(sorted[i+10]);
      }
      return shuffled;
    };

    $scope.sorted = shuffleRedditAndTwitter($scope.firstSort);// = shuffled reddit and twitter
    console.log('soted everything: ', $scope.sorted);
    //-------end shuffle---------------------------------------------


    // Not needed for Reddit
    $scope.callWidgets(); // Call for Twitter widget to activate embedded post styling

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
      // console.log('epochConverter: ', Date.UTC(year, mnths[mon], day, hour, min, sec)); //1466820892000
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
    // Not needed for Reddit

    // Resolve widget calls before refreshing widgets and activating embedded post styling
    // Timeout is to allow time for photos (if any) to download
    $q.all([twitterWidget, instagramWidget]).then(function(results) {
      $timeout(function() {
        $scope.refreshWidgets();
      }, 2500);
    });
  };
  
});
