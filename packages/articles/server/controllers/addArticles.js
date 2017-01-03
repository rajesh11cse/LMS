'use strict';
/**
 * Module dependencies.
 */
var mongoose        = require('mongoose'),
  config            = require('meanio').loadConfig(),
  Article           = mongoose.model('Article'),
  ArticleImages     = mongoose.model('ArticleImages'),
  ArticleAudios     = mongoose.model('ArticleAudios'),
  ArticleVideos     = mongoose.model('ArticleVideos'),
  ArticleReferences = mongoose.model('ArticleReferences'),
  mongo             = require('mongodb'),
  fs                = require('fs'),
  mv                = require('mv'),
  async             = require('async'),
  easyimg           = require('easyimage'),
  _                 = require('lodash');
  var Grid          = require('gridfs-stream');

//create or use an existing mongodb-native database("articleGridFS" if exists else created a new database) instance
var conn = mongoose.createConnection('mongodb://localhost/articleGridFS');
Grid.mongo = mongoose.mongo;



/**
 * Create an article
 */
module.exports.createArticle = function(req, res){ 
  req.assert('title', 'You must enter a title').notEmpty(); // Validate title
  req.assert('description', 'You must enter a description').notEmpty(); // Validate title
  
  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'title'){
      // Display an error for 'name' to user
      return res.status(400).send({result:"Error", message: 'You must enter a title' /* error : You must enter a title*/ });
    }else if(errors[0].param === 'description'){
      // Display an error for 'description' to user
      return res.status(400).send({result:"Error", message: 'You must enter a description' /* error : You must enter a description*/ });
    }
  }

  var article = new Article(req.body);
    article.save(function(err, artcl){
      // If an error occurred, handle it. leave all callbacks and reach to final callback.
      if (err){
        // If an error occurred. wll be handled here.
        return res.status(400).jsonp({result:"Error", message:err});
      }else{
        // if no error is occured in aricle, carry on
        res.status(200).jsonp({result:"Success", data: artcl});
      }
    });
};

/**
 * Delete an article
 */
module.exports.editArticle = function(req, res){
  req.assert('title', 'You must enter a title').notEmpty(); // Validate title
  req.assert('description', 'You must enter a description').notEmpty();// Validate description

  // It fills an array object if errors exist:
  var errors = req.validationErrors();
  if (errors) {//If errors were found. Return a validation error!
    if(errors[0].param === 'title'){
      // Display an error for 'name' to user
      return res.status(400).send({result:"Error", message: 'You must enter a title' /* error : You must enter a title*/ });
    }else if(errors[0].param === 'description'){
      // Display an error for 'description' to user
      return res.status(400).send({result:"Error", message: 'You must enter a description' /* error : You must enter a description*/ });
    }
  }
  async.parallel([
    function(callback){
      var article_query = {
        title         : req.body.title, 
        status        : req.body.status ? req.body.status:'In Progress',
        description   : req.body.description
      }
      if(req.body.sourceURL){article_query['sourceURL']=req.body.sourceURL;}
      if(req.body.authorName){article_query['authorName']=req.body.authorName;}
      if(req.body.publishedDate){article_query['publishedDate']= req.body.publishedDate;}
      if(req.body.images){article_query['images']= req.body.images;}// Check image existence
      if(req.body.videos){article_query['videos']= req.body.videos;}// Check video existence
      if(req.body.audios){article_query['audios']= req.body.audios;}// Check audio existence
      if(req.body.references){article_query['references']= req.body.references;}// Check reference existence
      Article.findByIdAndUpdate(req.body.id, article_query, function(err, updateArt){
        if(err) {
          callback(true, err);
        }else{
          callback(false, updateArt);
        }
      });
    },
  ],
  function(err, results){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:results});
    }else{
      res.status(200).jsonp({result:"Success", data: results});
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
 * Callback function to remove full article.
 */
function removeArticleNow(res, artObjectId, pageNumber, limit){
  Article.findOneAndRemove({_id : artObjectId}, function(err, removedArt){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      getArticles(res, limit, pageNumber);
    }
  });
}


/**
 * Callback function to remove article image
 */
function removeArticleImage(tempPath, callback){
  async.eachSeries(tempPath, function (data, removeCb) {
    var rootPath     = config.root+'/packages/'+data.substr(0, 6) + "/public";
    var image = rootPath + data.substr(6);
    fs.exists(image, function(exists) {
      if(exists){
        fs.unlink(image, function (err) {
          if(err){
            callback(true, 'Unable to delete image file from folder');
          }else{
           removeCb();
          } 
        });
      }else {
        callback(false, 'Image does not exist in folder.'); 
      }
    });
  }, function (err) {   
    if (err){
      callback(true, err);
    } else{
      callback(null);
     }
  });
}

/**
 * Delete an article
 */
module.exports.removeArticle = function(req, res){
  Article.findOne({_id : req.body.id}).populate('images').exec(function(err, removeArts){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      async.parallel([
        function(callback){
          if(removeArts.images != null && removeArts.images.largeImageUrl != null){
            var tempPath = [];
            tempPath.push(removeArts.images.largeImageUrl);
            tempPath.push(removeArts.images.mediumImageUrl);
            tempPath.push(removeArts.images.smallImageUrl);
            removeArticleImage(tempPath, function(err, data){
              if(err){
                 callback(true, err)
              }else{
                var gfs = Grid(conn.db);
                var imagefilename = removeArts.images._id+'-100x75.png';
                gfs.remove({filename: imagefilename}, function (err) {
                  if (err){
                    callback(true, err)
                  }else{
                    callback(false, 'Images removed from db and folder.')
                  }
                });
              }
            });
          }else{
            callback(false, 'Image does not exist in folder.');
          }
        },

        function(callback){
          ArticleImages.findOneAndRemove({_id : removeArts.images}, function(err, removeImages){
            if(err) {
              callback(true, err);
            }else{
              callback(false, removeImages);
            }
          });
        },

        function(callback){
          ArticleAudios.findOneAndRemove({_id : removeArts.audios}, function(err, removeAudios){
            if(err) {
              callback(true, err);
            }else{
              callback(false, removeAudios);
            }
          });
        },

        function(callback){
          ArticleVideos.findOneAndRemove({_id : removeArts.videos}, function(err, removeVideos){
            if(err) {
              callback(true, err);
            }else{
              callback(false, removeVideos);
            }
          });
        },

        function(callback){
          var ids = _.pluck(removeArts.references, '_id');
          ArticleReferences.remove({_id: { $in: ids }}, function(err, removeReferences){
            if(err) {
              callback(true, err);
            }else{
              callback(false, removeReferences);
            }
          });
        },
      ],
      function(err, results){
        if(err) {
         return res.status(400).jsonp({result:"Error", message:results});
        }else{
          removeArticleNow(res, removeArts, req.body.pageNumber, req.body.limit)
        }
      });
    }
  });
};


function resizeImage(imgId, file_path, callback){
  var imageSize = [{"size":"m","width":"1024","height":"768"},
                   {"size":"m","width":"460","height":"345"},
                   {"size":"s","width":"100","height":"75"}]; 
  var images = [];
  async.eachSeries(imageSize, function (data, resizeCb) {
    easyimg.resize({
          src:file_path,
          dst:config.root+"/packages/system/public/assets/img/articles/"+imgId+"-"+data.width+"x"+data.height+".png",
          width:data.width,
          height:data.height,
    }).then(function(image) {
      images.push(image);
      resizeCb();
    });
  }, function (err) {   
    if (err){
      callback(true, err);
    } else{
      callback(false, images);
     }
  });
}

/**
 * Upload an article image
 */
module.exports.uploadArticleImage = function(req, res){
  req.assert('title', "You must enter a image's title").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a image's title" /* error : You must enter a image's title*/ });
    }
  }
  if((req.body.sourceURL == undefined) && (req.body.image_id == undefined) && (req.body.uploadNew == 'false')){
    return res.status(400).send({result:"Error", message: "You must enter a image's source URL or upload a image file"});
  }else{
    async.waterfall([
      function(callback){
        var articleImage =  new ArticleImages(req.body);
        articleImage.save(function(err, img){
          if (err){
             callback(true, err)
          }else{
            callback(false, img)
          }
        });
      }, 
      function(image, callback){
        if(req.files.file != undefined){
          var file = req.files.file;
          resizeImage(image._id, file.path, function(err, data){
            if(err){
              callback(true, err)
            }else{
              callback(false, data, image, file)
            }
          });
        }else{
          var result =[];
          result.push("Image status : Images not uploaded");
          result.push(image);
          callback(false, null, null, result)
        }
      },
      function(imageInfo, image, file, callback){
        if(imageInfo == null){callback(false, file);}
        else{ 
        //open mongodb connection once.
        // conn.once('open', function () {
          var gfs = Grid(conn.db);
          // streaming to gridfs
          //filename to store in mongodb
          var writestream = gfs.createWriteStream({
              filename: imageInfo[2].name //get last image file name from imageInfo array which is smaller image then others.
          });
          //read the image file from path where the image file is awailable.  
          var imagePath = config.root+"/packages/system/public/assets/img/articles/"+imageInfo[2].name;
          fs.createReadStream(imagePath).pipe(writestream);
       
          // close mongodb connection while doing something with file.
          // writestream.on('close', function (file) {
          // do something with `file`
          var result =[];
          result.push('Image status : Images Uploaded');
          var folderPath = 'system/assets/img/articles/';
          image.mimeType         =   file.type;
          image.name             =   file.name;
          image.largeImageUrl    =   folderPath+imageInfo[0].name;
          image.mediumImageUrl   =   folderPath+imageInfo[1].name;
          image.smallImageUrl    =   folderPath+imageInfo[2].name;
          image.save(function(err, finalImg){
            if (err){
               callback(true, err)
            }else{
              result.push(finalImg);
              callback(false, result)
            }
          });
        }
      }
    ],
    function(err, results){
      if(err) {
        return res.status(400).jsonp({result:"Error", message:results});
      }else{
        res.status(200).jsonp({result:"Success", data: results});
      }
    });
  }
};

/**
 *Edit an article image
 */
module.exports.editArticleImage = function(req, res){
  req.assert('title', "You must enter a image's title").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a image's title" // error : You must enter a image's title
        });
    }
  }
  if(req.body.uploadNew == 'false'){
    if((req.body.sourceURL == undefined || req.body.sourceURL == '')){
      return res.status(400).send({result:"Error", message: "You must enter a image's source URL or upload a image file" // error : You must enter a image's source URL or upload a image file
        });
    }
  }
  async.waterfall([
    function(callback){
      ArticleImages.findOne({_id :  req.body.image_id}, function(err, artImage){
        if (err){
          callback(true, err)
        }else{
          callback(false, artImage)
        }
      });
    }, 
    function(image, callback){
      if(req.files.file != undefined){
        var file = req.files.file;
        resizeImage(image._id, file.path, function(err, data){
          if(err){
            callback(true, err)
          }else{
            callback(false, data, image, file)
          }
        });
      }else{
        callback(false, null, image, null)
      }
    },
    function(imageInfo, image, file, callback){
      if(imageInfo == null){
        if(req.body.sourceURL  && image.largeImageUrl != undefined){
          var tempPath = [];
          tempPath.push(image.largeImageUrl);
          tempPath.push(image.mediumImageUrl);
          tempPath.push(image.smallImageUrl);
          removeArticleImage(tempPath, function(err, data){
            if(err){
              return res.status(400).jsonp({result:"Error", message:data});
            }else{
              var gfs = Grid(conn.db);
              var imagefilename = image._id+'-100x75.png';
              gfs.remove({filename: imagefilename}, function (err) {
                if (err){
                  callback(true, err)
                }else{
                  var result =[];
                  result.push("Image status : Images not uploaded");
                  image.publishedDate =   req.body.publishedDate ? req.body.publishedDate : undefined,
                  image.authorName    =   req.body.authorName ? req.body.authorName : undefined;
                  image.title         =   req.body.title;
                  image.sourceURL     =   req.body.sourceURL;
                  image.largeImageUrl =   undefined;
                  image.mediumImageUrl=   undefined;
                  image.smallImageUrl =   undefined;
                  image.save(function(err, finalImg){
                    if (err){
                       callback(true, err)
                    }else{
                      result.push(finalImg);
                      callback(false, result)
                    }
                  });
                }
              });
            }
          });
        }else{
          var result =[];
          result.push("Image status : Allready have an image");
          image.publishedDate =   req.body.publishedDate ? req.body.publishedDate : undefined,
          image.authorName    =   req.body.authorName ? req.body.authorName : undefined;
          image.title         =   req.body.title;
          image.save(function(err, finalImg){
            if (err){
               callback(true, err)
            }else{
              result.push(finalImg);
              callback(false, result)
            }
          });
        }
      }
      else{ 
        var gfs = Grid(conn.db);
        var writestream = gfs.createWriteStream({
            filename: imageInfo[2].name
        });
        var imagePath = config.root+"/packages/system/public/assets/img/articles/"+imageInfo[2].name;
        fs.createReadStream(imagePath).pipe(writestream);

        var result =[];
        result.push('Image status : Images Uploaded');
        var folderPath = 'system/assets/img/articles/';
        image.publishedDate =   req.body.publishedDate ? req.body.publishedDate : undefined,
        image.authorName    =   req.body.authorName ? req.body.authorName : undefined;
        image.title         =   req.body.title;
        image.mimeType         =   file.type;
        image.name             =   file.name;
        image.largeImageUrl    =   folderPath+imageInfo[0].name;
        image.mediumImageUrl   =   folderPath+imageInfo[1].name;
        image.smallImageUrl    =   folderPath+imageInfo[2].name;
        image.save(function(err, finalImg){
          if (err){
             callback(true, err)
          }else{
            result.push(finalImg);
            callback(false, result)
          }
        });
      }
    }
  ],
  function(err, results){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:results});
    }else{
      res.status(200).jsonp({result:"Success", data: results});
    }
  });
};

/**
 * Delete an article image
*/
module.exports.removeArticleImage = function(req, res){
  ArticleImages.findOne({_id : req.body.id}, function(err, artImages){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{  
      if(artImages != null && artImages.largeImageUrl != undefined){
        var tempPath = [];
        tempPath.push(artImages.largeImageUrl);
        tempPath.push(artImages.mediumImageUrl);
        tempPath.push(artImages.smallImageUrl);
        removeArticleImage(tempPath, function(err, data){
          if(err){
            return res.status(400).jsonp({result:"Error", message:data});
          }else{
            ArticleImages.findOneAndRemove({_id : req.body.id}, function(err, removedArtImages){
              if(err) {
                return res.status(400).jsonp({result:"Error", message:err});
              }else{
                var gfs = Grid(conn.db);
                var imagefilename = req.body.id+'-100x75.png';
                gfs.remove({filename: imagefilename}, function (err) {
                  if (err){
                   return res.status(400).jsonp({result:"Error", message:err});
                  }else{
                    res.status(200).jsonp({result:"Success", data: removedArtImages});  
                  }
                });
              }
            });
          }
        });
      }else{
        ArticleImages.findOneAndRemove({_id : req.body.id}, function(err, removedArtImages){
          if(err) {
            return res.status(400).jsonp({result:"Error", message:err});
          }else{
            res.status(200).jsonp({result:"Success", data: removedArtImages});  
          }
        });
      }
    }
  });
}

/**
 * Upload an article audio
 */
module.exports.uploadArticleAudio = function(req, res){
  req.assert('title', "You must enter a audio's title").notEmpty();
  req.assert('sourceURL', "You must enter a audio's source URL").notEmpty();
  req.assert('sortDescription', "You must enter a audio's sort description").notEmpty();
  req.assert('mimeType', "You must enter a audio's audio type").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's title" /* error : You must enter a audio's title*/ });
    }else if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's source URL" /* error : You must enter a audio's source URL*/ });
    }else if(errors[0].param === 'sortDescription'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's sort description" /* error : You must enter a audio's sort description*/ });
    }else if(errors[0].param === 'mimeType'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's audio type" /* error : You must enter a audio's audio type*/ });
    }
  }
  var artAudio = new ArticleAudios(req.body);
  artAudio.save(function(err, artAudio){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: artAudio});
    }
  });
};

/**
 *Edit an article audio
 */
module.exports.editArticleAudio = function(req, res){
  
  req.assert('title', "You must enter a audio's title").notEmpty();
  req.assert('sourceURL', "You must enter a audio's source URL").notEmpty();
  
  req.assert('mimeType', "You must enter a audio's sort audio type").notEmpty();
  req.assert('sortDescription', "You must enter a audio's sort description").notEmpty();
  req.assert('audio_id', "This audio article does not exist in database.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's title" /* error : You must enter a audio's title*/ });
    }else if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's source URL" /* error : You must enter a audio's source URL*/ });
    }else if(errors[0].param === 'mimeType'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's audio type" /* error : You must enter a audio's audio type*/ });
    }else if(errors[0].param === 'sortDescription'){
      return res.status(400).send({result:"Error", message: "You must enter a audio's sort description" /* error : You must enter a audio's sort description*/ });
    }else if(errors[0].param === 'audio_id'){
      return res.status(400).send({result:"Error", message: "This audio article does not exist in database." /* error : This audio article does not exist in database.*/ });
    }
  }

  ArticleAudios.findOne({_id :  req.body.audio_id}, function(err, artAudio){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
       $set: {
        artAudio.title            =   req.body.title,
        artAudio.authorName       =   req.body.authorName ? req.body.authorName : undefined,
        artAudio.sourceURL        =   req.body.sourceURL,
        artAudio.sortDescription  =   req.body.sortDescription,
        artAudio.mimeType         =   req.body.mimeType ,
        artAudio.publishedDate    =   req.body.publishedDate ? req.body.publishedDate : undefined,
        artAudio.cloudURL         =   req.body.cloudURL ? req.body.cloudURL : undefined
      }
      artAudio.save(function(err, updateImage){
        if (err){
          return res.status(500).jsonp({result:"Error", message:err});
        }else{
          res.status(200).jsonp({result:"Success", data: updateImage});
        }
      });
    }
  });
};

/**
 * Delete an article audio
*/
module.exports.removeArticleAudio = function(req, res){
  ArticleAudios.findOneAndRemove({_id : req.body.id}, function(err, removedArtAudios){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: removedArtAudios});  
    }
  });
}

/**
 * Upload an article video
 */
module.exports.uploadArticleVideo = function(req, res){
  req.assert('title', "You must enter a video's title").notEmpty();
  req.assert('sourceURL', "You must enter a video's source URL").notEmpty();
  req.assert('sortDescription', "You must enter a video's sort description").notEmpty();
  req.assert('mimeType', "You must enter a video's video type").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a video's title" /* error : You must enter a video's title*/ });
    }else if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a video's source URL" /* error : You must enter a video's source URL*/ });
    }else if(errors[0].param === 'sortDescription'){
      return res.status(400).send({result:"Error", message: "You must enter a video's sort description" /* error : You must enter a video's sort description*/ });
    }else if(errors[0].param === 'mimeType'){
      return res.status(400).send({result:"Error", message: "You must enter a video's video type" /* error : You must enter a video's video type*/ });
    }
  }
  var artVideo = new ArticleVideos(req.body);
  artVideo.save(function(err, artVideo){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: artVideo});
    }
  });
};

/**
 *Edit an article video
 */
module.exports.editArticleVideo = function(req, res){
  
  req.assert('title', "You must enter a video's title").notEmpty();
  req.assert('sourceURL', "You must enter a video's source URL").notEmpty();
  req.assert('mimeType', "You must enter a video's sort video type").notEmpty();
  req.assert('sortDescription', "You must enter a video's sort description").notEmpty();
  req.assert('video_id', "This video article does not exist in database.").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'title'){
      return res.status(400).send({result:"Error", message: "You must enter a video's title" /* error : You must enter a video's title*/ });
    }else if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a video's source URL" /* error : You must enter a video's source URL*/ });
    }else if(errors[0].param === 'mimeType'){
      return res.status(400).send({result:"Error", message: "You must enter a video's video type" /* error : You must enter a video's video type*/ });
    }else if(errors[0].param === 'sortDescription'){
      return res.status(400).send({result:"Error", message: "You must enter a video's sort description" /* error : You must enter a video's sort description*/ });
    }else if(errors[0].param === 'video_id'){
      return res.status(400).send({result:"Error", message: "This video article does not exist in database." /* error : This video article does not exist in database.*/ });
    }
  }

  ArticleVideos.findOne({_id :  req.body.video_id}, function(err, artVideo){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
       $set: {
        artVideo.title            =   req.body.title,
        artVideo.authorName       =   req.body.authorName ? req.body.authorName : undefined,
        artVideo.sourceURL        =   req.body.sourceURL,
        artVideo.sortDescription  =   req.body.sortDescription,
        artVideo.mimeType         =   req.body.mimeType ,
        artVideo.publishedDate    =   req.body.publishedDate ? req.body.publishedDate : undefined,
        artVideo.cloudURL         =   req.body.cloudURL ? req.body.cloudURL : undefined
      }
      artVideo.save(function(err, updateImage){
        if (err){
          return res.status(500).jsonp({result:"Error", message:err});
        }else{
          res.status(200).jsonp({result:"Success", data: updateImage});
        }
      });
    }
  });
};

/**
 * Delete an article video
*/
module.exports.removeArticleVideo = function(req, res){
  ArticleVideos.findOneAndRemove({_id : req.body.id}, function(err, removedArtVideos){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: removedArtVideos});  
    }
  });
}














/**
 * Add an article Reference
 */
module.exports.addArticleReference = function(req, res){
  req.assert('sourceURL', "You must enter a reference's source url").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a reference's source url" /* error : You must enter a reference's source url*/ });
    }
  }
  var artReference = new ArticleReferences(req.body);
  artReference.save(function(err, artReference){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: artReference});
    }
  });
};

/**
 *Edit an article Reference
 */
module.exports.editArticleReference = function(req, res){
  
  req.assert('sourceURL', "You must enter a reference's source url").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    if(errors[0].param === 'sourceURL'){
      return res.status(400).send({result:"Error", message: "You must enter a reference's source url" /* error : You must enter a reference's source url*/ });
    }
  }

  ArticleReferences.findOne(req.body.id, function(err, artReference){
    if (err){
      return res.status(500).jsonp({result:"Error", message:err});
    }else{
       $set: {
        artReference.authorName       =   req.body.authorName ? req.body.authorName : undefined,
        artReference.sourceURL        =   req.body.sourceURL,
        artReference.publishedDate    =   req.body.publishedDate ? req.body.publishedDate : undefined
      }
      artReference.save(function(err, updateRef){
        if (err){
          return res.status(500).jsonp({result:"Error", message:err});
        }else{
          res.status(200).jsonp({result:"Success", data: updateRef});
        }
      });
    }
  });
};

/**
 * Delete an article Reference
*/
module.exports.removeArticleReference = function(req, res){
  ArticleReferences.findOneAndRemove({_id : req.body.id}, function(err, removedArtReferences){
    if(err) {
      return res.status(400).jsonp({result:"Error", message:err});
    }else{
      res.status(200).jsonp({result:"Success", data: removedArtReferences});  
    }
  });
}
