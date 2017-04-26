
/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('StudyNavService',['$http', 'dynamicGraphService', 'localStorageService', function StudyNavService($http, dynamicGraphService, localStorageService){

      var blueprints = {};
      var user_blueprints = {};

      return{
         setUserSurveys: setUserSurveys,
         getUserSurveys: getUserSurveys,
         getSurveyByInd: getSurveyByInd
      };

      function getUserSurveys(){
         return localStorageService.get('usersurveys');
      }

      function getSurveyByInd(index){
         var user_blueprints = localStorageService.get('usersurveys');
         for (var key in user_blueprints) {
            if (user_blueprints.hasOwnProperty(key)){
               if(user_blueprints[key]['survey_id'] == index){
                  return user_blueprints[key];
               }
            }
         }
      }

      function setUserSurveys(username, callback){
         var user_surveys = []
         var userRef = firebase.database().ref('users/' + username + '/surveys/');
         userRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
               user_surveys.push(childSnapshot.val());
            });
         }).then(function(){

            // Parse through data blueprint & retreive corresponding data
            var blueprintRef = firebase.database().ref('blueprints/');

            //Iterate through all study blueprints and save data
            blueprintRef.once('value', function(snapshot) {
               var survey_id = 1;
               snapshot.forEach(function(childSnapshot) {
                  var study_information = {}
                  var childKey = childSnapshot.key;
                  var childData = childSnapshot.val();

                  // Scope result to surveys owned by current user
                  if (-1 !== $.inArray(childSnapshot.key, user_surveys)){
                     study_information['survey_key'] = childKey;
                     study_information['survey_id'] = survey_id;
                     study_information['name'] = childData.name;
                     study_information['survey'] = childData.survey;
                     study_information['img_url'] = 'resources/images/stock/stock' + survey_id + '.jpeg';

                     shallow_dataRef = firebase.database().ref('data/' + childSnapshot.key);
                     shallow_dataRef.once('value', function(snapshot_data){
                        if (snapshot_data.val() != null){
                           study_information['answers'] = snapshot_data.val().answers;
                           study_information['num_responses'] = Object.keys(snapshot_data.val().answers).length;
                        }else{
                           study_information['answers'] = null;
                           study_information['num_responses'] = 0;
                        }
                     });
                     blueprints[childKey] = study_information;
                  }
                  survey_id += 1;
               });
               user_blueprints = blueprints;
               localStorageService.set('usersurveys', user_blueprints);

               callback(blueprints);
            });
         })
   }
   }]);
}) ();

