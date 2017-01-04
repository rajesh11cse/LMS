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
  
  usrId: {
    type: String,
  },

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

 /* myBooks: {
    type: Array,
    default: []
  },*/
  myBooks: [
  {
    BookId   : {type: String},
    BookName : {type: String}
  }],
  
  createdAt: {
      type: Date,
  },

  updatedAt: {
      type: Date
  },

});


var Usrs = mongoose.model('Usrs', UsrsSchema);

UsrsSchema.pre('save', function(next){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth()+1;
    if(month <= 9){
      month = 0+month.toString();
    }

    var day = now.getDate();
      if(day <= 9){
      day = 0+day.toString();
    }

    this.updateAt = now;
    if(!this.createdAt){
      this.createdAt = now;
    }
    var doc = this;
    Usrs.findOne({}).sort({ 'createdAt' : -1 }).limit(1).exec(function(error, latestUser)   {
        if(error) return next(error);
        if(latestUser != null && latestUser != undefined && latestUser.usrId != '' && latestUser.usrId != undefined){
          var lastDate = latestUser.createdAt
          var lyear = lastDate.getFullYear();
      
          var lmonth = lastDate.getMonth()+1;

          if(lmonth <= 9){
            lmonth = 0+lmonth.toString();
          }

          var lday = lastDate.getDate();
            if(lday <= 9){
            lday = 0+lday.toString();
          }
          if(year.toString() + month.toString() +day.toString() == lyear.toString() + lmonth.toString() +lday.toString()){
            var currentUserId = latestUser.usrId.substr(11, 12)
           
           if(parseInt(currentUserId) < 9){
              var increasedCount = parseInt(currentUserId)+1;
              currentUserId = '00'+increasedCount;
            }else if(parseInt(currentUserId) < 99){
              var increasedCount = parseInt(currentUserId)+1;
              currentUserId = '0'+increasedCount;
            }

            var currentLastId = currentUserId;
            doc.usrId = "UID"+year.toString() + month.toString() +day.toString()+currentLastId;
          }else{
            doc.usrId = "UID"+year.toString() + month.toString() +day.toString()+'001';
          }
        }else{
          doc.usrId = "UID"+year.toString() + month.toString() +day.toString()+'001';
        }
        next();
    });
    //next();
});