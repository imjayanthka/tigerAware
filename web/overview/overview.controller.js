
(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('OverviewController', OverviewController);
   OverviewController.$inject = ['$scope','$rootScope','$http','OverviewConstants','$timeout','$location','$firebaseAuth', 'StudyNavService', 'localStorageService', '$firebaseObject'];

   function OverviewController($scope,$rootScope,http,OverviewConstants,timeout,location, $firebaseAuth, StudyNavService, localStorageService, $firebaseObject){

      var vm=this;
      vm.initOverviewController=initOverviewController;
      vm.showDeleteModal = false;
      vm.auth = $firebaseAuth();
      vm.surveyForDelete = {}
      vm.confirmDelete = false;

      StudyNavService.setUserSurveys('user1', function(blueprints){
         localStorageService.set('usersurveys', blueprints);

         vm.user_surveys_grid = []
         var survey_row = [];
         var index = 0;

         for (var key in blueprints) {
            if (blueprints.hasOwnProperty(key)) {
               if ((index + 1) % 4 == 0){
                  survey_row.push(blueprints[key]);
                  vm.user_surveys_grid.push(survey_row);
                  survey_row = [];
               }
               else{
                  survey_row.push(blueprints[key]);
               }
            }
            index += 1;
         }
         if( index % 4 != 0){
            vm.user_surveys_grid.push(survey_row);
         }
         console.log(vm.user_surveys_grid);
      });
      // This needs to be fixed, hardcoded async time not good.
      timeout(initOverviewController,3000);


      function initOverviewController(){
         $(".dropdown-button").dropdown();
         $(".button-collapse").sideNav();
         $('.parallax').parallax();
         $("#navBack").click(function(){
            history.go(-1);
         });
         $("#deleteModal").modal();
         vm.studyConstants=OverviewConstants;
      }

      vm.directToStudy = function(survey_id) {
         // hard code routing for dummy site
         if (survey_id == "safety" || survey_id == "satisfaction"){
            location.path(survey_id);
         }else if (survey_id == "alcoholCravingStudy.html" || survey_id == "moodDesregulationStudy.html"){
            location.path('/overview');
         }
         else{
            location.path('/surveys/'+survey_id);
         }
      }
      vm.directToBuilder = function(){
         location.path('/builder');
      }
      vm.initiateLogOut = function(){
         vm.auth.$signOut();
         location.path('/logout');
         vm.message = "You have Logged out successfully!"
         Materialize.toast(vm.message, 7000, 'rounded');
      }
      vm.showDelete = function(survey){
         $("#deleteModal").modal('open');
         vm.showDeleteModal = true;
         vm.surveyForDelete = survey;
         console.log(survey);
      }

      vm.hideDelete = function(){
         $("#deleteModal").modal("close");
         vm.showDeleteModal = false;
      }

      vm.deleteStudy = function(survey){
         console.log("hit");
         console.log(survey);
      }
    }
})();
