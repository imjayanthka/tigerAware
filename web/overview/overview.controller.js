(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('OverviewController', OverviewController);
   OverviewController.$inject = ['$scope','$rootScope','$http','OverviewConstants','$timeout','$location','$firebaseAuth'];

   function OverviewController($scope,$rootScope,http,OverviewConstants,timeout,location, $firebaseAuth){

            var vm=this;
            vm.initOverviewController=initOverviewController;
            vm.auth = $firebaseAuth();
            vm.firebaseUser = vm.auth.$getAuth();
            vm.user_surveys_grid = retrieveUserSurveys();
            console.log(vm.user_surveys_grid);


            var ref = firebase.database().ref();

            timeout(initOverviewController,500);
            function initOverviewController(){

                $(".dropdown-button").dropdown();
                $(".button-collapse").sideNav();
                $('.parallax').parallax();
                $("#navBack").click(function(){
                   history.go(-1);
                });
                vm.studyConstants=OverviewConstants;
            }

            function retrieveUserSurveys(){
               //Get current user. Retrieve all surveys corresponding to the user.
               var user_surveys = []
               // This needs to be scoped to the current user e.g (users/ ' current userid' + surveys)
               var userRef = firebase.database().ref('users/user1/surveys/');
               userRef.once('value', function(snapshot) {
                  snapshot.forEach(function(childSnapshot) {
                     user_surveys.push(childSnapshot.val());
                  });
               }).then(function(){

                  var demo_study;
                  // Parse through data blueprint & retreive corresponding data
                  var blueprintRef = firebase.database().ref('blueprints/');
                  var blueprints = []

                  //Iterate through all study blueprints and save data
                  blueprintRef.once('value', function(snapshot) {
                     var img_index = 1;
                     snapshot.forEach(function(childSnapshot, i) {
                        console.log(i);
                        var study_information = {}
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();

                        // Scope result to surveys owned by current user
                        if (-1 !== $.inArray(childSnapshot.key, user_surveys)){
                           study_information['name'] = childData.name;
                           study_information['survey'] = childData.survey;

                           firebase.database().ref('data/' + childSnapshot.key).once('value', function(snapshot_data){
                              if (snapshot_data.val() != null){
                                 study_information['answers'] = snapshot_data.val().answers;
                                 study_information['num_responses'] = Object.keys(snapshot_data.val().answers).length;
                              }else{
                                 study_information['answers'] = null;
                                 study_information['num_responses'] = 0;
                              }
                           });
                           study_information['img_url'] = "resources/images/stock/stock" + img_index + ".jpeg";
                           img_index += 1;
                           blueprints.push(study_information);
                        }
                     });

                     vm.user_surveys_grid = []
                     var survey_row = [];
                     blueprints.forEach(function(survey, key){
                        if(key % 4 == 0){
                           survey_row = [];
                           survey_row.push(survey);
                           console.log(survey, key);
                        }
                        else if ((key % 4) - 1 == 0){
                           survey_row.push(survey);
                           vm.user_surveys_grid.push(survey_row)
                        }
                        else{
                           survey_row.push(survey);
                        }
                     });
                     console.log(vm.user_surveys_grid);
                  });
               })
            }

            function create_studies_grid(){
            }

            vm.directToStudy = function(link) {
                location.path('/'+link);
            }
            vm.initiateLogOut = function(){
                vm.auth.$signOut();
                location.path('/logout');
                vm.message = "You have Logged out successfully!"
                Materialize.toast(vm.message, 7000, 'rounded');
            }
    }
})();
