(function(){

  /***** Controller for Overview page *****/
  
   "use strict";
   angular.module('researchApp')
   .controller('OverviewController', OverviewController);
   OverviewController.$inject = ['$scope','$rootScope','$http','OverviewConstants','$timeout','$location','LoginService'];

   function OverviewController(ngScope,ngRootScope,http,OverviewConstants,timeout,location,LoginService){


            var vm=this;
        
        
            vm.initOverviewController=initOverviewController;
            //Wait for executing until dom
            timeout(initOverviewController,50);
            function initOverviewController(){
                console.log("hello");

                $(".dropdown-button").dropdown();
                $(".button-collapse").sideNav();
                $('.parallax').parallax();
                $("#navBack").click(function(){
                   history.go(-1);
                });
                vm.studyConstants=OverviewConstants;

            }
            vm.directToStudy = function(link) {
                location.path('/'+link);
            }
            vm.initiateLogOut = function(){
                vm.message = "You have Logged out successfully!"
                LoginService.clearCredentials();
                location.path('/logout');
                Materialize.toast(vm.message, 7000, 'rounded');
            }
    }

})();