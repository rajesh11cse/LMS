'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Reference Schema
 */
var ReferenceSchema = new Schema({
	
	authorName: {
	    type: String,
	},

	sourceURL: {
	    type: String,
	    required:true
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

ReferenceSchema.pre('save', function(next){
    var now = new Date();
    this.updatedAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    next();
});

mongoose.model('ArticleReferences', ReferenceSchema);
