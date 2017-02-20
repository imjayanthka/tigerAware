(function(){
   /***** Instantiate the module *****/
   "use strict";
   /***** Inject the modules which are dependencies *****/
   
   angular.module('researchApp',['ngRoute','angularCSS','highcharts-ng','ngCookies'])
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

            

            .otherwise({ redirectTo: '/login' });
    }

    //This takes care of enforcing the login while accessing the routes
    run.$inject = ['$rootScope', '$location', '$http','$cookies'];
    function run($rootScope, $location, $http,$cookies) {

        $rootScope.globals = $cookies.getObject('globals') || {};
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
                var restrictedPage = $.inArray($location.path(), ['/login']) === -1;
                var loggedIn = $rootScope.globals.currentUser;
                if (restrictedPage && !loggedIn) {
                    $location.path('/login');
                }
            });
        }
}) ();