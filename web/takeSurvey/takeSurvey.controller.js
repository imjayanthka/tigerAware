(function() {
    'use strict';

    angular
        .module('researchApp')
        .controller('TakeSurveyController', TakeSurveyController);

    TakeSurveyController.$inject = ['$scope', '$rootScope', '$http', '$timeout', '$location', '$firebaseAuth', 'StudyNavService', 'localStorageService', '$firebaseArray', 'resolvedSurveys'];
    function TakeSurveyController($scope, $rootScope, http, timeout, location, $firebaseAuth, StudyNavService, localStorageService, $firebaseArray, resolvedSurveys)  {
        var vm = this;
        vm.all_surveys = [];
        vm.currentSurvey = {};
        vm.responses = {};

        //Authentication
        var auth = $firebaseAuth();
        var firebaseUser = auth.$getAuth();
        if (!firebaseUser) {
            location.path('/login');
        }
        vm.all_surveys = resolvedSurveys;

        activate();
        $(document).ready(function () {
            $('.tooltipped').tooltip({ delay: 50 });
        });
        $("#navBack").click(function () {
            history.go(-1);
        });
        function activate() { 
            // StudyNavService.getAllSurveyInformation().then(function(all_surveys){
            //     vm.all_surveys = all_surveys;
            //     $scope.$apply()
            // });
            initModal();
        }
        function initModal() {
            vm.showTakeSurvey = false;
            $('#modal-take-survey').modal({
                dismissible: false,
                opacity: .7,
                in_duration: 300,
                out_duration: 200,
                starting_top: '4%',
                ending_top: '10%',
                ready: function (modal, trigger) { }
            });
        }
        vm.takeSurvey = function(survey){
            vm.currentSurvey = survey;
            vm.currentQuestion = {}
            vm.currentQuestion.surveyName = survey.name
            if(survey.surveys != null){
                console.log('Here')
                vm.currentQuestion.count = 0
                vm.currentQuestion.type = survey.surveys[vm.currentQuestion.count].type
                vm.currentQuestion.title = survey.surveys[vm.currentQuestion.count].title
                vm.currentQuestion.id = survey.surveys[vm.currentQuestion.count].id
                vm.currentQuestion.totalQuestions = survey.surveys.length
                vm.currentQuestion.response = null;
                if (vm.currentSurvey.surveys[vm.currentQuestion.count].choices != null)
                    response.choices = vm.currentSurvey.surveys[vm.currentQuestion.count].choices
            }
            console.log(vm.currentQuestion)
            vm.showTakeSurvey = true;
            $('#modal-take-survey').modal('open');
        }
        vm.nextQuestion = function(response){
            vm.responses[response.id] = response.answer;
            response.count++;
            response.answer = null;
            response.type = vm.currentSurvey.surveys[response.count].type
            response.title = vm.currentSurvey.surveys[response.count].title
            response.id = vm.currentSurvey.surveys[response.count].id
            if (vm.currentSurvey.surveys[response.count].choices != null)
                response.choices = vm.currentSurvey.surveys[response.count].choices
            vm.currentQuestion = response
            console.log(vm.responses)
        }

        vm.saveResponses = function(){

        }

        vm.cancelTakeSurvey = function () {
            vm.showTakeSurvey = false;
            vm.currentQuestion = {}
            vm.currentSurvey = {}
            vm.response = {}
            $('#modal-take-survey').modal('close');
        }
    }
})();