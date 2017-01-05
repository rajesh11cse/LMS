'use strict';

angular.module('mean.system').factory("httpErrorService", function($rootScope, $http) {

    // http error handling service
    var httpErrorMessage =  function(data, status) {
        if(status === 400 && data.data){
            if(data.data.errors.phoneNumber){
                return data.data.errors.phoneNumber.message || 'Service Unavailable.';
            }else if(data.data.errors.email){
                return data.data.errors.email.message || 'Service Unavailable.';
            }else{
                return data.data.errors.message || 'Service Unavailable.';
            }
        }else if(status === 401){
            return data.message || data.reason  || 'Service Unavailable.';
        }else if(status === 500 || status === 400){
            return data.message || 'Service Unavailable.';
        }else if(status === 404){
            return 'The requested resource could not be found but may be available in the future.';
        }else if(status === 502){
            return 'The proxy server received an invalid response from an upstream server.';
        }else if(status === 503){
            return 'Service Unavailable.';
        }else if(status === -1){
            return 'Either the server is down or the client is not connected to the internet or the request was manually cancelled by the client.';
        }else{
            return 'Service Unavailable.';
        }
    }

    // update parameters for form.
    var getFormParameters =  function(type, params) {
        params.publishedDate = new Date(params.publishedDate);

        if(type == 'image'){
            params['imageFile']  = params.mediumImageUrl;
            return params;
        }else{
            return params;
        }
    }
    // ceate or update parameters for article form.
    var createObject =  function(type, attr) {
        if(!attr) return false;
        var articleObj = {
        'title'                 :     attr.title, 
        'authorName'            :     attr.authorName, 
        'sourceURL'             :     attr.sourceURL, 
        'cloudURL'              :     attr.cloudURL,
        'publishedDate'         :     attr.publishedDate,
      };
      if(type == 'video' || type == 'audio'){
        articleObj['mimeType'] = attr.mimeType,
        articleObj['sortDescription'] = attr.sortDescription
        return articleObj;
      }else{
        return articleObj;
      }
    }

    return {
        httpErrorMessage:httpErrorMessage,
        getFormParameters:getFormParameters,
        createObject:createObject
    };   

});