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

BooksSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});


mongoose.model('Books', BooksSchema);
