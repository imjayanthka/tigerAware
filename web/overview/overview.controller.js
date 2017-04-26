
(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('OverviewController', OverviewController);
   OverviewController.$inject = ['$scope','$rootScope','$http','OverviewConstants','$timeout','$location','$firebaseAuth', 'StudyNavService', 'localStorageService', '$firebaseArray'];

   function OverviewController($scope,$rootScope,http,OverviewConstants,timeout,location, $firebaseAuth, StudyNavService, localStorageService, $firebaseArray){

      var vm=this;
      vm.initOverviewController=initOverviewController;
      vm.showDeleteModal = false;
      vm.auth = $firebaseAuth();
      vm.surveyForDelete = {}
      vm.confirmDelete = false;
      initSurveys();

      function initSurveys(){
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
         });
      }

      // This needs to be fixed, hardcoded async time not good.
      timeout(initOverviewController,3000);


      function initOverviewController(){
         $(".dropdown-button").dropdown();
         $(".button-collapse").sideNav();
         $('.parallax').parallax();
         $("#navBack").click(function(){
            history.go(-1);
         });
         $("#deleteModal").modal({
            complete: function() {
               vm.surveyForDelete = {}
            } // reset survey for delete on close
         });

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
      vm.editSurvey = function(survey){
         console.log('clicked');
         if(survey.num_responses > 0){
            Materialize.toast("Surveys with responses can't be edited", 7000, 'rounded');
         }else{
            location.path("/builder/" + survey.survey_id);
            vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['id']);
         }
      }
      vm.hideDelete = function(){
         $("#deleteModal").modal("close");
         vm.showDeleteModal = false;
      }

      vm.deleteStudy = function(){
         console.log(vm.surveyForDelete);

         // Delete blueprint for selected survey
         var blueprintsRef = firebase.database().ref('blueprints');
         var blueprint_list = $firebaseArray(blueprintsRef);

         blueprint_list.$loaded()
            .then(function(x) {
               var toDeleteInd = blueprint_list.$indexFor(vm.surveyForDelete['survey_key']);
               blueprint_list.$remove(blueprint_list[toDeleteInd]);
            })
            .catch(function(error) {
               console.log("Error:", error);
         });

         // Delete data associated with blueprint
         var dataRef = firebase.database().ref('data');
         var data_list = $firebaseArray(dataRef);

         data_list.$loaded()
            .then(function(x) {

               var toDeleteInd = blueprint_list.$indexFor(vm.surveyForDelete['survey_key']);
               //only delete arrays if there are responses
               if (toDeleteInd != -1){
                  blueprint_list.$remove(data_list[toDeleteInd]);
               }

            })
            .catch(function(error) {
               console.log("Error:", error);
         });

         // Delete user-blueprint association
         var userRef = firebase.database().ref('users/user1/surveys');
         var user_list = $firebaseArray(userRef);

         user_list.$loaded()
            .then(function(surveys) {
               var toDelete;
               for (let survey of user_list){
                  for(var key in survey) {
                     if(survey[key] == vm.surveyForDelete['survey_key']){
                        toDelete = key;
                        user_list.$remove(survey);
                     }
                  }
               }
            })
            .catch(function(error) {
               console.log("Error:", error);
         });
         initSurveys();
         Materialize.toast('Successfully deleted survey', 2000, 'rounded grey-text text-darken-4 red lighten-3 center-align');
         $("#deleteModal").modal('close');
      }
    }
})();
