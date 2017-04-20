
(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('BuilderController', BuilderController);
   BuilderController.$inject = ['$scope','$location','$firebaseAuth', '$firebaseArray'];

   function BuilderController($scope,location, $firebaseAuth, $firebaseArray){

      var vm=this;
      var editing = false;
      var editInd;
      vm.auth = $firebaseAuth();
      vm.steps = [];

      Materialize.updateTextFields();

      vm.currentQuestion = {
         title: "",
         id: "",
         type: "",
         subtitle: "",
         on: "",
         conditionID: ""
      }


      initBuilderController();
      function initBuilderController(){

         $('select').material_select();

         $("#navBack").click(function(){
            history.go(-1);
         });

      }
      initModal();
      function initModal(){
         $('#modal-question').modal();
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
      }

      vm.openQuestionModal = function(){

         vm.showQuestionModal=true;
         $('#modal-question').modal('open');
      }

      vm.saveNewSurvey = function(){
         console.log('new survey');
         // var database = firebase.database();
         var survey = vm.steps;

         var surveysRef = firebase.database().ref('blueprints');
         var sr_key;
         var surveyList = $firebaseArray(surveysRef);
         surveyList.$add({
            survey,
            name: $('#surveyname').val()
         }).then(function(ref) {

            var usersRef = firebase.database().ref('users/user1/surveys');
            var userSurveyList = $firebaseArray(usersRef);
            userSurveyList.$add(ref.key).then(function(ref) {

            }, function(error) {
               console.log("Error updating surveys:", error);
            });

         }, function(error) {
            console.log("Error updating surveys:", error);
         });


         // firebase.database().ref('users/user1/surveys').push().set(postRef.key);
         // // localStorage.removeItem("survey");
         // alert("Survey Successfully Made");
         // window.location.href = "createStep.html";
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
         console.log('delete question');
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
