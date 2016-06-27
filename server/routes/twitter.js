
// server/routes/twitter.js

var express         = require('express');           // Express
var expressSession  = require('express-session');   // This enables sessions for req
var request         = require('request');           // Request is for node api calls
var twitterAPI      = require('node-twitter-api');  // Node Twitter API module, read docs for more information
var Config          = require('../config/config');  // Contains API Keys

var twitter = new twitterAPI({                              // Creates a new instance of our 'node-twitter-api' module
  consumerKey: Config.twitterConfig.key,                    // FeedFuse app key
  consumerSecret: Config.twitterConfig.secret,              // FeedFuse app secret key
  callback: "https://feedfuse.herokuapp.com/auth/twitter/callback"   // Redirect-callback URL after /auth/twitter redirect passes
});
  
module.exports = function(app) {
  
  // Twitter Authentication --------------------------------------------------------
  
  // Authentication
  app.get('/auth/twitter', function(req, res) {                       // Handles /auth/twitter route from from home.html
    twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){   // Calls our new twitterAPI line 10
      if (error) {                                                    // The params create request tokens to send along to Twitter
        console.log("Error getting OAuth request token : " + error.data);
      } else {
        req.session.twitter = {};                                     // Creates twitter session object
        req.session.twitter.requestToken = requestToken;              // Stores request token in session
        req.session.twitter.requestTokenSecret = requestTokenSecret;  // Store request token secret in session
        res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + requestToken); // Redirects you to twitters
      }                                                               // authentication page with your request token
    });
  });
  
  // After you're authorized  - The redirect to twitter.com from /auth/twitter/ will then redirect you back to this route, line 13
  app.get('/auth/twitter/callback', function(req, res) {
    req.session.twitter.oauth_verifier = req.query['oauth_verifier']; // Stores oauth_verifier in session
    twitter.getAccessToken(req.session.twitter.requestToken,          // Passes requestToken into getAccessToken
                           req.session.twitter.requestTokenSecret,    // Passes requestTokenSecret into getAccessToken
                           req.session.twitter.oauth_verifier,        // Passes oauth_verifer into getAccessToken
                           function(error, accessToken, accessTokenSecret, results) {
      if (error) {
        console.log('Twitter Callback Error', error.body);
      } else {
        req.session.twitter.accessToken = accessToken;              // Stores accessToken in session
        req.session.twitter.accessTokenSecret = accessTokenSecret;  // Stores accessTokenSecret in session
        res.redirect('/');                                          // Redirects to '/' with both access tokens      
      }
    });
  });
  
  // API Twitter Calls ----------------------------------------------------------------
  
  // More info on different twitter methods
  // https://www.npmjs.com/package/node-twitter-api

  // Twitters API Docs for home timeline. Check for other requests
  // https://dev.twitter.com/rest/reference/get/statuses/home_timeline
  
  // 10 recent tweets from homepage
  app.post('/api/twitter', function(req, res) {
    var query = req.body.search;    // Parse our req.body for query, this is the search term from the homepage
    if ( req.session.twitter ){                                   // Make sure a twitter session exists
      if ( req.session.twitter.accessToken !== undefined ){       // Checks if Twitter access token exists
        twitter.search( { q: '%23' + query,                       // Runs node-twitter-api's search method
                          count: 10,                              // Parameters: q = twitters query, '%23' is # in the url
                          result_type: 'recent' },                // Count is how many tweets you want. Result_type is recent tweets.
                          req.session.twitter.accessToken,        // Passes session accessToken
                          req.session.twitter.accessTokenSecret,  // Passes session accessTokenSecret
                          function(err, data, response){
          res.json(data.statuses);                                // Sends data back to front-end
        });
      } else {
        res.send(404, undefined); // Sends back undefined if you're not authorized
      }
    } else {
      res.send(404, undefined);   // Sends back undefined if you don't have a twitter session
    }
  });
  
  /* BACKLOG -----------
  
  // Top Posts
  app.get('/api/twitter/top', function(req, res) {
    // Request top posts
    res.send(200, '/api/twitter route works yee')
  });
  
  // Hash Tag Search
  app.get('/api/twitter/hash', function(req, res) {
    // hashtag = %23 + 'string'
    res.send(200, '/api/twitter route works yee')
  });
  
    BACKLOG -----------
  */
  
};