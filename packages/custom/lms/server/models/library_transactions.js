'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Books Schema
 */

var LibraryTransactionSchema = new Schema({

  transationId : {
    type:String
  },

  transationType : {
    type:String,
    required:true,
  },

  usr: {
    type: Schema.Types.ObjectId,
    ref: 'Usrs'
  },

  books: {
    type: Schema.Types.ObjectId,
    ref: 'Books'
  },

  dueDate: {
    type: Date,
    required: true
  },

  createdAt: {
      type: Date,
  },

  updatedAt: {
      type: Date
  },

});

var LibraryTransactions = mongoose.model('LibraryTransactions', LibraryTransactionSchema);

LibraryTransactionSchema.pre('save', function(next){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    if(month <= 9){
      month = 0+month.toString();
    }

    var day = now.getDate();
      if(day <= 9){
      day = 0+day.toString();
    }

    this.updateAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    var doc = this;
    LibraryTransactions.findOne({}).sort({ 'createdAt' : -1 }).limit(1).exec(function(error, latestTransaction)   {
        if(error) return next(error);
        if(latestTransaction != null && latestTransaction != undefined && latestTransaction.transationId != '' && latestTransaction.transationId != undefined){
          var lastDate = latestTransaction.createdAt
          var lyear = lastDate.getFullYear();
      
          var lmonth = lastDate.getMonth()+1;

          if(lmonth <= 9){
            lmonth = 0+lmonth.toString();
          }

          var lday = lastDate.getDate();
            if(lday <= 9){
            lday = 0+lday.toString();
          }
          if(year.toString() + month.toString() +day.toString() == lyear.toString() + lmonth.toString() +lday.toString()){
            var currentUserId = latestTransaction.transationId.substr(11, 12)
            console.log(currentUserId);
           
           if(parseInt(currentUserId) < 9){
              var increasedCount = parseInt(currentUserId)+1;
              console.log(increasedCount);
              currentUserId = '00'+increasedCount;
            }else if(parseInt(currentUserId) < 99){
              var increasedCount = parseInt(currentUserId)+1;
              currentUserId = '0'+increasedCount;
            }

            var currentLastId = currentUserId;
            doc.transationId = "TID"+year.toString() + month.toString() +day.toString()+currentLastId;
          }else{
            doc.transationId = "TID"+year.toString() + month.toString() +day.toString()+'001';
          }
        }else{
          doc.transationId = "TID"+year.toString() + month.toString() +day.toString()+'001';
        }
        next();
    });
    //next();
});
