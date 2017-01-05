 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Books = mongoose.model('Books'),
  Usrs = mongoose.model('Usrs'),
  LibraryTransactions = mongoose.model('LibraryTransactions'),
  async  = require('async')





/**
 * Issue books
 */
module.exports.issue_book = function(req, res){
  var query = {"$or" : [{"bookId" : req.body.book_detail} , {"bookName" : req.body.book_detail}]};

  Books.findOne(query, function(err, books){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      if(!books || !books.quantity>0){//Verify if book does not exist in database and finished in library
        return res.status(400).jsonp({result:"Error", message:'BookId/Book name is invalid or Book unavailable in database'});
      }else{
        // without waiting until the previous function has completed
        // first argument to a callback is usually used to indicate an error or success.
        // if first argumant is 'true' it indicates an error If an error occurred, it will be returned by the first err argument
        // else success for 'null' or 'false'
        // More more detail : https://caolan.github.io/async/docs.html#parallel
        async.waterfall([
          function(callback){
            Usrs.find({ _id: req.body.user_id}, function(err, usr){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                //check book already issued
                async.eachSeries(usr[0].myBooks, function(data, cb){
                  if(data.BookId  === books.bookId){
                    return res.status(400).jsonp({result:"Error", message:'Book already issued by this user.'});
                    callback(true, err);
                  }
                  cb();
                }, function (err) {   
                  if (err){
                    // Error handling
                    callback(true, err);
                  }else{
                    // success callback
                    callback(false, usr);
                  }
                });
              }
            });
          },

          function(usr, callback){
            Usrs.findByIdAndUpdate(req.body.user_id, {$push:{myBooks: {BookId : books.bookId, BookName : books.bookName}}}, function(err, updateUser){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                callback(false, usr, updateUser);
              }
            });
          },
          function(usr, updateUser, callback){
            var query = {$set:{quantity : books.quantity-1, availabilityStatus : books.quantity == 1 ? false:true}}
            Books.findByIdAndUpdate(books._id, query, function(err, updateBook){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                // callback on success
                callback(false, usr, updateUser, updateBook);
              }
            });
          },
          function(usr, updateUser, updateBook, callback){
            var libraryTransaction = new LibraryTransactions();
            libraryTransaction.usr = req.body.user_id,
            libraryTransaction.books = books._id,
            libraryTransaction.dueDate = req.body.dueDate,
            libraryTransaction.transationType = 'issue'
            libraryTransaction.save(function(err, libTransation){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                // callback on success
                callback(false, libTransation);
              }
            });
          }
        ],
        function(err, results){
          if(err) {
            // If an error occurred. wll be handled here.
            return res.status(400).jsonp({result:"Error", message:results});
          }else{
            // Send response with results.
            res.status(200).json({result:"Success"});
          }
        });
      }
    }
  });
};

/**
 * Issue books
 */
module.exports.return_book = function(req, res){
  var query = {"$or" : [{"bookId" : req.body.book_detail} , {"bookName" : req.body.book_detail}]};

  Books.findOne(query, function(err, books){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      if(!books){//Verify the existstense of book in system or library
        return res.status(400).jsonp({result:"Error", message:'BookId/Book name is invalid'});
      }else{
        // without waiting until the previous function has completed
        // first argument to a callback is usually used to indicate an error or success.
        // if first argumant is 'true' it indicates an error If an error occurred, it will be returned by the first err argument
        // else success for 'null' or 'false'
        // More more detail : https://caolan.github.io/async/docs.html#parallel
        async.waterfall([
          function(callback){
            Usrs.find({ _id: req.body.user_id}, function(err, usr){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                 var checkBook = false;
                //check book already issued
                async.eachSeries(usr[0].myBooks, function(data, cb){
                  if(data.BookId === books.bookId){
                    var checkBook = true;
                    callback(false, usr);
                  }else{
                    cb();
                  }
                }, function (err) {   
                  if (err){
                    // Error handling
                    callback(true, err);
                  }else{
                    return res.status(400).jsonp({result:"Error", message:'Book already returned or not issued by this user.'});
                  }
                });
              }
            });
          },

          function(usr, callback){
            Usrs.findByIdAndUpdate(req.body.user_id, {$pull:{myBooks: {BookId : books.bookId, BookName : books.bookName}}}, function(err, updateUser){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                callback(false, usr, updateUser);
              }
            });
          },
          function(usr, updateUser, callback){
            var query = {$set:{quantity : books.quantity+1, availabilityStatus:true}}
            Books.findByIdAndUpdate(books._id, query, function(err, updateBook){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                // callback on success
                callback(false, usr, updateUser, updateBook);
              }
            });
          },
          function(usr, updateUser, updateBook, callback){
            var libraryTransaction = new LibraryTransactions();
            libraryTransaction.usr = req.body.user_id,
            libraryTransaction.books = books._id,
            libraryTransaction.dueDate = new Date,
            libraryTransaction.transationType = 'return'
            libraryTransaction.save(function(err, libTransation){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                // callback on success
                callback(false, libTransation);
              }
            });
          }
        ],
        function(err, results){
          if(err) {
            // If an error occurred. wll be handled here.
            return res.status(400).jsonp({result:"Error", message:results});
          }else{
            // Send response with results.
            res.status(200).json({result:"Success"});
          }
        });



















      }
    }
  });
};



