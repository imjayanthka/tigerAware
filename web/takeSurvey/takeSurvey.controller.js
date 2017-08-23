    (function() {
    'use strict';

    angular
        .module('researchApp')
        .controller('TakeSurveyController', TakeSurveyController);

    TakeSurveyController.$inject = ['$scope', '$rootScope', '$http', '$timeout', '$location', '$firebaseAuth', 'StudyNavService', 'localStorageService', '$firebaseArray', 'resolvedSurveys'];
    function TakeSurveyController($scope, $rootScope, http, $timeout, location, $firebaseAuth, StudyNavService, localStorageService, $firebaseArray, resolvedSurveys)  {
        var vm = this;
        vm.all_surveys = [];
        vm.currentSurvey = {};
        vm.responses = {};
        vm.slider = {
            options: {}
        };
        vm.options = [];

        //Authentication
        var auth = $firebaseAuth();
        var firebaseUser = auth.$getAuth();
        if (!firebaseUser) {
            //location.path('/login');
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
            /* Moved to app.js with resolve parameter*/
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
                ready: function (modal, trigger) { 
                    vm.refreshSlider();
                }
            });
        }

        vm.takeSurvey = function(survey){
            vm.currentSurvey = survey;
            vm.currentQuestion = {};
            vm.currentQuestion.surveyName = survey.name;
            if(survey.surveys != null){
                vm.currentQuestion.count = 0;
                vm.currentQuestion.type = survey.surveys[vm.currentQuestion.count].type;
                vm.currentQuestion.title = survey.surveys[vm.currentQuestion.count].title;
                vm.currentQuestion.id = survey.surveys[vm.currentQuestion.count].id;
                vm.currentQuestion.totalQuestions = survey.surveys.length;
                if(vm.currentQuestion.type == 'MultipleChoice'){
                    if (vm.currentSurvey.surveys[vm.currentQuestion.count].choices != null){
                        vm.currentQuestion.multipleSelect = "";
                        vm.currentQuestion.multipleSelect = vm.currentSurvey.surveys[vm.currentQuestion.count].multipleSelect;
                        vm.currentQuestion.choices = [];
                        vm.currentSurvey.surveys[vm.currentQuestion.count].choices.forEach(function (element) {
                            vm.currentQuestion.choices.push({
                                choice: element,
                                answer: null
                            });
                        });
                    }
                }
                if(vm.currentQuestion.type == "timeInt"){
                    // Already obtained above
                    vm.options = [];
                    for(var i=0; i<10; i++){
                        vm.options.push({id:i+1,value:(i+1).toString()});
                    }
                    vm.selectedOption = vm.options[0];
                    // $("#drum-picker").drum();
                }
                if(vm.currentQuestion.type == 'Scale'){
                    vm.slider.options.floor = 1;
                    vm.slider.options.ceil = vm.currentSurvey.surveys[vm.currentQuestion.count].choices.length;
                    vm.slider.options.steps = 1;
                    vm.slider.options.showTicks = true;
                    vm.slider.options.showTicksValues = true;
                    vm.slider.options.stepsArray = [];
                    for (var i = 1; i <= vm.slider.options.ceil; i++) {
                        vm.slider.options.stepsArray.push({
                            value: i,
                            legend: vm.currentSurvey.surveys[vm.currentQuestion.count].choices[i - 1]
                        });
                    }
                }
                if(vm.currentQuestion.type == "dateTime"){
                    vm.currentQuestion.both = vm.currentSurvey.surveys[vm.currentQuestion.count].both;
                    vm.currentQuestion.multiple = vm.currentSurvey.surveys[vm.currentQuestion.count].multiple;
                    vm.currentQuestion.prior = vm.currentSurvey.surveys[vm.currentQuestion.count].prior;

                    // If both date and timepicker are to be included
                    if(vm.currentQuestion.both){
                        // If date prior to current date can be selected
                        if(vm.currentQuestion.prior){
                            $("#datepicker").datepicker({
                                onSelect: function (event) {
                                    // console.log(event);
                                }
                            });
                        } else { // restrict date selection to current
                            $("#datepicker").datepicker({
                                minDate:0,
                                onSelect: function (event) {
                                    // console.log(event);
                                }
                            });
                        }
                        $(".timepicker").timepicki();
                        // Show timepicker
                        $(".timepicker").prop("type","text");
                        // Reduce datepicker width
                        $(".hasDatepicker").removeClass("m12");
                        $(".hasDatepicker").addClass("m5");
                    } else { // only show datepicker
                        // If date prior to current date can be selected
                        if(vm.currentQuestion.prior){
                            console.log(vm.currentQuestion.both);
                            $("#datepicker").datepicker({
                                onSelect: function (event) {
                                    console.log(event);
                                }
                            });
                        } else {
                            $("#datepicker").datepicker({
                                minDate:0,
                                onSelect: function (event) {
                                    console.log(event);
                                }
                            });
                        }
                        // Hide timepicker
                        $(".timepicker").prop("type","hidden");
                        // Expand datepicker width
                        $(".hasDatepicker").removeClass("m5");
                        $(".hasDatepicker").addClass("m12");
                        // Center align datepicker
                        $(".ui-datepicker-inline").css("margin-right","auto");
                        $(".ui-datepicker-inline").css("margin-left","auto");
                    }
                }
            }
            //console.log(vm.currentQuestion);
            vm.showTakeSurvey = true;
            $('#modal-take-survey').modal('open');
        }

        vm.nextQuestion = function(response){
            if(response.type == "MultipleChoice"){
                response.answer = []
                response.choices.forEach(function(choice){
                    if (choice.answer != null)
                        response.answer.push(choice.choice)
                })
            }
            if (response.type == "dateTime"){
                //Check for undefined later
                response.answer = $("#datepicker").val()+" "+$(".timepicker").val()
            }
            if(response.type == "Scale"){
                response.answer = null
            }
            if(response.type == "timeInt"){
                response.answer = null
            }
            vm.responses[response.id] = response.answer;
            response.count++;
            response.answer = null;
            response.type = vm.currentSurvey.surveys[response.count].type
            response.title = vm.currentSurvey.surveys[response.count].title
            response.id = vm.currentSurvey.surveys[response.count].id
            if (vm.currentSurvey.surveys[response.count].choices != null) {
                // response.choices = [];
                // vm.currentSurvey.surveys[response.count].choices.forEach(function (element) {
                //     response.choices.push({
                //         choice: element,
                //         answer: null
                //     })
                // })

                if (response.type == 'MultipleChoice') {
                    response.multipleSelect = "";
                    response.multipleSelect = vm.currentSurvey.surveys[vm.currentQuestion.count].multipleSelect;
                    response.choices = []
                    vm.currentSurvey.surveys[response.count].choices.forEach(function (element) {
                        response.choices.push({
                            choice: element,
                            answer: null
                        })
                    })
                }
            }
            if (response.type == 'Scale') {
                vm.slider.options.floor = 1;
                console.log(vm.currentSurvey.surveys[response.count].choices)
                vm.slider.options.ceil = vm.currentSurvey.surveys[response.count].choices.length;
                vm.slider.options.steps = 1;
                vm.slider.options.showTicks = true;
                vm.slider.options.showTicksValues = true;
                vm.slider.options.stepsArray = [];
                for (var i = 1; i <= vm.slider.options.ceil; i++) {
                    vm.slider.options.stepsArray.push({
                        value: i,
                        legend: vm.currentSurvey.surveys[response.count].choices[i - 1]
                    });
                }
            }

            if (response.type == "dateTime") {
                response.both = vm.currentSurvey.surveys[response.count].both;
                response.multiple = vm.currentSurvey.surveys[response.count].multiple;
                response.prior = vm.currentSurvey.surveys[response.count].prior;

                // If both date and timepicker are to be included
                if (response.both) {
                    // If date prior to current date can be selected
                    if (response.prior) {
                        $("#datepicker").datepicker({
                            onSelect: function (event) {
                                // console.log(event);
                            }
                        });
                    } else { // restrict date selection to current
                        $("#datepicker").datepicker({
                            minDate: 0,
                            onSelect: function (event) {
                                // console.log(event);
                            }
                        });
                    }
                    $(".timepicker").timepicki();
                    // Show timepicker
                    $(".timepicker").prop("type", "text");
                    // Reduce datepicker width
                    $(".hasDatepicker").removeClass("m12");
                    $(".hasDatepicker").addClass("m5");
                } else { // only show datepicker
                    // If date prior to current date can be selected
                    if (response.prior) {
                        console.log(response.both);
                        $("#datepicker").datepicker({
                            onSelect: function (event) {
                                console.log(event);
                            }
                        });
                    } else {
                        $("#datepicker").datepicker({
                            minDate: 0,
                            onSelect: function (event) {
                                console.log(event);
                            }
                        });
                    }
                    // Hide timepicker
                    $(".timepicker").prop("type", "hidden");
                    // Expand datepicker width
                    $(".hasDatepicker").removeClass("m5");
                    $(".hasDatepicker").addClass("m12");
                    // Center align datepicker
                    $(".ui-datepicker-inline").css("margin-right", "auto");
                    $(".ui-datepicker-inline").css("margin-left", "auto");
                }
            }

            vm.currentQuestion = response
        }

        vm.saveResponses = function(response){
            if (response.type == "MultipleChoice") {
                response.answer = []
                response.choices.forEach(function (choice) {
                    if (choice.answer != null)
                        response.answer.push(choice.choice)
                })
            }
            if (response.type == "dateTime") {
                //Check for undefined later

                response.answer = (($("#datepicker").val() == undefined) ? "" : $("#datepicker").val())+""+(($(".timepicker").val() == undefined) ? "" : $(".timepicker").val())
            }
            if (response.type == "Scale") {
                response.answer = null
            }
            if (response.type == "timeInt") {
                response.answer = null
            }
            vm.responses[response.id] = response.answer;
            StudyNavService.setSurveyResponse(firebaseUser.uid, vm.currentSurvey.id, vm.responses)   
        }

        vm.cancelTakeSurvey = function () {
            vm.showTakeSurvey = false;
            vm.currentQuestion = {}
            vm.currentSurvey = {}
            vm.response = {}
            $('#modal-take-survey').modal('close');
        }

        vm.prevQuestion =  function () {
            
        }

        vm.refreshSlider = function () {
            $timeout(function () {
                // $scope.$broadcast('rzSliderForceRender');
            });
        };
    }
})();