'use strict';

// User routes use users controller
var users = require('../controllers/users'),//remove
//var books = require('../controllers/books'),
    config = require('meanio').loadConfig();

module.exports = function(MeanUser, app, auth, database, passport) {

  app.route('/logout')
    .get(users.signout);
    
  app.route('/users/me')
    .get(users.me);

  // Setting up the users api
  app.route('/createUser')//remove
    .post(users.createUser);

    // Setting up the users api
  //app.route('/add_books')//remove
    //.post(books.add_books);


  // Setting up the userId param
  app.param('userId', users.user);

  // AngularJS route to check for authentication
  app.route('/loggedin')
    .get(function(req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });

  app.route('/login')
   .post(function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (user){
        res.status(200).json({'result':'Success','data':user})
      }
      if (info){ 
        res.status(400).send({result:"Error", message: info.message });
      }
      if (err){
        res.status(500).send({result:"Error", message: err});
      }
    })(req, res, next);
  });

  app.route('/updateUserToken')
    .put(users.updateUserToken);

  app.route('/activateUser')
    .put(users.activateUser);  

  app.route('/deactivateUser')
  .put(users.deactivateUser);  

  app.route('/getUsers')
    .post(users.getUsers);//remove

   // app.route('/get_books')
    //.post(books.get_books);

  app.route('/removeUser')//remove
    .delete(users.removeUser);

  //  app.route('/remove_book')
    //.delete(books.remove_book);

  app.route('/forgotPassword')
    .post(users.forgotPassword);

  app.route('/resetPassword')
    .post(users.resetPassword);

  // AngularJS route to get config of social buttons
  app.route('/get-config')
    .get(function (req, res) {
      res.send(config);
    });

  // Setting the facebook oauth routes
  app.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the github oauth routes
  app.route('/auth/github')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the twitter oauth routes
  app.route('/auth/twitter')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.signin);

  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the google oauth routes
  app.route('/auth/google')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);

  app.route('/auth/google/callback')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the linkedin oauth routes
  app.route('/auth/linkedin')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login',
      scope: ['r_emailaddress']
    }), users.signin);

  app.route('/auth/linkedin/callback')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login'
    }), users.authCallback);

};
