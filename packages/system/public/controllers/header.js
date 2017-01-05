'use strict';

angular.module('mean.system').controller('HeaderController', ['$window', '$scope', '$rootScope', 'SessionService', 'Global', 'Menus', '$location',
  function($window, $scope, $rootScope, SessionService, Global, Menus, $location) {
    $scope.global = Global;
    $scope.menus = {};
    $scope.getUsername='';
    if(SessionService.getSession('Authenticate') == 'true'){
      $scope.Authenticated = 'true';
    }
    $scope.getUsername = SessionService.getSession('username');
    $scope.getUsetype = SessionService.getSession('usertype');
    $scope.actMenu = localStorage.getItem('currentMenu');

    // Default hard coded menu items for main menu
    var defaultMainMenu = [];
    // Query menus added by modules. Only returns menus that user is allowed to see.
    function queryMenu(name, defaultMenu) {
      Menus.query({
        name: name,
        defaultMenu: defaultMenu
      }, function(menu) {
        $scope.menus[name] = menu;
      });
    }

    $scope.logout= function(){
      $scope.Authenticated = 'false';
      //$scope.activeMenu('dashBoard');
      SessionService.setSession('Authenticate','false');
      SessionService.destroy();
      localStorage.clear();
    };

    // Query server for menus and check permissions
    queryMenu('main', defaultMainMenu);
    $scope.isCollapsed = false;
    $rootScope.$on('loggedin', function() {
      queryMenu('main', defaultMainMenu);
      $scope.global = {
        authenticated: !! $rootScope.user,
        user: $rootScope.user
      };
      if($scope.global.authenticated){
        $scope.Authenticated = 'true';
        SessionService.setSession('Authenticate','true');
        $scope.getUsername=SessionService.getSession('username');
        $scope.getUsetype=SessionService.getSession('usertype');
      }    
      $scope.actMenu = localStorage.getItem('currentMenu');
    });
  }
]);
