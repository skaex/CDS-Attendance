// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $cordovaSQLite) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


 
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.new', {
    cache: false,
    url: '/new/:id',
    views: {
      'tab-meeting': {
        templateUrl: 'templates/tab-new.html',
        controller: 'NewCtrl'
      }
    }
  })

  .state('tab.newmembers', {
    cache: false,
    url: '/newmembers/:id',
    views: {
      'tab-new': {
        templateUrl: 'templates/tab-newmembers.html',
        controller: 'NewMembersCtrl'
      }
    }
  })


  .state('tab.report', {
    cache: false,
    url: '/report/:id',
    views: {
      'tab-reports': {
        templateUrl: 'templates/report-grp.html',
        controller: 'GroupReportCtrl'
      }
    }
  })

  .state('tab.grpsreports', {
    cache: false,
    url: '/grpsreports',
    views: {
      'tab-reports': {
        templateUrl: 'templates/report-cdsgroups.html',
        controller: 'ReportCdsGrpsCtrl'
      }
    }
  })

  .state('tab.newgrp', {
    cache: false,
    url: '/newgrp',
    views: {
      'tab-new': {
        templateUrl: 'templates/new-cdsgroup.html',
        controller: 'NewCdsCtrl'
      }
    }
  })

  .state('tab.meetgrp', {
    cache: false,
    url: '/meetgrp',
    views: {
      'tab-meeting': {
        templateUrl: 'templates/meeting-cdsgroups.html',
        controller: 'MeetingCdsCtrl'
      }
    }
  })

  .state('tab.attendance', {
      cache: false,
      url: '/attendance',
      views: {
        'tab-meeting': {
          templateUrl: 'templates/tab-attendance.html',
          controller: 'AttendanceCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/newgrp');

  
});
