 'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  LibraryTransactions = mongoose.model('LibraryTransactions'),
  config = require('meanio').loadConfig()


/**
 * Get library_transactions
 */

 exports.get_library_transactions = function(req, res){
   LibraryTransactions.find({}).populate('books').populate('usrs').skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err,transactions){
    if(err){
      res.status(400).json({'result':'Error','data':err})
    }
    else{
      LibraryTransactions.count(function(err,count){
        if(err){
          res.status(400).json({'result':'Error','data':err})
        }
        else{
          res.status(200).json({'result':'Success','data':transactions, 'count':count})
        }
      });
    }
  });
 }