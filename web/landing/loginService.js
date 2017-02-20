(function(){

    /***** SERVICE to Control Login *****/
    
   angular.module('researchApp').service('LoginService',['$http', '$rootScope', '$cookies', function LoginService($http,$rootScope,$cookies){

   		var service = {};

        service.setCredentials = setCredentials;
        service.clearCredentials = clearCredentials;

        return service;


        function setCredentials(username) {

            $rootScope.globals = {
                currentUser: {
                    username: username,
                }
            };


            // store user details in globals cookie that keeps user logged in for 1 week (or until they logout)
            var cookieExp = new Date();
            cookieExp.setDate(cookieExp.getDate() + 1);
            $cookies.putObject('globals', $rootScope.globals, { expires: cookieExp });
        }

        function clearCredentials() {
            $rootScope.globals = {};
            $cookies.remove('globals');
        }

	}]);
}) ();