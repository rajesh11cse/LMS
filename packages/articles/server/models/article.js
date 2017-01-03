'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({

  authorName: {
    type: String,
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  sourceURL: {
    type: String,
    default:null
  },

  images: {
      type: Schema.Types.ObjectId,
      ref: 'ArticleImages',
      default : null
  },
  videos: {
      type: Schema.Types.ObjectId,
      ref: 'ArticleVideos',
      default : null
  },
  audios: {
      type: Schema.Types.ObjectId,
      ref: 'ArticleAudios',
      default : null
  },
  references: {
      type: Array,
      default : null
  },

  status: {//InProgress, Completed, Approved, Publish.
    type: String,
    required: true,
    default : 'In Progress'
  },

  userType: {
      type: String
  },

  newsPublishDate: {
      type: Date
  },

  completedDate: {
      type: Date
  },

  approvalDate: {
      type: Date
  },

  isPublished: {
      type: Boolean,
      default: false
  },

  publishedDate: {
      type: Date
  },

  createdAt: {
      type: Date,
  },

  updatedAt: {
      type: Date
  }
});

ArticleSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('Article', ArticleSchema);
