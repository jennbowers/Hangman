const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');

const app = express();

// view engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//setting up paths
app.use(express.static(path.join(__dirname, 'public')));

// session set up
app.use(session({
  secret: 'unicorn cats',
  resave: false,
  saveUninitialized: true
}));

// requests
app.get('/', function(req, res) {
  res.send('Hi! I work');
});

app.get('/login', function(req, res) {
  res.render('login', {});
});

app.get('/game', function(req, res) {
  res.render('game', {});
});




app.listen(3000, function(){
  console.log('Successfully started express application!');
});
