'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Lms = new Module('lms');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Lms.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Lms.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Lms.menus.add({
    title: 'lms example page',
    link: 'lms example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Lms.aggregateAsset('css', 'lms.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Lms.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Lms.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Lms.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Lms;
});
