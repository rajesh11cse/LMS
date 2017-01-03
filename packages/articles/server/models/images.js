'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Image Schema
 */
var ImageSchema = new Schema({

	authorName: {
	    type: String
	},

	mimeType: {
	    type: String,
	    required: true,
	    default: 'image/jpeg'
	},

	title: {
	    type: String,
	    required: true
	},

	name: {
	    type: String
	},

	data: {
    	type: String
	},

	articleImageUrl: {
      type: String
    },

    largeImageUrl: {
      type: String
    },

	mediumImageUrl: {
      type: String
    },

	smallImageUrl: {
      type: String
    },

    articleImageUrlMedium: {
      type: String
    },

    articleImageUrlLarge: {
      type: String
    },

	sourceURL: {
	    type: String
	},

	cloudURL: {
	    type: String
	},

	publishedDate: {
	    type: Date,
	},

	createdAt: {
	    type: Date
	},

	updatedAt: {
	    type: Date
	}
});


ImageSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('ArticleImages', ImageSchema);


