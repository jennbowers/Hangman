module.exports = {
  renderLogin: function(req, res) {
    res.render('login', {});
  }
  , postLogin: function(req, res) {
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
  }
};
