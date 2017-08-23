(function () {

    /***** Controller for Overview page *****/
    "use strict";
    angular.module('researchApp')
        .controller('OverviewController', OverviewController);
    OverviewController.$inject = ['$scope', '$rootScope', '$http', 'OverviewConstants', '$timeout', '$location', '$firebaseAuth', 'StudyNavService', 'localStorageService', '$firebaseArray'];

    function OverviewController($scope, $rootScope, http, OverviewConstants, timeout, location, $firebaseAuth, StudyNavService, localStorageService, $firebaseArray, $q, $log) {

        var vm = this;
        vm.initOverviewController = initOverviewController;
        vm.showDeleteModal = false;
        vm.showDisplayTypeModal = false;
        vm.showAddUserModal = false;
        vm.CSVSurveyKey = '';

        //check auth, otherwise redirect. This needs to be defined in order to hit the users/ ref
        var auth = $firebaseAuth();
        var firebaseUser = auth.$getAuth();
        if (!firebaseUser) {
            location.path('/login');
        }

        vm.surveyForDelete = {}
        vm.confirmDelete = false;
        initSurveys();
        $(document).ready(function () {
            $('.tooltipped').tooltip({ delay: 50 });
        });

        function initSurveys() {
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
            StudyNavService.setUserSurveys(firebaseUser.uid).then(function (blueprints) {
                localStorageService.set('usersurveys', blueprints);
                vm.user_surveys_grid = []
                var survey_row = [];
                var index = 0;
                //Changed to use the new data structure.
                for (var key in blueprints.surveys) {
                    if (blueprints.surveys.hasOwnProperty(key)) {
                        if ((index + 1) % 4 == 0) {
                            survey_row.push(blueprints.surveys[key]);
                            vm.user_surveys_grid.push(survey_row);
                            survey_row = [];
                        }
                        else {
                            survey_row.push(blueprints.surveys[key]);
                        }
                    }
                    index += 1;
                }
                if (index % 4 != 0) {
                    vm.user_surveys_grid.push(survey_row);
                }
                $scope.$apply()
            })

        }

        // This needs to be fixed, hardcoded async time not good.
        // timeout(initOverviewController,3000);
        initOverviewController()
        function initOverviewController() {
            $('.tooltipped').tooltip({ delay: 50 });
            $(".dropdown-button").dropdown();
            $(".button-collapse").sideNav();
            $('.parallax').parallax();
            $("#navBack").click(function () {
                history.go(-1);
            });
            $("#deleteModal").modal({
                complete: function () {
                    vm.surveyForDelete = {}
                } // reset survey for delete on close
            });
            $("#displayTypeModal").modal({

            });
            $("#addUserModal").modal({

            });

            vm.studyConstants = OverviewConstants;
        }

        vm.directToStudy = function (survey_id) {
            // hard code routing for dummy site
            if (survey_id == "safety" || survey_id == "satisfaction") {
                location.path(survey_id);
            } else if (survey_id == "alcoholCravingStudy.html" || survey_id == "moodDesregulationStudy.html") {
                location.path('/overview');
            }
            else {
                location.path('/surveys/' + survey_id);
            }
        }

        vm.directToBuilder = function () {
            location.path('/builder');
        }

        vm.initiateLogOut = function () {
            auth.$signOut();
            location.path('/logout');
            vm.message = "You have Logged out successfully!"
            Materialize.toast(vm.message, 7000, 'rounded');
        }

        vm.showDelete = function (survey) {
            $("#deleteModal").modal('open');
            vm.showDeleteModal = true;
            vm.surveyForDelete = survey;
        }

        vm.hideDelete = function () {
            $("#deleteModal").modal("close");
            vm.showDeleteModal = false;
        }

        vm.showDisplayType = function (surveyKey) {
            $("#displayTypeModal").modal('open');
            vm.showDisplayTypeModal = true;
            vm.CSVSurveyKey = surveyKey;
        }

        vm.hideDisplayType = function () {
            $("#displayTypeModal").modal("close");
            vm.showDisplayTypeModal = false;
        }

        vm.showAddUser = function (survey) {
            $("#addUserModal").modal("open");
            vm.showAddUserModal = true;
        }

        vm.hideAddUser = function () {
            $("#addUserModal").modal("close");
            vm.showAddUserModal = false;
        }

        vm.editSurvey = function (survey) {
            if (survey.num_responses > 0) {
                Materialize.toast("Surveys with responses can't be edited", 7000, 'rounded');
            } else {
                location.path("/builder/" + survey.survey_id);
            }
        }

        vm.newFromTemplate = function (survey) {
            location.path("/builder/template/" + survey.survey_id);

        }

        vm.deleteStudy = function () {
            var rowInd = Math.floor(parseInt(vm.surveyForDelete['survey_id']) / 4);
            var colInd = (parseInt(vm.surveyForDelete['survey_id']) % 4) - 1;
            vm.user_surveys_grid[rowInd].splice(colInd, 1);

            // Delete blueprint for selected survey
            var blueprintsRef = firebase.database().ref('blueprints');
            var blueprint_list = $firebaseArray(blueprintsRef);

            blueprint_list.$loaded()
                .then(function (x) {
                    var toDeleteInd = blueprint_list.$indexFor(vm.surveyForDelete['survey_key']);
                    blueprint_list.$remove(blueprint_list[toDeleteInd]);
                })
                .catch(function (error) {
                    console.log("Error:", error);
                });

            // Delete data associated with blueprint
            var dataRef = firebase.database().ref('data');
            var data_list = $firebaseArray(dataRef);

            data_list.$loaded()
                .then(function (x) {

                    var toDeleteInd = blueprint_list.$indexFor(vm.surveyForDelete['survey_key']);
                    //only delete arrays if there are responses
                    if (toDeleteInd != -1) {
                        blueprint_list.$remove(data_list[toDeleteInd]);
                    }

                })
                .catch(function (error) {
                    console.log("Error:", error);
                });

            // Delete user-blueprint association
            var userRef = firebase.database().ref('users/' + firebaseUser.uid + '/surveys');
            var user_list = $firebaseArray(userRef);

            user_list.$loaded()
                .then(function (surveys) {
                    var toDelete;
                    for (let survey of user_list) {
                        for (var key in survey) {
                            if (survey[key] == vm.surveyForDelete['survey_key']) {
                                toDelete = key;
                                user_list.$remove(survey);
                            }
                        }
                    }
                })
                .catch(function (error) {
                    console.log("Error:", error);
                });
            Materialize.toast('Successfully deleted survey', 2000, 'rounded grey-text text-darken-4 red lighten-3 center-align');
            $("#deleteModal").modal('close');
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
            blueprintRef.once('value').then(function (snapshot) {
                snapshot.forEach(function (questionSnapshot) {
                    // Yes/No needs to be changed if user wants index answers
                    if (displayType == 'index' && questionSnapshot.child("type").val() == 'yesNo') {
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()] = {};
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()][0] = "No";
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()][1] = "Yes";
                    }
                    // Multiple choice need to be changed if user wants string answers
                    else if (displayType == 'string' && questionSnapshot.child("type").val() == 'MultipleChoice') {
                        questionsToBeChanged[questionSnapshot.child("id").val().toString()] = {};
                        questionSnapshot.child("choices").forEach(function (choiceSnapshot) {
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
                            if (questionsToBeChanged.hasOwnProperty(questionAnswerSnapshot.key)) {
                                if (displayType == 'string') {
                                    content.push(questionsToBeChanged[questionAnswerSnapshot.key][questionAnswerSnapshot.val().toString()]);
                                }
                                else if (displayType == 'index') {
                                    for (var key in questionsToBeChanged[questionAnswerSnapshot.key]) {
                                        if (questionAnswerSnapshot.val().toString() == questionsToBeChanged[questionAnswerSnapshot.key][key]) {
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
            }).then(function () {
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


        // Functions for autocomplete functionality on user search
        var data = {};
        vm.setUserList = function () {
            var dataRef = firebase.database().ref('users/');

            dataRef.once('value').then(function (snapshot) {
                snapshot.forEach(function (IDSnapshot) {
                    data[IDSnapshot.key.toString()] = null;
                    data[IDSnapshot.child("email").val().toString()] = null;
                    data[IDSnapshot.child("userName").val().toString()] = null;
                });
            }).then(function () {
                $('input.autocomplete').autocomplete({
                    data,
                    limit: 10,
                    onAutocomplete: function (val) {

                    },
                    minlength: 1,
                });
            });
        }
        vm.setUserList();



    }
})();