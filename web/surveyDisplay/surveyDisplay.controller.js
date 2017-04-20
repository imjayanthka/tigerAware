(function(){

   /** Controller for the whole NIMH page **/
   angular.module('researchApp').controller('surveyDisplayController',surveyDisplayController);
   surveyDisplayController.$inject = ['$scope','$rootScope','$http','$window','$location','ColorConstants','graphService','AggregateService', '$firebaseObject','$firebaseArray', "$timeout", "$firebaseAuth", "dynamicGraphService", "$routeParams", "StudyNavService"];

   function surveyDisplayController($scope,$rootScope,$http,$window,$location,ColorConstants,graphService,AggregateService, $firebaseObject,$firebaseArray, $timeout, $firebaseAuth, dynamicGraphService, $routeParams, StudyNavService){
      var vm = this;
      vm.auth = $firebaseAuth();
      vm.firebaseUser = vm.auth.$getAuth();
      vm.showOverviewPageFlag =true;
      vm.showOverviewPageFlag =true;
      vm.takeBack = takeBack;

      vm.surveySchema = {}

      $(".dropdown-button").dropdown();
      $(".button-collapse").sideNav();
      $("#navBack").click(function(){
         history.go(-1);
      });

      var ref = firebase.database().ref();
      $scope.data = $firebaseObject(ref);
      initSurveyController();

      function initSurveyController(){
         vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['id']);
         vm.study_name = vm.surveySchema.name;
         var surveys = vm.surveySchema.survey;
         var survey_display_data = {}
         for(var question in surveys){
            var chart = {}
            chart.title = surveys[question].title;
            chart.type = surveys[question].type

            if (surveys[question].type === "textSlide" || surveys[question].type === "textField") {
               continue;
            }else{
               answers = {}
               for (var response in vm.surveySchema.answers) {
                  if (vm.surveySchema.answers.hasOwnProperty(response)) {
                     response = vm.surveySchema.answers[response].surveyData[surveys[question].id]
                     if (answers[response]){
                        answers[response]++;
                     }else{
                        answers[response] = 1;
                     }
                  }
               }
            }

            chart.answers = answers;
            chart.graph = dynamicGraphService.getSurveyGraph(chart);
            survey_display_data[surveys[question].id] = chart;
         }
         vm.loadedResponses = survey_display_data;
         console.log(vm.loadedResponses);
      }

      vm.initiateLogOut = function(){
          vm.auth.$signOut();
          $location.path('/logout');
          vm.message = "You have Logged out successfully!"
          Materialize.toast(vm.message, 7000, 'rounded');
      }
      function takeBack(){
        if(!vm.showUserPageFlag){
           window.history.back();
          }
        else{
          vm.showUserPageFlag=false;
          vm.showOverviewPageFlag=true;
        }
      }

   }//end of controller


}) ();