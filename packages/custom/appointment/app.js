'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Appointment = new Module('appointment');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Appointment.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Appointment.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Appointment.menus.add({
    title: 'appointment example page',
    link: 'appointment example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Appointment.aggregateAsset('css', 'appointment.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Appointment.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Appointment.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Appointment.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Appointment;
});
