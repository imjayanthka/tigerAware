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
      vm.showTextFieldResponsesModal = false;
      vm.showDisplayTypeModal = false;
      vm.takeBack = takeBack;

      vm.surveySchema = {}
      vm.questionTitle = "";
      vm.currentQuestion;
      vm.CSVSurveyKey = "";

      $(".dropdown-button").dropdown();
      $(".button-collapse").sideNav();
      $("#navBack").click(function(){
         history.go(-1);
      });
      $("#textFieldResponsesModal").modal({
             
      });
      $("#displayTypeModal").modal({
             
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
         vm.number_responses = Object.keys(vm.surveySchema.answers).length;
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
       
      // Opens Text Field Responses Modal
      vm.showTextFieldResponses = function(question) {
         $("#textFieldResponsesModal").modal('open');
         vm.showTextFieldResponsesModal = true;
         vm.questionTitle = question.title;
         vm.currentQuestion = question;
      }
      
      vm.hideTextFieldResponses = function() {
          $("#textFieldResponsesModal").modal('close');
          vm.showTextFieldResponsesModal = false;
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
      
      // Determines whether to display content for a text field question
      vm.showTextField = function(question) {
          if(question.type == "textField") {
              return true;
          } else {
              return false;
          }
      }
      
      vm.showDisplayType = function() {
         $("#displayTypeModal").modal('open');
         vm.showDisplayTypeModal = true;
         vm.CSVSurveyKey = vm.surveySchema.survey_key;
      }
      
      vm.hideDisplayType = function(){
         $("#displayTypeModal").modal("close");
         vm.showDisplayTypeModal = false;
      }
      
      //Connor's Implementation of CSV Export of Current Data
      vm.printCSV = function (displayType) {
            
            console.log("Exporting CSV of survey " + vm.CSVSurveyKey + " with answers displayed as " + displayType);
            $("#displayTypeModal").modal("close");
            vm.showDisplayTypeModal = false;
          
          
            // Get survey response data from firebase
            var i = 0;
            var header = [];
            var content = [];
            header.push("Response");
            var outputString = "";
            var responseID = "";
          
            // Depending on output type user wants, mark all Yes/No or MultipleChoice questions to be changed
            var questionsToBeChanged = {};
            var blueprintRef = firebase.database().ref('blueprints/' + vm.CSVSurveyKey + '/survey/');
            blueprintRef.once('value').then(function(snapshot) {
                snapshot.forEach(function(questionSnapshot) {
                    // Yes/No needs to be changed if user wants index answers
                    if(displayType == 'index' && questionSnapshot.child("type").val() == 'yesNo') {
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()] = {};
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()][0] = "No";
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()][1] = "Yes";
                    }
                    // Multiple choice need to be changed if user wants string answers
                    else if(displayType == 'string' && questionSnapshot.child("type").val() == 'MultipleChoice') {
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()] = {};
                        questionSnapshot.child("choices").forEach(function(choiceSnapshot) {
                            questionsToBeChanged[questionSnapshot.child("id").val().toString()][choiceSnapshot.key] = choiceSnapshot.val();
                        });
                    }
                });
            });

            // Reference for survey answers
            var dataRef = firebase.database().ref('data/' + vm.CSVSurveyKey + '/answers/');

            dataRef.once('value').then(function (snapshot) {
                  snapshot.forEach(function (responseSnapshot) {
                        responseID = responseSnapshot.key.toString();
                        responseID = responseID.slice(1);
                        content.push(responseID);
                      
                        responseSnapshot.forEach(function (surveyDataSnapshot) {
                              surveyDataSnapshot.forEach(function (questionAnswerSnapshot) {
                                    if (i < 1) {
                                          header.push(questionAnswerSnapshot.key.toString());
                                    }
                                    // If the current question needs to be modified for output
                                    if(questionsToBeChanged.hasOwnProperty(questionAnswerSnapshot.key)) {
                                        if(displayType == 'string') {
                                            content.push(questionsToBeChanged[questionAnswerSnapshot.key][questionAnswerSnapshot.val().toString()]);
                                        }
                                        else if(displayType == 'index') {
                                            for(var key in questionsToBeChanged[questionAnswerSnapshot.key]) {
                                                if(questionAnswerSnapshot.val().toString() == questionsToBeChanged[questionAnswerSnapshot.key][key]) {
                                                    content.push(key);
                                                }
                                            }
                                        }
                                    }
                                    else
                                        content.push(questionAnswerSnapshot.val().toString());
                              });
                              i++;
                        });
                  });
            }).then(function() {
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

                  // Download CSV
                  var hiddenElement = document.createElement('a');
                  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(outputString);
                  hiddenElement.target = '_blank';
                  hiddenElement.download = 'SurveyData.csv';
                  hiddenElement.click();
            });
      }

   }//end of controller


}) ();