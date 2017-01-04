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

  Books.findOne(query).populate('images').exec(function(err, books){
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
        async.parallel([
          function(callback){
            console.log("qnty -- "+books.quantity);
            Books.findByIdAndUpdate(books._id, {$set:{quantity : books.quantity-1}}, function(err, updateBook){
              if(err) {
                // Error handling
                callback(true, err);
                console.log("error -- "+err);
              }else{
            console.log("updatedbook -- "+updateBook);

                // callback on success
                callback(false, updateBook);
              }
            });
          },
          function(callback){
            console.log("book -- "+books.bookId);
            Usrs.findByIdAndUpdate(req.body.user_id, {$push:{myBooks: {BookId : books.bookId, BookName : books.bookId}}}, function(err, updateUser){
              if(err) {
                // Error handling
                callback(true, err);
              }else{
                console.log("user -- "+updateUser);
                callback(false, updateUser);
              }
            });
          },
          function(callback){
            var libraryTransaction = new LibraryTransactions();
            libraryTransaction.usr = req.body.user_id,
            libraryTransaction.books = books._id,
            libraryTransaction.dueDate = req.body.dueDate,
            libraryTransaction.transationType = 'issue'
            /*otherBrand.save(function(err, otherBrands){*/
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
            res.status(200).json({result:"Succes", data : results});
          }
        });
      }
    }
  });
};



