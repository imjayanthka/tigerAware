/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('StudyNavService',['$http', function StudyNavService($http){

      var blueprints = {};
      var survey_blueprints = {};

      return{
         setUserSurveys: setUserSurveys,
         getSurveyByInd: getSurveyByInd
      };

      function getSurveyByInd(index, callback){
         // This could be used by storing blueprints in controller scope too
         setUserSurveys('user1', function(blueprints){
            for (var key in blueprints) {
               if (blueprints.hasOwnProperty(key)){
                  if(blueprints[key]['survey_id'] == index){
                     callback(blueprints[key]);
                  }
               }
            }
         });
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
                     study_information['survey_id'] = survey_id;
                     study_information['name'] = childData.name;
                     study_information['survey'] = childData.survey;
                     study_information['img_url'] = 'resources/images/stock/stock' + survey_id + '.jpeg';

                     shallow_dataRef = firebase.database().ref('data/' + childSnapshot.key);
                     shallow_dataRef.once('value', function(snapshot_data){
                        if (snapshot_data.val() != null){
                           study_information['answers'] = snapshot_data.val().answers;
                        }else{
                           study_information['answers'] = null;
                        }
                     });
                     blueprints[childKey] = study_information;
                  }
                  survey_id += 1;
               });
               survey_blueprints = blueprints;
               callback(blueprints);
            });
         })
   }
   }]);
}) ();