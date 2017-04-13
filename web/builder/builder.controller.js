
(function(){

  /***** Controller for Overview page *****/
   "use strict";
   angular.module('researchApp')
   .controller('BuilderController', BuilderController);
   BuilderController.$inject = ['$scope','$location','$firebaseAuth'];

   function BuilderController($scope,location, $firebaseAuth){

      var vm=this;
      vm.auth = $firebaseAuth();
      vm.steps = [];

      vm.showSurveyQuestions = function(){
         console.log(vm.steps);
         var x = document.getElementById("mainTable");
         x.innerHTML = "";
         for(var i = 0; i< vm.steps.length; i++){
            var row = x.insertRow(i);
            row.innerHTML = '<td><b>'+ vm.steps[i].id+'</b></td><td>'+ vm.steps[i].type+'</td><td><a class="btn-floating waves-effect waves-light red accent-1"><i class="material-icons">delete</i></a></td><td><a class="btn-floating waves-effect waves-light blue accent-1"><i class="material-icons">border_color</i></a></td>';
         }
      }

      initBuilderController();
      function initBuilderController(){

         $('select').material_select();
         vm.showSurveyQuestions();
         $("#navBack").click(function(){
            history.go(-1);
         });

      }
      initModal();
      function initModal(){
         $('#modal-question').modal();

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
         // var survey = JSON.parse(window.localStorage.getItem("survey"));
         // var postRef = firebase.database().ref('blueprints').push();
         // postRef.set({survey, 'name':$('#name').val(), user});
         // firebase.database().ref('users/'+uid+'/surveys').push().set(postRef.key);
         // localStorage.removeItem("survey");
         // alert("Survey Successfully Made");
         // window.location.href = "createStep.html";
      }



      vm.saveNewQuestion = function(question){
         // question.subtitle defined, when do we store?

         var step = {
            'title': question.title,
            'id': question.label,
            'type': $('#type').val(),
            'on': "",
            'conditionID': ""
         }
         vm.steps.push(step);
         vm.showSurveyQuestions()
         vm.showQuestionModal =false;
         $('#modal-question').modal('close');
      }

      vm.cancelNewQuestion = function(){
         console.log('delete question');
         vm.showQuestionModal =false;
         $('#modal-question').modal('close');
         $scope.questionForm.$setPristine(); // Needs to reset info not currently working
      }

      vm.initiateLogOut = function(){
         vm.auth.$signOut();
         location.path('/logout');
         vm.message = "You have Logged out successfully!"
         Materialize.toast(vm.message, 7000, 'rounded');
      }
    }
})();
