
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

      //check auth, otherwise redirect. This needs to be defined in order to hit the users/ ref
      var auth = $firebaseAuth();
      var firebaseUser = auth.$getAuth();
      if (!firebaseUser) {
         location.path('/login');
      }

      vm.surveyForDelete = {}
      vm.confirmDelete = false;
      initSurveys();
      $(document).ready(function(){
         $('.tooltipped').tooltip({delay: 50});
      });

      function initSurveys(){
         // StudyNavService.setUserSurveys(firebaseUser.uid, function(blueprints){
         //    localStorageService.set('usersurveys', blueprints);

         //    vm.user_surveys_grid = []
         //    var survey_row = [];
         //    var index = 0;

         //    for (var key in blueprints) {
         //       if (blueprints.hasOwnProperty(key)) {
         //          if ((index + 1) % 4 == 0){
         //             survey_row.push(blueprints[key]);
         //             vm.user_surveys_grid.push(survey_row);
         //             survey_row = [];
         //          }
         //          else{
         //             survey_row.push(blueprints[key]);
         //          }
         //       }
         //       index += 1;
         //    }
         //    if( index % 4 != 0){
         //       vm.user_surveys_grid.push(survey_row);
         //    }
         // });
         StudyNavService.setUserSurveys(firebaseUser.uid).then(function(blueprints) {
            console.log(blueprints)
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
            $scope.$apply()
         })

      }

      // This needs to be fixed, hardcoded async time not good.
      // timeout(initOverviewController,3000);
      initOverviewController()
      function initOverviewController(){
         $('.tooltipped').tooltip({delay: 50});
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
         auth.$signOut();
         location.path('/logout');
         vm.message = "You have Logged out successfully!"
         Materialize.toast(vm.message, 7000, 'rounded');
      }

      vm.showDelete = function(survey){
         $("#deleteModal").modal('open');
         vm.showDeleteModal = true;
         vm.surveyForDelete = survey;
      }

      vm.editSurvey = function(survey){
         if(survey.num_responses > 0){
            Materialize.toast("Surveys with responses can't be edited", 7000, 'rounded');
         }else{
            location.path("/builder/" + survey.survey_id);
         }
      }

      vm.hideDelete = function(){
         $("#deleteModal").modal("close");
         vm.showDeleteModal = false;
      }

      vm.newFromTemplate = function(survey){
         location.path("/builder/template/" + survey.survey_id);

      }

      vm.deleteStudy = function(){
         var rowInd = Math.floor(parseInt(vm.surveyForDelete['survey_id']) / 4);
         var colInd = (parseInt(vm.surveyForDelete['survey_id']) % 4) - 1;
         vm.user_surveys_grid[rowInd].splice(colInd, 1);

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
         var userRef = firebase.database().ref('users/' + firebaseUser.uid + '/surveys');
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
         Materialize.toast('Successfully deleted survey', 2000, 'rounded grey-text text-darken-4 red lighten-3 center-align');
         $("#deleteModal").modal('close');
      }
      //Connors Implementation of CSV Export of Current Data
      vm.printCSV = function () {

            var startString = '{"data":{}}';
            var output = JSON.parse(startString);

            var i = 0;
            var header = [];
            var content = [];
            header.push("Response");
            var outputString = "";
            var responseID = "";

            var dataRef = firebase.database().ref('data/-KkguhGyohbFFFyeut40/answers/');


            dataRef.once('value', function (snapshot) {
                  snapshot.forEach(function (responseSnapshot) {
                        responseID = responseSnapshot.key.toString();
                        responseID = responseID.slice(1);
                        content.push(responseID);

                        responseSnapshot.forEach(function (surveyDataSnapshot) {

                              surveyDataSnapshot.forEach(function (questionAnswerSnapshot) {

                                    if (i < 1) {
                                          header.push(questionAnswerSnapshot.key.toString());
                                    }
                                    content.push(questionAnswerSnapshot.val().toString());
                              });

                              i++;
                        });
                  });
            });

            var buildCSV = function () {

                  for (var i = 0; i < header.length; i++) {
                        if (i > 0) {
                              outputString += ',';
                        }
                        outputString += '"' + header[i] + '"';
                  }
                  outputString += '\n';
                  for (var j = 0; j < content.length; j = j) {
                        for (var k = 0; k < header.length; k++) {
                              if (k > 0) {
                                    outputString += ',';
                              }
                              outputString += '"' + content[j] + '"';
                              j++;
                        }
                        outputString += '\n';
                  }

                  var hiddenElement = document.createElement('a');
                  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(outputString);
                  hiddenElement.target = '_blank';
                  hiddenElement.download = 'surveyData.csv';
                  hiddenElement.click();

            }

            timeout(buildCSV, 3000);

      }
    }
})();
