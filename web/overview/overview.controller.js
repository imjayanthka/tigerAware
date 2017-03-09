(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('OverviewController', OverviewController);
   OverviewController.$inject = ['$scope','$rootScope','$http','OverviewConstants','$timeout','$location','$firebaseAuth'];

   function OverviewController($scope,$rootScope,http,OverviewConstants,timeout,location, $firebaseAuth){

            var vm=this;
            vm.initOverviewController=initOverviewController;
            vm.auth = $firebaseAuth();
            vm.firebaseUser = vm.auth.$getAuth();

            timeout(initOverviewController,50);
            function initOverviewController(){

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
                vm.auth.$signOut();
                location.path('/logout');
                vm.message = "You have Logged out successfully!"
                Materialize.toast(vm.message, 7000, 'rounded');
            }
    }
})();
