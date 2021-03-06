'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Books Schema
 */

var BooksSchema = new Schema({
  bookId: {
    type: String,
  },

  bookName: {
    type: String,
    required: true
  },

  authorName: {
    type: String,
    required: true
  },
  
  availabilityStatus: {
    type : Boolean,
    default : true
  },
  
  quantity : {
    type : Number,
    required: true,
    default : 0
  },

  createdAt: {
      type: Date,
  },

  updatedAt: {
      type: Date
  },

});

var Books = mongoose.model('Books', BooksSchema);

BooksSchema.pre('save', function(next){
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
    Books.findOne({}).sort({ 'createdAt' : -1 }).limit(1).exec(function(error, latestBook)   {
        if(error) return next(error);
        if(latestBook != null && latestBook != undefined && latestBook.bookId != '' && latestBook.bookId != undefined){
          var lastDate = latestBook.createdAt
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
            var currentUserId = latestBook.bookId.substr(11, 12)
           
           
           if(parseInt(currentUserId) < 9){
              var increasedCount = parseInt(currentUserId)+1;
              
              currentUserId = '00'+increasedCount;
            }else if(parseInt(currentUserId) < 99){
              var increasedCount = parseInt(currentUserId)+1;
              currentUserId = '0'+increasedCount;
            }

            var currentLastId = currentUserId;
            doc.bookId = "BID"+year.toString() + month.toString() +day.toString()+currentLastId;
          }else{
            doc.bookId = "BID"+year.toString() + month.toString() +day.toString()+'001';
          }
        }else{
          doc.bookId = "BID"+year.toString() + month.toString() +day.toString()+'001';
        }
        next();
    });
    //next();
});
