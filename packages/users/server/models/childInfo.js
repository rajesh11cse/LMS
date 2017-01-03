'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;




  var ChildInfoSchema = new Schema({
  
  submissionDate: {
    type: Date,
    required: true
  },
  ageOfKid: {
    type: Number,
    required: true
  },
  nameOfKid: {
    type: String
  },
  createdAt:{
  	type:Date
  }
});



mongoose.model('ChildInfo', ChildInfoSchema);