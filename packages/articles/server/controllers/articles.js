'use strict';
/**
 * Module dependencies.
 */
var mongoose                  = require('mongoose'),
  fs                          = require('fs'),
  config                      = require('meanio').loadConfig(),
  Article                     = mongoose.model('Article'),
  PublishArticle              = mongoose.model('PublishArticle'),
  ArticleNotification         = mongoose.model('ArticleNotification');
var gcm                       = require('node-gcm');
var config                    = require('meanio').loadConfig();
var mongo                     = require('mongodb');
var MongoClient               = mongo.MongoClient;
var async                     = require('async');
var easyimg           = require('easyimage');
var im = require('imagemagick');

//var Grid = require('gridfs-stream');
var Grid = require('gridfs');

//create or use an existing mongodb-native database("articleGridFS" if exists else created a new database) instance
var conn = mongoose.createConnection('mongodb://localhost/articleGridFS');
Grid.mongo = mongoose.mongo;






/**
 * Get of Articles
 */
exports.getArticle = function(req, res) {
  Article.find({_id : req.body.id}).populate('images').populate('videos').populate('audios').exec(function(err, art){
    if(err){
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      Article.count(function(err, count){
        if(err){
          return res.status(400).jsonp({result:"Error", message:err});
        }else{
          res.status(200).jsonp({result:"Success", data: art, count: count});
        }
      });
    }
  });
};


/**
 * Callback functions to get articles
 */
function getArticles(res, limit, pageNumber){
  // without waiting until the previous function has completed
  // first argument to a callback is usually used to indicate an error or success.
  // if first argumant is 'true' it indicates an error If an error occurred, it will be returned by the first err argument
  // else success for 'null' or 'false'
  // More more detail : https://caolan.github.io/async/docs.html#parallel
  async.parallel([
    function(callback){
      // find each Article 
      // Get images, videos, audios collections using populate.
      // see http://mongoosejs.com/docs/queries.html
      Article.find({}).populate('images').populate('videos').populate('audios').skip(pageNumber > 0 ? ((pageNumber-1)*limit): 0).limit(limit).sort({'createdAt':-1}).exec(function(err, art){
        if(err){
          return res.status(400).jsonp({result:"Error", message:err});
        }else{
          var desc = [];
          async.eachSeries(art, function(data, callback){
            //Regular exp. to remove html tags
            var regex = /<[^>]+>/gm;
            var finalResult = data.description.replace(regex, "");
            data = data.toObject();
            data['artDescription'] = finalResult;
            desc.push(data);
            callback();
          }, function (err) {   
            if (err){
              // Error handling
              callback(true, err);
            }else{
                // success callback
                callback(false, desc);
            }
          });
        }
      });
    },

    function(callback){
      // Get total count of articles.
      Article.count(function(err, count){
        if(err){
          ///return res.status(400).jsonp({result:"Error", message:err});
          // Error handling
          callback(true, err);
        }else{
          //res.status(200).jsonp({result:"Success", data: art, count: count});
          // success callback
          callback(false, count);
        }
      });
    },
  ],
  function(err, result){
    if(err){
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: result});
    }
  });
}


/**
 * Get of Articles for Admin
 */
exports.getArticleForAdmin = function(req, res) {
  // assert can be used to check on all (req.body, req.params 
  // (URL params) and req.query (GET params)) type of params.
  req.assert('limit', 'pageNumber', 'You must enter a limit').notEmpty().isInt();// Validate limit
  req.assert('pageNumber', 'You must enter a page number').notEmpty().isInt();// Validate pageNumber

  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {
    // Display an error for 'limit' to user
    if(errors[0].param === 'limit'){
      return res.status(400).send({result:"Error", message: errors[0].msg }); // error : You must enter a limit

      // Display an error for 'pageNumber' to user
    }else if(errors[0].param === 'pageNumber'){
      return res.status(400).send({result:"Error", message: errors[0].msg }); // error : You must enter a page number 
    }
  }

  // Call a function to get articles
  getArticles(res, req.body.limit, req.body.pageNumber);
};

/**
 * Get Articles
 */
exports.getPublishedArticle = function(req, res) { 
  req.assert('accountType', 'You must enter a account type').notEmpty();// Validate account type
  req.assert('limit', 'You must enter a limit').notEmpty();// Validate limit
  req.assert('pageNumber', 'You must enter a page number').notEmpty();// Validate pageNumber
  
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {
    // Display an error for 'accountType' to user
    if(errors[0].param === 'accountType'){
      return res.status(400).send({result:"Error", message: errors[0].msg });// error : You must enter a account type

    // Display an error for 'limit' to user 
    }else if(errors[0].param === 'limit'){
      return res.status(400).send({result:"Error", message: errors[0].msg });// error : You must enter a limit 

    // Display an error for 'pageNumber' to user
    }else if(errors[0].param === 'pageNumber'){
      return res.status(400).send({result:"Error", message: errors[0].msg }); // error : You must enter a page number
    }
  }
  // find each PublishArticle with a user type matching 'all' and 
  // dynamically get user type by req.body.accountType from client.
  PublishArticle.find({$or : [{userType : req.body.accountType}, {userType : 'all'}]}).skip(req.body.pageNumber > 0 ? ((req.body.pageNumber-1)*req.body.limit): 0).limit(req.body.limit).sort({'createdAt':-1}).exec(function(err, publishedArts){
    if(err){
      return res.status(400).jsonp({result:"Error", message:err});// error handling
    }else{
      // if no error is occured in PublishArticle, carry on
      res.status(200).jsonp({result:"Success", data: publishedArts});
    }
  });
};

/**
 * Get notifications
 */
exports.getNotifications = function(req, res) {
  // find each ArticleNotification. 
  ArticleNotification.find({}, function(err, notifications){
    if(err){
      return res.status(400).jsonp({result:"Error", message:err}); // error handling
    }else{
      // if no error is occured in ArticleNotification, carry on
      res.status(200).jsonp({result:"Success", data: notifications});
    }
  });
};


/**
 * Call back function to sent nofications
 */
function sendNotifications(res, reqBody, deviceToken){
  //Array of registration or device tokens where the notification will be sent.. 
  if(deviceToken.length > 0){
    // Set up the sender with your API key. 
    // see : https://www.npmjs.com/package/node-gcm
    var sender = new gcm.Sender('AIzaSyAAuVg3zQXiAZRAW7qa2lyLlncxP4kRhCs');
    // Create a message with values.
    var message = new gcm.Message({priority: 'high', contentAvailable: true, delayWhileIdle: true, timeToLive: 10 });
    // Change or as a data object (overwrites previous data object) 
    message.addData('title', config.notification.title);
    message.addData('message', reqBody.title);
    // Send it to GCM endpoint with modified request options 
    // retrying a specific number of times (4) 
    sender.send(message, { registrationTokens: deviceToken }, 4, function (err, response) {
      // Create a articleNotification , push usefull entry and save it.
      var articleNotification = new ArticleNotification();
      articleNotification.article = reqBody.id;
      articleNotification.userType = reqBody.userType;
      articleNotification.title = config.notification.title;
      articleNotification.message = config.notification.message;
      articleNotification.response = response;
      articleNotification.save();
    });
  }
}

/**
 * Get of Articles
 */
module.exports.publishArticle = function(req, res){
  req.assert('article', "Unable to recognize the selected article").notEmpty();// Validate article
  req.assert('userType', "Unable to recognize the user type.").notEmpty();// Validate userType
  req.assert('limit', 'You must enter a limit').notEmpty().isInt();// Validate account limit
  req.assert('pageNumber', 'You must enter a pageNumber').notEmpty().isInt();// Validate account pageNumber
 // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {
    // Display an error for 'article' to user
    if(errors[0].param === 'article'){
      return res.status(400).send({result:"Error", message: errors[0].msg /* error : Unable to recognize the selected article*/ });
    // Display an error for 'accountType' to user
    }else if(errors[0].param === 'userType'){
      return res.status(400).send({result:"Error", message: errors[0].msg /* error : Unable to recognize the user type.*/ });
    // Display an error for 'limit' to user
    }else if(errors[0].param === 'limit'){
      return res.status(400).send({result:"Error", message: errors[0].msg /* error : You must enter a limit */});
    // Display an error for 'pageNumber' to user
    }else if(errors[0].param === 'pageNumber'){
      return res.status(400).send({result:"Error", message: errors[0].msg /* error : You must enter a page number*/ });
    }
 }
  var publishArticle =  new PublishArticle(req.body);
  // Run the tasks collection of functions in parallel, 
  // without waiting until the previous function has completed
  // first argument to a callback is usually used to indicate an error or success.
  // if first argumant is 'true' it indicates an error If an error occurred, it will be returned by the first err argument
  // else success for 'null' or 'false'
  // More more detail : https://caolan.github.io/async/docs.html#parallel
  async.parallel([
    function(callback){
      Article.findByIdAndUpdate(req.body.article, {$set:{isPublished:true}}, function(err, art){
        if(err){
          // reach to final callback with an err
          callback(true, err);
        }else{
          // success callback
          callback(false, art);
        }
      });
    },
    function(callback){
      publishArticle.save(function(err, pubArt){
        if(err){
          // reach to final callback with an err
          callback(true, err);
        }else{
          if(req.body.image){
            var imageName = req.body.image+'-100x75.png';// ex. 57fde58607029b31205b15e4-100x75.png
            var article_query = {imageUrl : imageName};
            // find a publisheArticle by id using pubArt._id and that update imageUrl by imageName.
            PublishArticle.findByIdAndUpdate(pubArt._id, article_query, function(err, pubArt){
              if(err){
                // reach to final callback with an err
                 callback(true, err);
              }else{
                // success callback
                callback(false, pubArt);
              }
            });
          }else{
            // success callback
            callback(false, 'no image found');
          }
        }
      });
    },
    function(callback){
      // Initialize connection once
      MongoClient.connect(config.db, function(err, db) {
        // connected to the mongoDB
        if(!err) {
          
          //Query for sending notification to user according his type like individual, professional or both.
          // here 'all' refers to both.

          if(req.body.userType == 'all'){
             var query = {"deviceToken" : {$exists:true}, "accountType" : {$exists:true}}
          }else{
            var query = {"deviceToken" : {$exists:true}, "accountType" : req.body.userType}
          }
          // find authTokens collection from mongodb
          db.collection('authTokens').find(query,{"deviceToken":1,"_id":0}).toArray(function(err, deviceData) {
            if(err){
              callback(true, err);
            }else{
              var deviceTokenContainer = []
              // Store all the deivce tokens in container for the purpose of send notification.
              async.eachSeries(deviceData, function (dd, atCb) {// atCb -- deviceData callback
                deviceTokenContainer.push(dd.deviceToken);
                atCb();// atCb -- deviceData callback
              }, function (err) {
                if(!err){
                    sendNotifications(res, req.body, deviceTokenContainer);
                  // success callback
                  callback(false, deviceTokenContainer);
                } else{
                  // reach to final callback with an err
                  callback(true, err);
                }
              });
            }
          });
        }else{
          // connected to the mongoDB
          // success callback
          callback(false);
        }
      });
    },
    ],
    // Its a final callback. This will be executed after all previous 
    // callback are successfully executed or If an error occurred.
    function(err, results){
      if(err) {
        // If an error occurred. wll be handled here.
        return res.status(400).jsonp({result:"Error", message:err});
      }else{
        // call to getArticls function for further processing.
        getArticles(res, req.body.limit, req.body.pageNumber);
      }
    })
  };

/**
 * Get Articles  Image
 */
exports.getPublishedArticleImage = function(req, res){ 
  // assert can be used to check on all (req.body, req.params 
  // (URL params) and req.query (GET params)) type of params.
  req.assert('imageId', 'You must enter a image Id').notEmpty();// Validate imageId
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {
    // Display an error for 'limit' to user
    if(errors[0].param === 'imageId'){
      return res.status(400).send({result:"Error", message: errors[0].msg }); // error : You must enter a limit
    }
  }

  // connect gridfs with articleGridFS database
  var gfs = Grid(conn.db);
  var options = {filename: req.param('imageId')}; //can be done via _id as well
  gfs.exist(options, function (err, found) {
    if (err){
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      if(found){
       var readstream = gfs.createReadStream({filename: req.param('imageId')});   
       //set header as image/png mime type
          res.setHeader('Content-Type','image/png');
        //return image data to client.
       readstream.pipe(res);
      }else{
        return res.status(200).send("File does not exist.");
      }
    }
  });
};
