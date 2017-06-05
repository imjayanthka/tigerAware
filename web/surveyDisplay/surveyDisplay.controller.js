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
         //vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['id']);
         //console.log(vm.surveySchema)
         vm.surveySchema = {
                              "survey_key":"-KkguhGyohbFFFyeut40",
                              "survey_id":10,
                              "name":"Sample MCQ Survey",
                              "survey":[
                                {
                                  "choices":["Red","Green","Orange"],
                                  "conditionID":"",
                                  "id":"favColor",
                                  "on":"",
                                  "title":"What's your Fav Color",
                                  "type":"MultipleChoice"
                                }
                              ],
                              "img_url":"resources/images/stock/stock10.jpeg",
                              "answers":
                              {
                                "-KkhMT8bHHXsQ8gk6bow":{"surveyData":{"favColor":"2"}},
                                "-KkhMgpYx-CHWg8TXc8w":{"surveyData":{"favColor":"1"}},
                                "-KkhMsbUPEIZfuHFMbDr":{"surveyData":{"favColor":"2"}},
                                "-KkhNJP8-09Fje08BXlK":{"surveyData":{"favColor":"0"}},
                                "-KkhO5Fdb7rE51_tkH6X":{"surveyData":{"favColor":"0"}},
                                "-KkhRkt7_1vsLvk7V3Qu":{"surveyData":{"favColor":"2"}},
                                "-KkhRmFe-6s30J3oAbNi":{"surveyData":{"favColor":"1"}},
                                "-KkhRndJmJn6RoGyvIxN":{"surveyData":{"favColor":"0"}},
                                "-KkhRp5rNk-zKyGVgi3B":{"surveyData":{"favColor":"2"}},
                                "-KkhRqpj9-mjEtEi8bvI":{"surveyData":{"favColor":"0"}},
                                "-KkhS-H_eilHN9bAefrW":{"surveyData":{"favColor":"1"}},
                                "-KkhS0bMBoWmmiLEnlhG":{"surveyData":{"favColor":"0"}},
                                "-KkhS1ulVBEUdsjjqB5Q":{"surveyData":{"favColor":"2"}},
                                "-KkhS3N_-QyIxx9pqn4s":{"surveyData":{"favColor":"0"}},
                                "-KkhS4l4NLdzteeans7z":{"surveyData":{"favColor":"2"}}
                              },
                              "num_responses":15
                            }
         vm.study_name = vm.surveySchema.name;
         var surveys = vm.surveySchema.survey;
         var survey_display_data = {}
         for(var question in surveys){
            var chart = {}
            chart.title = surveys[question].title;
            chart.type = surveys[question].type;
            if(chart.type == "MultipleChoice")
              chart.choices = surveys[question].choices
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