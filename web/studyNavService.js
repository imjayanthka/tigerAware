
/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function () {
    angular.module('researchApp').service('StudyNavService', StudyNavService)
    StudyNavService.$inject = ['$http', 'dynamicGraphService', 'localStorageService', '$firebaseArray'];

    function StudyNavService($http, dynamicGraphService, localStorageService, $firebaseArray) {
        return {
            setUserSurveys: setUserSurveys,
            setSurveyResponse: setSurveyResponse,
            getUserSurveys: getUserSurveys,
            getSurveyByInd: getSurveyByInd,
            getAllSurveyInformation: getAllSurveyInformation
        };
        /* Get All Studies */
        //TODO: Need to update it for User Profile Page
        function getAllSurveyInformation() {
            var blueprintRef = firebase.database().ref('blueprints/');
            var promise = blueprintRef.once('value').then(function (snapshots) {
                var all_surveys = [];
                snapshots.forEach(function (snapshot, index) {
                    var each_sample = {}
                    each_sample.id = snapshot.key;
                    each_sample.name = snapshot.val().name;
                    each_sample.surveys = snapshot.val().survey;
                    each_sample.user = snapshot.val().user;
                    each_sample.imgUrl = 'resources/images/stock/stock2.jpeg'
                    all_surveys.push(each_sample)
                });
                return all_surveys;
            });
            promise.then(function (all_surveys) {
                return all_surveys;
            });
            return promise;
        }
        function getUserSurveys() {
            return localStorageService.get('usersurveys');
        }

        function getSurveyByInd(index) {
            var user_blueprints = localStorageService.get('usersurveys');
            for (var key in user_blueprints) {
                if (user_blueprints.hasOwnProperty(key)) {
                    if (user_blueprints[key]['survey_id'] == index) {
                        return user_blueprints[key];
                    }
                }
            }
        }

        function setUserSurveys(username) {
            var user_blueprints = {};
            var userRef = firebase.database().ref('users/' + username + '/surveys/');
            var user_surveys_promise = userRef.once('value').then(function (snapshot) {
                var user_surveys = []
                snapshot.forEach(function (childSnapshot) {
                    user_surveys.push(childSnapshot.val());
                });
                return user_surveys;
            }).then(function (user_surveys) {
                var blueprintRef = firebase.database().ref('blueprints/');
                return blueprintRef.once('value').then(function (snapshot) {
                    var blueprints = {}
                    var survey_id = 1;
                    snapshot.forEach(function (childSnapshot) {
                        var study_information = {}
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();

                        // Scope result to surveys owned by current user
                        if (-1 !== $.inArray(childSnapshot.key, user_surveys)) {
                            study_information['survey_key'] = childKey;
                            study_information['survey_id'] = survey_id;
                            study_information['name'] = childData.name;
                            study_information['survey'] = childData.survey;
                            study_information['img_url'] = 'resources/images/stock/stock' + survey_id + '.jpeg';
                            study_information['answers'] = null;
                            study_information['num_responses'] = 0;
                            blueprints[childKey] = study_information;
                        }
                        survey_id += 1;
                    });
                    return blueprints
                })
            }).then(function (blueprints) {
                user_blueprints = blueprints
                var keys = Object.keys(blueprints)
                var promises = []

                keys.forEach(function (key) {
                    var shallow_dataRef = firebase.database().ref('data/' + key);
                    promises.push(shallow_dataRef.once('value'))
                });
                return Promise.all(promises)
            }).then(function (snapshots) {
                //After returning a promise
                snapshots.forEach(function (snapshot) {
                    console.log(snapshot)
                    if (snapshot.val() != null) {
                        user_blueprints[snapshot.key]['answers'] = snapshot.val().answers;
                        user_blueprints[snapshot.key]['num_responses'] = Object.keys(snapshot.val().answers).length;
                    }
                })
                return user_blueprints;
            });
            return user_surveys_promise
            /*********** Old Code ******************/
            // userRef.once('value', function(snapshot) {
            //    snapshot.forEach(function(childSnapshot) {
            //       user_surveys.push(childSnapshot.val());
            //    });
            // }).then(function(){

            //    // Parse through data blueprint & retreive corresponding data
            //    var blueprintRef = firebase.database().ref('blueprints/');

            //    //Iterate through all study blueprints and save data
            //    blueprintRef.once('value', function(snapshot) {
            //       var survey_id = 1;
            //       snapshot.forEach(function(childSnapshot) {
            //          var study_information = {}
            //          var childKey = childSnapshot.key;
            //          var childData = childSnapshot.val();

            //          // Scope result to surveys owned by current user
            //          if (-1 !== $.inArray(childSnapshot.key, user_surveys)){
            //             study_information['survey_key'] = childKey;
            //             study_information['survey_id'] = survey_id;
            //             study_information['name'] = childData.name;
            //             study_information['survey'] = childData.survey;
            //             study_information['img_url'] = 'resources/images/stock/stock' + survey_id + '.jpeg';

            //             shallow_dataRef = firebase.database().ref('data/' + childSnapshot.key);
            //             shallow_dataRef.once('value', function(snapshot_data){
            //                if (snapshot_data.val() != null){
            //                   study_information['answers'] = snapshot_data.val().answers;
            //                   study_information['num_responses'] = Object.keys(snapshot_data.val().answers).length;
            //                }else{
            //                   study_information['answers'] = null;
            //                   study_information['num_responses'] = 0;
            //                }
            //             });
            //             blueprints[childKey] = study_information;
            //          }
            //          survey_id += 1;
            //       });
            //       user_blueprints = blueprints;
            //       localStorageService.set('usersurveys', user_blueprints);
            //       callback(blueprints);
            //    });
            // })
        }

        function setSurveyResponse(surveyId, responses) {
            console.log(surveyId)
            var dataRef = firebase.database().ref('data/');
            dataRef.child(surveyId).child('answers').push().set({
                surveyData: responses
            })       
        }
    }
})();

