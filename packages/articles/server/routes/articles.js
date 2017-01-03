'use strict';

module.exports = function(Articles, app, auth, database) {

  var addArticles = require('../controllers/addArticles'),
  articles = require('../controllers/articles');

  var multipart           = require('connect-multiparty'),
    multipartMiddleware   = multipart({limit: '1000mb'});

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for an article >>>>>>>>>>>>>>*/
  app.route('/articles/getArticle')
  .post(articles.getArticle);

  app.route('/articles/getArticleForAdmin')
  .post(articles.getArticleForAdmin);

  app.route('/articles/createArticle')
  .post(addArticles.createArticle);

  app.route('/articles/editArticle')
  .post(addArticles.editArticle);

  app.route('/articles/removeArticle')
  .post(addArticles.removeArticle);

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for image article >>>>>>>>>>>>>>*/
  app.route('/articles/uploadArticleImage')
  .post(multipartMiddleware, addArticles.uploadArticleImage);

  app.route('/articles/editArticleImage')
  .post(multipartMiddleware, addArticles.editArticleImage);

  app.route('/articles/removeArticleImage')
  .post(addArticles.removeArticleImage);

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for audio article >>>>>>>>>>>>>>*/
  app.route('/articles/uploadArticleAudio')
  .post(addArticles.uploadArticleAudio);

  app.route('/articles/editArticleAudio')
  .post(addArticles.editArticleAudio);

  app.route('/articles/removeArticleAudio')
  .post(addArticles.removeArticleAudio);

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for video article >>>>>>>>>>>>>>*/
  app.route('/articles/uploadArticleVideo')
  .post(addArticles.uploadArticleVideo);

  app.route('/articles/editArticleVideo')
  .post(addArticles.editArticleVideo);

  app.route('/articles/removeArticleVideo')
  .post(addArticles.removeArticleVideo);

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for reference article >>>>>>>>>>>>>>*/
  app.route('/articles/addArticleReference')
  .post(addArticles.addArticleReference);

  app.route('/articles/editArticleReference')
  .post(addArticles.editArticleReference);

  app.route('/articles/removeArticleReference')
  .post(addArticles.removeArticleReference);

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for publish article >>>>>>>>>>>>>>*/
  app.route('/articles/publishArticle')
    .post(articles.publishArticle);
    
  app.route('/articles/getPublishedArticle')
    .post(articles.getPublishedArticle);

  app.route('/articles/getPublishedArticleImage')
  .get(articles.getPublishedArticleImage);
  /*.get(function(req,res){
    console.log(req.param('imageId'));
    res.status(200).send('success');
  });*/

 /*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< APIs for get article notifications >>>>>>>>>>>>>>*/
  app.route('/articles/getNotifications')
  .post(articles.getNotifications);
}
