
(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('BuilderController', BuilderController);
   BuilderController.$inject = ['$scope','$location','$firebaseAuth', '$firebaseArray', '$routeParams', 'StudyNavService'];

   function BuilderController($scope,location, $firebaseAuth, $firebaseArray, $routeParams, StudyNavService){

      var vm=this;
      var editing = false;
      var editInd;
      vm.auth = $firebaseAuth();
      vm.steps = [];

      //check auth, otherwise redirect. This needs to be defined in order to hit the users/ ref
      var auth = $firebaseAuth();
      var firebaseUser = auth.$getAuth();
      if (!firebaseUser) {
         location.path('/login');
      }

      Materialize.updateTextFields();

      vm.surveyName = "";

      vm.currentQuestion = {
         title: "",
         id: "",
         type: "",
         subtitle: "",
         on: "",
         conditionID: ""
      }

      vm.editSurvey = function(surveySchema){
         vm.updating = true;
         vm.surveyName = surveySchema.name;
         surveySchema.survey.forEach(function(question){
            vm.steps.push(question);
         });
      }
      vm.newFromTemplate = function(surveySchema){
         vm.surveyName = surveySchema.name;
         surveySchema.survey.forEach(function(question){
            vm.steps.push(question);
         });
      }
      initBuilderController();
      function initBuilderController(){
         vm.updating = false;
         if($routeParams['id']){
            vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['id']);
            var surveySchema = vm.surveySchema;
            // once answer loading bug is fixed, a conditional check needs to be added to ensure there aren't answers.
            // If answers, the user should be rerouted to /overview
            vm.editSurvey(surveySchema);
         }
         else if($routeParams['tempid']){
            vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['tempid']);
            var surveySchema = vm.surveySchema;
            // once answer loading bug is fixed, a conditional check needs to be added to ensure there aren't answers.
            // If answers, the user should be rerouted to /overview
            vm.newFromTemplate(surveySchema);
         }
         $('select').material_select();
         $("#navBack").click(function(){
            history.go(-1);
         });

      }
      initModal();
      function initModal(){
         $('#modal-question').modal();
         $('#modal-cancel').modal();
         Materialize.updateTextFields();
         $('#modal-question').modal({
            dismissible: false,
            opacity: .7,
            in_duration: 300,
            out_duration: 200,
            starting_top: '4%',
            ending_top: '10%',
            ready: function(modal, trigger) {}
         });
         vm.showQuestionModal =false;
         vm.showCancelModal = false;
      }
      vm.hideCancel = function(){
         $('#modal-cancel').modal('close');
         vm.showCancelModal = false;
      }
      vm.openQuestionModal = function(){
         vm.showQuestionModal=true;
         $('#modal-question').modal('open');
      }
      vm.openCancelModal = function(){
         vm.showCancelModal=true;
         $('#modal-cancel').modal('open');
      }
      // Survey wide operations
      vm.saveNewSurvey = function(){
         if (vm.surveyName.length === 0){
            Materialize.toast("Please add a survey title", 3000, 'rounded');
            return;
         }
         else if (vm.steps.length === 0){
            Materialize.toast("Please add a survey question", 3000, 'rounded');
            return;
         }
         if(vm.updating){
            vm.updateExistingSurvey();
            return;
         }

         var survey = vm.steps;
         var surveysRef = firebase.database().ref('blueprints');
         var surveyList = $firebaseArray(surveysRef);
         surveyList.$add({
            survey,
            name: vm.surveyName,
            user: "Will" // update to match current user name
         }).then(function(ref) {

            var usersRef = firebase.database().ref('users/' + firebaseUser.uid + '/surveys');
            var userSurveyList = $firebaseArray(usersRef);
            userSurveyList.$add(ref.key).then(function(ref) {

            }, function(error) {
               console.log("Error updating surveys:", error);
            });

         }, function(error) {
            console.log("Error updating surveys:", error);
         });
         Materialize.toast('Successfully created survey', 2000, 'rounded grey-text text-darken-4 green lighten-3 center-align');
         location.path('/overview');
      }
      vm.cancelSurvey = function(){
         vm.showCancelModal=false;
         $('#modal-cancel').modal('close');
         location.path('/overview');
      }
      vm.updateExistingSurvey = function(){
         var survey = vm.steps;
         var name = vm.surveyName;
         var surveysRef = firebase.database().ref('blueprints');
         var surveyList = $firebaseArray(surveysRef);

         surveyList.$loaded().then(function(surveyList) {
            var updateInd = surveyList.$indexFor(vm.surveySchema['survey_key']);
            if(updateInd !== -1){

               surveyList[updateInd].survey = survey;
               surveyList[updateInd].name = name;
               surveyList[updateInd].user = "Will" // should match auth user name.

               surveyList.$save(updateInd).then(function(ref){
                  Materialize.toast('Successfully updated survey', 2000, 'rounded grey-text text-darken-4 blue lighten-3 center-align');
               }).catch(function(error){
                  console.log(error);
               });
            }else{
               console.log("Error: record for update not found");
            }
        })
        .catch(function(error) {
          console.log("Error:", error);
        })
      }
      vm.deleteQuestion = function(index){
         if (index > -1) {
            vm.steps.splice(index, 1);
         };
      }
      vm.editQuestion = function(index){

         vm.currentQuestion = {
            title: vm.steps[index].title,
            id: vm.steps[index].id,
            type: vm.steps[index].type,
            subtitle: vm.steps[index].subtitle,
            on: vm.steps[index].on,
            conditionID: vm.steps[index].conditionID
         }
         editing = true;
         editInd = index;
         vm.showQuestionModal=true;
         $('#modal-question').modal('open');
      }

      vm.saveNewQuestion = function(){
         var step = {
            title: vm.currentQuestion.title,
            id: vm.currentQuestion.id,
            type: $("#type").val(),
            subtitle: vm.currentQuestion.subtitle,
            on: vm.currentQuestion.on,
            conditionID: vm.currentQuestion.conditionID
         }
         if(editing == true){
            vm.steps[editInd] = step;
            editing = false;
         }else{
            vm.steps.push(step);
         }

         vm.showQuestionModal =false;
         $('#modal-question').modal('close');
         vm.currentQuestion = {
            title: "",
            id: "",
            type: "",
            subtitle: "",
            on: "",
            conditionID: ""
         }
      }

      vm.cancelNewQuestion = function(){
         vm.showQuestionModal =false;
         $('#modal-question').modal('close');
      }

      vm.initiateLogOut = function(){
         vm.auth.$signOut();
         location.path('/logout');
         vm.message = "You have Logged out successfully!"
         Materialize.toast(vm.message, 7000, 'rounded');
      }
    }
})();
