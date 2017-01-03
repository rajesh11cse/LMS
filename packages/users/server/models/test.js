'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;




  var TestSchema = new Schema({
  
  submissionDate: {
    type: Date,
    required: true
  }
});



mongoose.model('Test', TestSchema);