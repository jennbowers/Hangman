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
  , lettersId: function(letters) {
    return lettersIdx++;
  }
  , completedLetters: []
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
    // res.redirect('/game');
    next();
  }
});

// generates random number to get random word
// app.use(function(req, res, next) {
//   var randomIndex = Math.floor(Math.random() * (words.length));
//   // console.log(randomIndex);
//   var randomWord = words[randomIndex];
//   // console.log(randomWord);
//   var letters = randomWord.split('');
//   // console.log(letters);
//
//   // stores letters that are split into an array into the context wordLetters so we can assign an id to each
//   context.letters.push(letters);
//   console.log(context);
//   next();
// });


// requests--rendering all pages
app.get('/', function(req, res) {
  res.send('Hi! I work');
});

app.get('/login', function(req, res) {
  res.render('login', {});
});

app.get('/game', function(req, res) {
  lettersIdx = 0;
  // generates random number to get random word
  var randomIndex = Math.floor(Math.random() * (words.length));
  var randomWord = words[randomIndex];
  var letters = randomWord.split("");

  // stores letters that are split into an array into the context wordLetters so we can assign an id to each
  context.letters = context.letters.concat(letters);
  // context.letters.push(letters);
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







app.listen(3000, function(){
  console.log('Successfully started express application!');
});
