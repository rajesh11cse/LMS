(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (Lms, app, auth, database) {

    var manage_books = require('../controllers/manage_books')

    app.get('/api/lms/example/anyone', function (req, res, next) {
      res.send('Anyone can access this');
    });

    app.get('/api/lms/example/auth', auth.requiresLogin, function (req, res, next) {
      res.send('Only authenticated users can access this');
    });

    app.get('/api/lms/example/admin', auth.requiresAdmin, function (req, res, next) {
      res.send('Only users with Admin role can access this');
    });

  // Setting up the users api
    app.route('/api/lms/add_books')
      .post(manage_books.add_books);

    app.route('/api/lms/get_books')
      .post(manage_books.get_books);

    app.route('/api/lms/remove_book')
    .delete(manage_books.remove_book);

    app.get('/api/lms/example/render', function (req, res, next) {
      Lms.render('index', {
        package: 'lms'
      }, function (err, html) {
        //Rendering a view from the Package server/views
        res.send(html);
      });
    });
  };
})();
