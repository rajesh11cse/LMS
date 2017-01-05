 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template');



User.count(function (err, count) {
    if (count===0){
        createSuperadmin();
    }
});

var createSuperadmin = function(){
    var user = new User({
               "phoneNumber" : "8888888888",
               "email" : "superadmin@lms.com",
               "password" : "superadmin", 
               "title" : "Mr.", 
               "name" : "Super Admin",
               "username" : "superadmin",
               "roles" : [ "authenticated","" ],
               "type" : "superadmin",
               "isActive" : true
               });

    user.save(function(err, user) {
        if(err) return console.log(err);
        else console.log("New superadmin - %s %s",user.email,user.password);
    });

}


/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
  res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
  res.redirect('/');
};

/**
 * Create user
 */
exports.createUser = function(req, res) {
  req.assert('title', 'You must select a title').notEmpty(); // Validate title
  req.assert('name', 'You must enter a name').notEmpty(); // Validate name
  req.assert('username', 'You must enter a username').notEmpty(); // Validate username
  req.assert('phoneNumber', 'You must enter a valid phone number').isNumeric(req.body.phoneNumber).len(10, 10); // Validate phone number
  req.assert('email', 'You must enter a valid email address').isEmail(); // Validate address
  req.assert('type', 'You must select a user type').notEmpty(); // Validate type
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20); // Validate password
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password); // Validate confirmPassword

  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'title'){
      // Display an error for 'name' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'name'){
      // Display an error for 'description' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'username'){
      // Display an error for 'username' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'phoneNumber'){
      // Display an error for 'phoneNumber' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'email'){
      // Display an error for 'email' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'type'){
      // Display an error for 'type' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'password'){
      // Display an error for 'password' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'confirmPassword'){
      // Display an error for 'confirmPassword' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }
  }

  var user = new User(req.body);
  user.save(function(err, user){
    if(err){
      // if error is occured, handle error
      res.status(400).json({'result':'Error','data':err})
    }else{
      User.find({}).skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err,users){
        if(err){
          // if error is occured, handle error
          res.status(400).json({'result':'Error','data':err})
        }
        else{
          // if no error is occured, carry on
          res.status(200).json({'result':'Success','data':users})
        }
      });
    }
  })


};
/**
 * Send User
 */
exports.me = function(req, res) {
  res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
  User
    .findOne({
      _id: id
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (!user) return next(new Error('Failed to load User ' + id));
      req.profile = user;
      next();
    });
};

/**
 * Find user
 */

 function getUsers(req, res){
   User.find({}).where('type').in(['editor', 'customer']).skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err,users){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }
    else{
      User.where('type').in(['editor', 'customer']).count(function(err,count){
        if(err){
          res.status(400).json({'result':'Error','data':err})
        }
        else{
          res.status(200).json({'result':'Success','data':users, 'count':count})
        }
      });
    }
  });
 }

exports.getUsers=function(req,res){
  getUsers(req,res);
}

/**
 * Update user token
 */
exports.updateUserToken=function(req,res){ 
  User.findByIdAndUpdate(req.body.id, {$set:{userToken : req.body.userToken}}).exec(function(err,users){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      getUsers(req,res);
    }
  });
}

/**
 * Remove/Delete user
 */
exports.removeUser = function(req,res){ 
  User.findOneAndRemove(req.body.id, function(err,users){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      getUsers(req,res);
    }
  });
}


/**
 * Activate user
 */
exports.activateUser=function(req,res){ 

  User.findByIdAndUpdate(req.body.id, {$set:{isActive : true}}).exec(function(err,users){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      getUsers(req,res);
    }
  });
}

/**
 * Deactivate user
 */
exports.deactivateUser=function(req,res){ 

  User.findByIdAndUpdate(req.body.id, {$set:{isActive : false}}).exec(function(err,users){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      getUsers(req,res);
    }
  });
}

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (err) {
      return res.status(400).json({
        msg: err
      });
    }
    if (!user) {
      return res.status(400).json({
        msg: 'Token invalid or expired'
      });
    }
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
      return res.status(400).send(errors);
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.send({
          user: user,
        });
      });
    });
  });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
  var transport = nodemailer.createTransport(config.mailer);
  transport.sendMail(mailOptions, function(err, response) {
    if (err) return err;
    return response;
  });
}

/**
 * Forgot password
 */
exports.forgotPassword = function(req, res) {
  req.assert('text', 'You must enter a email/username').notEmpty(); // Validate email/username
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'text'){
      // Display an error for 'text' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }
  }
  User.findOne({$or: [{email: req.body.text }, {username: req.body.text }] }, function(err, user){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }else{
      res.status(200).json({'result':'Success', 'data':user ? user._id : null})
    }
  });
}

/**
 * Reset password
 */
exports.resetPassword = function(req, res) {
  req.assert('password', 'Password must be between 8-20 characters long').len(8, 20); // Validate password
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password); // Validate confirmPassword
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'password'){
      // Display an error for 'password' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'confirmPassword'){
      // Display an error for 'confirmPassword' to user
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }
  }

  User.findOne({_id : req.body._id}, function(err, user){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }else{
      user.password = req.body.password;
      user.save(function(err, resetuser){
        if(err){
          res.status(400).json({'result':'Error','data':err})
        }else{
           req.logIn(user, function(err) {
            if(err){
              res.status(400).json({'result':'Error','data':err})
            }else{
              res.status(200).json({'result':'Success'});
            }
          });
        }
      });
    }
  });
}
