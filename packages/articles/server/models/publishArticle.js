'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Audio Schema
 */
var PublishArticleSchema = new Schema({
	
	article: {
      	type: Schema.Types.ObjectId,
      	ref: 'Article'
    },

    userType: {          //All, individual, professional
	    type: String
	},

	title: {         
	    type: String
	},

	description: {      
	    type: String
	},

	authorName: {         
	    type: String
	},

	imageUrl : {
		type: String
	},

    debunked: {          //Invalid - Send notication
	    type: Boolean
	},    

	debunkedReason: {
	    type: String
	},    

	debunkedDate: {
	    type: Date
	},    

	debunkedAuthor: {
	    type: String
	},
    
	debunkedAuthorArticle: {
	    type: Schema.Types.ObjectId,
      	ref: 'Article'
	},

	createdAt: {
	    type: Date
	},

	updatedAt: {
	    type: Date
	}
});

PublishArticleSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('PublishArticle', PublishArticleSchema);

