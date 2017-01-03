 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Usrs = mongoose.model('Usrs'),
  config = require('meanio').loadConfig()



/**
 * Get usrs
 */

 function get_usrs(req, res){
   Usrs.find({}).skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err,usrs){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }
    else{
      Usrs.count(function(err,count){
        if(err){
          res.status(400).json({'result':'Error','data':err})
        }
        else{
          res.status(200).json({'result':'Success','data':usrs, 'count':count})
        }
      });
    }
  });
 }

exports.get_usrs=function(req,res){
  get_usrs(req,res);
}


/**
 * Add usr
 */
exports.add_usrs = function(req, res) {
  req.assert('usrName', 'You must select a usr name').notEmpty(); // Validate usr name
  req.assert('name', 'You must select a name').notEmpty(); // Validate usr name
  req.assert('email', 'You must enter a email').notEmpty(); // Validate email
  req.assert('contactNumber', 'You must enter a mobile number').notEmpty(); // Validate mobile no.
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'usrName'){
      // Display an error for usrName
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'name'){
      // Display an error for name
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'email'){
      // Display an error for email
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'contactNumber'){
      // Display an error for mobileNumber
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }
  }
  var usrs = new Usrs(req.body);
  usrs.save(function(err, usr){
    if(err){
      // if error is occured, handle error
      res.status(400).json({'result':'Error','data':err})
    }else{
      get_usrs(req,res);
    }
  })
};

/**
 * Remove/Delete usr
 */
exports.remove_usrsss = function(req,res){ 
  Usrs.findOneAndRemove(req.body.id, function(err,usrs){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      get_usrs(req,res);
    }
  });
}


/**
 * Search user by name or mobile number
 */
exports.search_usr = function(req,res){ 
   // recover parameters
  var param1=req.param('userName')
  var param2=req.param('mobileNumber')
  var regex = new RegExp("^(.*)"+(param1 != undefined && param1 != '' ? param1 : param2)+"(.*$)","ig");
  var query = {"$or" : [{"usrName" : regex} , {"contactNumber" : regex}]};
  Usrs.find(query, function(err,usrs){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      res.status(200).json({result:'Success', data:usrs})
    }
  });
}



