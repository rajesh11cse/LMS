 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Books = mongoose.model('Books'),
  config = require('meanio').loadConfig()



/**
 * Get books
 */

 function get_books(req, res){
   Books.find({}).skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err,users){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }
    else{
      Books.count(function(err,count){
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

exports.get_books=function(req,res){
  get_books(req,res);
}


/**
 * Add book
 */
exports.add_books = function(req, res) {
  req.assert('bookName', 'You must select a book name').notEmpty(); // Validate book name
  req.assert('authorName', 'You must enter a author name').notEmpty(); // Validate author name
  req.assert('quantity', 'You must enter a quantity').notEmpty(); // Validate quantity
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'bookName'){
      // Display an error for bookName
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'authorName'){
      // Display an error for authorName
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }else if(errors[0].param === 'quantity'){
      // Display an error for quantity
      return res.status(400).send({result:"Error", message: errors[0].msg });
    }
  }
  var books = new Books(req.body);
  books.save(function(err, book){
    if(err){
      // if error is occured, handle error
      res.status(400).json({'result':'Error','data':err})
    }else{
      get_books(req,res);
    }
  })
};

/**
 * Remove/Delete book
 */
exports.remove_book = function(req,res){ 
  Books.findOneAndRemove(req.body.id, function(err,users){
    if(err){
      res.status(400).json({result:'Error', data:err})
    }
    else{
      get_books(req,res);
    }
  });
}



