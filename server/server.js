
// server/server.js

var express         = require('express');
var expressSession  = require('express-session'); // Used for storing our OAuth access_tokens
var cookieParser    = require('cookie-parser');
var app             = express();
var bodyParser      = require('body-parser');
var morgan          = require('morgan');       // used for logging incoming request
var methodOverride  = require('method-override');
var Config          = require('./config/config');  // Contains API Keys

// Sets up our port, default is 5000
var port = process.env.PORT || 5000;

app.use(morgan('dev'));
app.use(bodyParser.json());                                       // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));   // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true }));               // parse application/x-www-form-urlencoded
app.use(express.static('client'));                                // Set the static file location to /client
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));  // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + './client'));     // Set the static file location to /client
app.use(expressSession({ secret: 'meow', resave: true, saveUninitialized: true })); // Sets up our express session resave value

// Creates an instance of an express router
var router            = express.Router();      // Creates Router
var twitterRouter     = express.Router();      // Creates Twitter Router
var instagramRouter   = express.Router();      // Creates Instagram Router
var facebookRouter    = express.Router();      // Creates Facebook Router
var redditRouter      = express.Router();      // Creates Reddit Router

// Prefixes all routes with /api
app.use('/api', router);
app.use('/auth/twitter', twitterRouter);        // Sets /auth/twitter/ route to use twitterRouter
app.use('/api/twitter', twitterRouter);         // Sets /api/twitter/ route to use twitterRouter
app.use('/auth/instagram', instagramRouter);    // Sets /auth/instagram/ route to use instagramRouter
app.use('/api/instagram', instagramRouter);     // Sets /api/instagrapm/ route to use instagramRouter
app.use('/auth/facebook', facebookRouter);      // Not currently in use
app.use('/auth/facebook', facebookRouter);      // Not currently in use
app.use('/api/reddit', redditRouter);           // Sets /api/reddit route to use redditRouter

// Configures our routes
require('./routes/routes.js')(app);
require('./routes/twitter.js')(app);
require('./routes/instagram.js')(app);
require('./routes/facebook.js')(app);
require('./routes/reddit.js')(app);

// Starts app
app.listen(port);

console.log('Currently on port ' + port);

// exports app
exports = module.exports = app;

