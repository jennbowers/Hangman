const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const expressValidator = require('express-validator');

// controllers
var loginController = require('./controllers/login-user');
var gameController = require('./controllers/game-user');

const app = express();


// view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(expressValidator());

//setting up paths
app.use(express.static(path.join(__dirname, 'public')));

//-----------MIDDLEWARE I WROTE BEGINS
// session set up
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// redirects to login if not logged in
app.use(function(req, res, next) {
  var pathname = parseurl(req).pathname;
  if(!req.session.user &&  pathname != '/login') {
    res.redirect('/login');
  } else {
    next();
  }
});


// requests--rendering all pages
app.get('/', function(req, res) {
  res.send('Hi! I work');
});

// renders login page
app.get('/login', loginController.renderLogin);

// renders game at beginning with new random word
app.get('/game', gameController.renderGame);

// login--check to see if user has a session already
app.post('/login', loginController.postLogin);

// game controls, entering letters here
app.post('/game', gameController.enterLetters);


app.listen(3000, function(){
  console.log('Successfully started express application!');
});
