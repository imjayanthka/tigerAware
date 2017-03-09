(function(){
   /***** Instantiate the module *****/
   "use strict";
   /***** Inject the modules which are dependencies *****/
   // initPreloader();
   angular.module('researchApp',['ngRoute','angularCSS','highcharts-ng','ngCookies', "firebase"])
   		  .config(config)
          .run(run);

    //Any new route(Page) added needs to be configured here by providiing it's details
   config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
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

            .when('/sluWatch', {
                title: 'Mood Toolkit',
                controller: 'SluController',
                templateUrl: 'sluWatch/sluWatchStudy.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })

            .when('/nimh', {
                title: 'Mood Toolkit',
                controller: 'NimhController',
                templateUrl: 'nimh/nimhStudy.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })

            .when('/firebase', {
                title: 'Firebase demo',
                controller: 'FirebaseController',
                templateUrl: 'firebase/firebase.html',
                css: 'resources/css/style.css',
                controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/login' });
    }

    function initPreloader(){
         $(document).ready(function(){
            $('#preloader').fadeOut('fast');
         });
    }

    // Add a listiner for changes in the auth state
    run.$inject = ['$rootScope', '$location', '$firebaseAuth'];
    function run($rootScope, $location, $firebaseAuth) {

      var auth = $firebaseAuth();
      auth.$onAuthStateChanged(function(firebaseUser) {
         console.log("state chenge");

         if (firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
         } else {
            console.log("Signed out");
         }
      });

   }
}) ();