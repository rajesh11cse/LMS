'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Video Schema
 */
var VideoSchema = new Schema({
	
	authorName: {
	    type: String
	},

	mimeType: {
	    type: String,
	    required: true
	},

	title: {
	    type: String,
	    required: true
	},

	sortDescription: {
	    type: String,
        required: true
    },

	sourceURL: {
	    type: String,
	    required: true,
	},
	
	cloudURL: {
	    type: String,
	    default:null
	},

	publishedDate: {
	    type: Date
	},

	createdAt: {
	    type: Date
	},

	updatedAt: {
	    type: Date
	}
});

VideoSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('ArticleVideos', VideoSchema);

