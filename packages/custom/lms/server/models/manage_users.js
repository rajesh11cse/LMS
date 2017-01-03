'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Usrs Schema
 */

var UsrsSchema = new Schema({
  
  usrName: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },
  
  email: {
    type : String,
    default : true
  },
  
  contactNumber : {
    type : String,
    required: true,
  },

  createdAt: {
      type: Date,
  },

  updatedAt: {
      type: Date
  },

});

UsrsSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});


mongoose.model('Usrs', UsrsSchema);
