'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Audio Schema
 */
var AudioSchema = new Schema({
	
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

AudioSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('ArticleAudios', AudioSchema);

