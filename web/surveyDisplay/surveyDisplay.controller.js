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
      $('ul.tabs').tabs();

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
            chart.type = surveys[question].type;
            if(chart.type == "MultipleChoice")
              chart.choices = surveys[question].choices
            if (surveys[question].type === "textSlide") {       // || surveys[question].type === "textField")  removed to test for adding carousel
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
       
      // Determines whether any content will be displayed on the results visualization page based on question type
      vm.showResultVisualization = function(question) {
          if(question.type == "yesNo") {
              return true;
          } else if(question.type == "MultipleChoice") {
              return true;
          } else if(question.type == "timeInt") {
              return true;
          } else if(question.type == "textField") {
              return true;
          } else {
              return false;
          }
      }
       
      // Determines whether to display a Highcharts graph based on question type
      vm.showChart = function(question) {
          if(question.type == "yesNo") {
              return true;
          } else if(question.type == "MultipleChoice") {
              return true;
          } else if(question.type == "timeInt") {
              return true;
          } else {
              return false;
          }
      }

   }//end of controller


}) ();