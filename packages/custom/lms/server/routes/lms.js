(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (Lms, app, auth, database) {

    var manage_books = require('../controllers/manage_books');
    var manage_usrs = require('../controllers/manage_users');
    var issue_return_books = require('../controllers/issue_return_books');
    var library_transactions = require('../controllers/library_transactions')

    app.get('/api/lms/example/anyone', function (req, res, next) {
      res.send('Anyone can access this');
    });

    app.get('/api/lms/example/auth', auth.requiresLogin, function (req, res, next) {
      res.send('Only authenticated users can access this');
    });

    app.get('/api/lms/example/admin', auth.requiresAdmin, function (req, res, next) {
      res.send('Only users with Admin role can access this');
    });

    // API for add users
    app.route('/api/lms/add_usrs')
      .post(manage_usrs.add_usrs);

    // API for get users
    app.route('/api/lms/get_usrs')
      .post(manage_usrs.get_usrs);

    // API for remove users
    app.route('/api/lms/remove_usr')
      .delete(manage_usrs.remove_usrsss);

    // API for add books
    app.route('/api/lms/add_books')
      .post(manage_books.add_books);

    // API for get books
    app.route('/api/lms/get_books')
      .post(manage_books.get_books);

    // API for remove books
    app.route('/api/lms/remove_book')
      .delete(manage_books.remove_book);

     // API for search user
    app.route('/api/lms/search_user')
      .get(manage_usrs.search_usr);

    // API for issue books
    app.route('/api/lms/issue_book')
      .post(issue_return_books.issue_book);

    // API for return books
    app.route('/api/lms/return_book')
      .post(issue_return_books.return_book);

    // API for get_library_transactions
    app.route('/api/lms/get_library_transactions')
      .post(library_transactions.get_library_transactions);

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
