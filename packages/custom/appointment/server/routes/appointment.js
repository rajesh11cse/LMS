(function () {
  'use strict';

  /* jshint -W098 */
  // The Package is past automatically as first parameter
  module.exports = function (Appointment, app, auth, database) {

    app.get('/api/appointment/example/anyone', function (req, res, next) {
      res.send('Anyone can access this');
    });

    app.get('/api/appointment/example/auth', auth.requiresLogin, function (req, res, next) {
      res.send('Only authenticated users can access this');
    });

    app.get('/api/appointment/example/admin', auth.requiresAdmin, function (req, res, next) {
      res.send('Only users with Admin role can access this');
    });

    app.get('/api/appointment/example/render', function (req, res, next) {
      Appointment.render('index', {
        package: 'appointment'
      }, function (err, html) {
        //Rendering a view from the Package server/views
        res.send(html);
      });
    });
  };
})();
