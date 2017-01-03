'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * ArticleNotification Schema
 */
var ArticleNotificationSchema = new Schema({

  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article'
  },

  userType: {
    type: String,
    required: true
  },

  title: {
    type: String,
  },

  message: {
    type: String,
  },

  response: {
      type: Schema.Types.Mixed
  },

  createdAt: {
      type: Date,
  }
});

ArticleNotificationSchema.pre('save', function(next){
    var now = new Date();
    this.createdAt = now;
    next();
});

mongoose.model('ArticleNotification', ArticleNotificationSchema);
