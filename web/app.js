(function(){
   /***** Instantiate the module *****/
   "use strict";
   /***** Inject the modules which are dependencies *****/
   // initPreloader();
   angular.module('researchApp',['ngRoute','angularCSS','highcharts-ng','ngCookies', 'firebase', 'LocalStorageModule'])
   		  .config(config)
          .run(run);

    //Any new route(Page) added needs to be configured here by providiing it's details
   config.$inject = ['$routeProvider', 'localStorageServiceProvider'];
    function config($routeProvider, localStorageServiceProvider) {
        $routeProvider
            .when('/login', {
                title: 'Login',
                controller: 'LandingController',
                templateUrl: 'landing/landing.html',
                css: 'landing/landing-style.css',
                controllerAs: 'vm'
            })
            .when('/overview', {
                title: 'Mood Toolkit',
                controller: 'OverviewController',
                templateUrl: 'overview/overview.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })
            .when('/safety', {
                title: 'Campus Safety',
                controller: 'SluController',
                templateUrl: 'sluWatch/sluWatchStudy.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })
            .when('/satisfaction', {
                title: 'Campus Satisfaction',
                controller: 'NimhController',
                templateUrl: 'nimh/nimhStudy.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })
            .when('/surveys/:id', {
                title: 'Firebase demo',
                controller: 'surveyDisplayController',
                templateUrl: 'surveyDisplay/surveyDisplay.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })
            .when('/builder', {
                title: 'Survey Builder',
                controller: 'BuilderController',
                templateUrl: 'builder/builder.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })
            .otherwise({ redirectTo: '/login' });


         localStorageServiceProvider
             .setPrefix('myApp')
             .setStorageType('sessionStorage')
    }

    function initPreloader(){
         $(document).ready(function(){
            $('#preloader').fadeOut('fast');
         });
    }

   // Add a listiner for changes in the auth state
   run.$inject = ['$rootScope', '$location', '$firebaseAuth', 'StudyNavService'];
   function run($rootScope, $location, $firebaseAuth, StudyNavService) {
      var loggedIn = false;
      var auth = $firebaseAuth();
      $rootScope.$on('$locationChangeStart', function (event, next, current) {
         // redirect to login page if not logged in and trying to access a restricted page
         var restrictedPage = $.inArray($location.path(), ['/login']) === -1;
         if (restrictedPage && !loggedIn) {
            // $location.path('/login');
         }
      });

      //Add listener for changes in auth status
      auth.$onAuthStateChanged(function(firebaseUser) {
         if (firebaseUser) {
            loggedIn = true;
            // user1 to be replaced with associated username
            StudyNavService.setUserSurveys('user1', function(){});
         } else {
            console.log("Signed out");
            loggedIn = false;
         }
      });
   }
}) ();