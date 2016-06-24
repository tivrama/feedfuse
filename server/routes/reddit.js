var request = require('request');
var express = require('express');

module.exports = function(app) {
  
  // Handle query post from client to gets articles from reddit
  app.post('/api/reddit', function (req, res) {
    //get query from req
    var query = req.body.search;
    request('https://json.reddit.com/search?q=' + query, function(error, response, body) {
      if (error) {
        console.log('Something went wrong with reddit', error);
      } else {
        res.send(body);
      }
    });
  });
};