const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const expressValidator = require('express-validator');
const fs = require('file-system');

const app = express();

// --------------------------database
var lettersIdx = 0;


var loginData = [
  {name: 'Jenn'}
];

var context = {
  letters: ['']
  , correctLetters: ['']
  , displayErrors: []
  , guessedLetters: []
  , views: []
};


const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");




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

app.use(function(req, res, next) {
  var pathname = parseurl(req).pathname;
  var views = req.session.views;
  if (!views) {
    views = req.session.views = {};
  } else {
    views[pathname] = (views[pathname] || 0) + 1;
    context.views = views[pathname];
    req.session.views = views[pathname];
  }
  next();
});



// requests--rendering all pages
app.get('/', function(req, res) {
  res.send('Hi! I work');
});

app.get('/login', function(req, res) {
  res.render('login', {});
});

app.get('/game', function(req, res) {
  // lettersIdx = 0;
  // generates random number to get random word
  var randomIndex = Math.floor(Math.random() * (words.length));
  var randomWord = words[randomIndex];
  var letters = randomWord.split("");

  // stores letters that are split into an array into the context wordLetters so we can assign an id to each
  context.letters = context.letters.concat(letters);
  context.letters.shift();
  context.correctLetters = context.correctLetters.concat(letters);
  context.correctLetters.shift();
  console.log(context);
  res.render('game', context);
});

// login--check to see if has session already
app.post('/login', function(req, res) {

  var user_name = req.body.name;

  if (user_name) {
    req.session.user = user_name;
    // console.log(req.session);
  }

  if (req.session.user == user_name) {
    console.log(req.session.user);
    res.redirect('/game');
  } else {
    console.log('fail');
    res.redirect('/login');
  }

});

app.post('/game', function(req, res) {
  // checking to make sure that the input is only 1 letter
  req.checkBody('user_input', 'You can only pick one letter at a time').isLength({min: 1, max: 100});
  let errors = req.validationErrors();
  if (errors) {
    context['errors'] = errors;
    }
    context['user_input'] = req.body.user_input;

  context.letters.forEach(function(letter, i){
    console.log(letter);
    console.log(req.body.user_input);
    if (req.body.user_input === letter) {
      var index = context.letters.indexOf(letter);
      context.letters.splice(index, 1, "");
      // letter = "";
      // console.log(context.guessedLetters);
    } else if (req.body.user_input != letter) {
      // have the counter tick
    } else if (req.body.user_input === context.guessedLetters) {
      // have counter not tick
    }
  });
  context.guessedLetters.push(req.body.user_input);
  console.log(context);

    res.render('game', context);
});




app.listen(3000, function(){
  console.log('Successfully started express application!');
});
