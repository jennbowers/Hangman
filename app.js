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



var loginData = [
  {name: 'Jenn'}
];

var context = {
  letters: ['']
  , correctLetters: ['']
  , displayErrors: ' '
  , replaceLetter: []
  , guessedLetters: []
  , guessesLeft: 8
  , duplicateErrorMsg: ' '
  , endingMsg: ''
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


// requests--rendering all pages
app.get('/', function(req, res) {
  res.send('Hi! I work');
});

app.get('/login', function(req, res) {
  res.render('login', {});
});

app.get('/game', function(req, res) {
  // lettersIdx = 0;
  // // generates random number to get random word
  context.letters = [''];
  context.correctLetters = [''];
  context.endingMsg = '';
  context.guessedLetters = [];
  context.guessesLeft = 8;
  var randomIndex = Math.floor(Math.random() * (words.length));
  var randomWord = words[randomIndex];
  var letters = randomWord.split("");
  var correctLetters = randomWord.split("");

  // loops through all letters in letters array and replaces them with __
  for (var i = 0; i < letters.length; i++) {
    letters[i] = '__';
  }

  // stores letters that are split into an array into the context wordLetters so we can assign an id to each
  context.letters = context.letters.concat(letters);
  context.letters.shift();
  context.correctLetters = context.correctLetters.concat(correctLetters);
  context.correctLetters.shift();
  req.session.word = context.letters;
  req.session.correctWord = context.correctLetters;
  console.log(context);
  res.render('game', context);
});

// login--check to see if has session already
app.post('/login', function(req, res) {

  var user_name = req.body.name;

  if (user_name) {
    req.session.user = user_name;
  }

  if (req.session.user == user_name) {
    res.redirect('/game');
  } else {
    console.log('fail');
    res.redirect('/login');
  }

});

app.post('/game', function(req, res) {
  // checking to make sure that the input is only 1 letter
  req.checkBody('user_input', 'You can only pick one letter at a time').isLength({min: 1, max: 1});
  let errors = req.validationErrors();
  if (errors) {
    context['errors'] = errors;
  } else {
    context.errors = ' ';
  }
    context['user_input'] = req.body.user_input;


  // loops through each letter to replace blank letters with correct letters
  for (var i = 0; i < context.correctLetters.length; i++) {
    if (req.body.user_input.toLowerCase() === context.correctLetters[i]) {
      context.duplicateErrorMsg = ' ';
      console.log(context.correctLetters[i]);
      context.letters[i] = context.correctLetters[i];
      req.session.word = context.letters;
      console.log(context);
    }
  }

  // makes counter tick if the guess is incorrect
  if (!context.correctLetters.includes(req.body.user_input.toLowerCase())) {
    context.guessesLeft--;
    req.session.guessesLeft = context.guessesLeft;
    context.duplicateErrorMsg = ' ';
  }
  context.duplicateErrorMsg = ' ';

  // makes counter not tick if guess is a duplicate
  if (context.guessedLetters.includes(req.body.user_input.toLowerCase()) && !context.correctLetters.includes(req.body.user_input.toLowerCase())) {
    context.guessesLeft++;
    req.session.guessesLeft = context.guessesLeft;
    context.duplicateErrorMsg = 'You have already chosen this letter, choose again';
    console.log(context);
  } else if (context.guessedLetters.includes(req.body.user_input.toLowerCase()) && context.correctLetters.includes(req.body.user_input.toLowerCase())) {
    context.duplicateErrorMsg = 'You have already chosen this letter, choose again';
    console.log(context);
  }

  // pushes guessed letters into guessed letters array if only one letter, and makes counter not tick for answers with more than one letter
  if (req.body.user_input.toLowerCase().length > 1) {
    context.guessesLeft++;
    req.session.guessesLeft = context.guessesLeft;
    context.duplicateErrorMsg = ' ';
  } else if (!context.guessedLetters.includes(req.body.user_input.toLowerCase())) {
    context.guessedLetters.push(req.body.user_input.toLowerCase());
    req.session.guessedLetters = context.guessedLetters;
  }

  // if there are no __ left in context.letters than game is over and you win
  if (!req.session.word.includes('__')) {
    context.endingMsg = 'You Win! Good game, want to play again?';
    req.session.endingMsg = context.endingMsg;
    console.log(context.endingMsg);
    console.log(req.session.word);
  }

  // if guesses < 1 the game is over and you lose
  if (context.guessesLeft < 1) {
    context.endingMsg = 'You lose. Want to play again?';
    req.session.endingMsg = context.endingMsg;
  }
  console.log(context);
    res.render('game', context);
});



app.listen(3000, function(){
  console.log('Successfully started express application!');
});
