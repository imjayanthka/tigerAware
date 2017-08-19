
(function(){

  /***** Controller for Overview page *****/
  "use strict";
  angular.module('researchApp')
  .controller('BuilderController', BuilderController);
  BuilderController.$inject = ['$scope','$location','$firebaseAuth', '$firebaseArray', '$routeParams', 'StudyNavService', '$timeout'];

  function BuilderController($scope, location, $firebaseAuth, $firebaseArray, $routeParams, StudyNavService, $timeout){
    // preventTouchstartError()

    var vm=this;
    var editing = false;
    var editInd;
    vm.stepsArray = [];
    vm.auth = $firebaseAuth();
    vm.steps = [];
    vm.conditionals = [];
    vm.filteredQs = [];
    vm.conditional_index = null;
    vm.priceSlider = {
      options: {
        stepsArray:[]
      }
    };

    // Remove touchstart issue
    document.getElementById('scaleQuestionType').addEventListener('touchstart', vm.showSlider, {passive: true});

    //check auth, otherwise redirect. This needs to be defined in order to hit the users/ ref
    var auth = $firebaseAuth();
    var firebaseUser = auth.$getAuth();
    if (!firebaseUser) {
      //location.path('/login');
    }

    Materialize.updateTextFields();

    vm.surveyName = "";

    vm.currentQuestion = {
      title: "",
      id: "",
      type: "",
      subtitle: "",
      on: [],
      conditionID: [],
      multipleSelect: ""
    }
    
    // For MCQs
    vm.choices = [
      {
        'id': "1",
        'option_tag': ""
      },
      {
        'id': "2",
        'option_tag': ""
      }
    ];

    // For Datetime Constraints
    vm.constraints = [
      {
        "id" : "both",
        "value" : ""
      },
      {
        "id" : "prior",
        "value" : ""
      },
      {
        "id" : "multiple",
        "value" : ""
      }
    ];

    vm.editSurvey = function(surveySchema){
      vm.updating = true;
      vm.surveyName = surveySchema.name;
      surveySchema.survey.forEach(function(question){
        vm.steps.push(question);
      });
    };

    vm.newFromTemplate = function(surveySchema){
      vm.surveyName = surveySchema.name;
      surveySchema.survey.forEach(function(question){
        vm.steps.push(question);
      });
    }

    // Initialize Builder
    initBuilderController();
    function initBuilderController(){
      vm.updating = false;
      if($routeParams['id']){
        vm.surveySchema = StudyNavService.getSurveyByInd($routeParams['id']);
        var surveySchema = vm.surveySchema;
        // once answer loading bug is fixed, a conditional check needs to be added to ensure there aren't answers.
        // If answers, the user should be rerouted to /overview
        vm.editSurvey(surveySchema);
      } else if($routeParams['tempid']){
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

    // Initialize Modal
    initModal();
    function initModal(){
      $('#modal-question').modal();
      $('#modal-cancel').modal();
      $('#modal-conditional').modal();
      $('#modal-legends').modal({
        dismissible: false,
        opacity: .7,
        in_duration: 300,
        out_duration: 200,
        starting_top: '4%',
        ending_top: '10%',
        ready: function (modal, trigger) { },
        complete: function () {
          if(vm.legend != ""){
            vm.priceSlider.options.stepsArray[vm.legendValue - 1].legend = vm.legend;
          }
        }
      });
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
      vm.showConditionalModel = false;
      vm.showLegendsModel = false
    }

    // Close modal on cancel
    vm.hideCancel = function(){
      $('#modal-cancel').modal('open');
      vm.showCancelModal = false;
    }

    // Open modal to add question
    vm.openQuestionModal = function(){
      vm.showQuestionModal=true;

      // Reset modal select to "Select One"
      var count = 0;
      $("#type option:selected").each(function(){
        if(count == 0){
          $(this).prop("selected",true);  
        } else {
          $(this).prop("selected",false);
        }
        count++;
      });
      $("#type").material_select();

      // Open Modal
      $('#modal-question').modal('open');
    }

    // Open Modal when cancelling survey
    vm.openCancelModal = function(){
      vm.showCancelModal=true;
      $('#modal-cancel').modal('open');
    }

    /***** Survey wide operations *****/

    // Save Survey
    vm.saveNewSurvey = function(){
      if (vm.surveyName.length === 0){
        Materialize.toast("Please add a survey title", 3000, 'rounded');
        return;
      } else if (vm.steps.length === 0){
        Materialize.toast("Please add a survey question", 3000, 'rounded');
        return;
      }

      // If updating existing survey 
      if(vm.updating){
        vm.updateExistingSurvey();
        return;
      }

      // If new survey
      var survey = vm.steps;
      console.log(survey);
      var surveysRef = firebase.database().ref('blueprints');
      var surveyList = $firebaseArray(surveysRef);
      surveyList.$add({
        survey,
        name: vm.surveyName,
        user: "Nishant", // update to match current user name
        conditionals: vm.conditionals
      }).then(function(ref) {
          var usersRef = firebase.database().ref('users/' + firebaseUser.uid + '/surveys');
          var userSurveyList = $firebaseArray(usersRef);
          userSurveyList.$add(ref.key).then(function(ref) {
            // console.log("Ref:",ref);
          }, function(error) {
            console.log("Error updating surveys:", error);
          });
        }, function(error) {
          console.log("Error updating surveys:", error);
      });
      Materialize.toast('Successfully created survey', 2000, 'rounded grey-text text-darken-4 green lighten-3 center-align');
      location.path('/overview');
    } // end vm.saveNewSurvey 

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
          surveyList[updateInd].user = "Nishant" // should match auth user name.
          surveyList[updateInd].conditionals = vm.conditionals
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
    } // end vm.updateExistingSurvey
   
    vm.deleteQuestion = function(index){
      if (index > -1) {
        vm.steps.splice(index, 1);
      };
    }

    // Edit Existing Question
    vm.editQuestion = function(index){
      vm.currentQuestion = {
        title: vm.steps[index].title,
        id: vm.steps[index].id,
        type: vm.steps[index].type,
        subtitle: vm.steps[index].subtitle,
        on: vm.steps[index].on,
        conditionID: vm.steps[index].conditionID
      }
      if(vm.currentQuestion.type == "MultipleChoice"){
        for(var i = 0; i < vm.steps[index].choices.length; i++){
          vm.choices[i] = {
            id: i+1,
            option_tag: vm.steps[index].choices[i]
          }
        }
      }
      editing = true;
      editInd = index;
      vm.showQuestionModal=true;
      $('#modal-question').modal('open');
    } // end vm.editQuestion

    // Save New Question
    vm.saveNewQuestion = function(){
      var qtype = $("#type option:selected").val();
      if(qtype.length == 0){
        Materialize.toast("Please select a question type or cancel to exit", 4000, 'rounded');
      } else {

        // Datetime and constraints
        if(qtype == "dateTime"){
          var both = $("#both").prop("checked");
          var prior = $("#prior").prop("checked");
          var multiple = $("#multiple").prop("checked");

          var step = {
            title: vm.currentQuestion.title,
            id: vm.currentQuestion.id,
            type: qtype,
            subtitle: vm.currentQuestion.subtitle,
            both: both,
            prior: prior,
            multiple: multiple
          }

          // If editing existing question
          if(editing == true){
            vm.steps[editInd] = step;
            editing = false;
          } else{
            vm.steps.push(step);
          }

          vm.showQuestionModal = false;
          $('#modal-question').modal('close');

          vm.currentQuestion = {
            title: "",
            id: "",
            type: "",
            subtitle: "",
            both: "",
            prior: "",
            multiple: ""
          }
        }


        // Makes sure mcq question has at least 2 options selected
        // Does not validate options
        if(qtype == 'MultipleChoice' && vm.choices.length < 2){
          Materialize.toast("Select at least 2 options for MCQs", 4000, 'rounded');
          return;
        } else if (qtype == 'MultipleChoice' && vm.choices.length >= 2) {
          var multipleSelect = $("#multipleSelect").prop("checked");
          var step = {
            title: vm.currentQuestion.title,
            id: vm.currentQuestion.id,
            type: qtype,
            subtitle: vm.currentQuestion.subtitle,
            on: vm.currentQuestion.on,
            conditionID: vm.currentQuestion.conditionID,
            multipleSelect: multipleSelect
          }

          // Multiple choice option handler
          if(vm.currentQuestion.type == "MultipleChoice"){
            var choices_array = [];
            for (var i = 0; i < vm.choices.length; i++){
              choices_array.push(vm.choices[i].option_tag);
            }
            step.choices =  choices_array;
          }
            
          // If editing existing question
          if(editing == true){
            vm.steps[editInd] = step;
            editing = false;
          } else{
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
            conditionID: "",
            multipleSelect: ""
          }
            
          vm.choices = [
            {
              'id': "1",
              'option_tag': ""
            },
            {
              'id': "2",
              'option_tag': ""
            }
          ];
        } // end mcq else
      } // end qypte.length else
    } // end vm.savequestion        
    
    // Close Question Modal
    vm.cancelNewQuestion = function(){
      vm.showQuestionModal =false;
      $('#modal-question').modal('close');
    }

    /***** Functionality For Controlling UI for MCQ *****/
    // Add Option
    vm.addChoice = function(){
      var newIndex = vm.choices.length + 1;
      vm.choices.push({'id': ''+ newIndex, 'value':""});
    }

    // Remove Option
    vm.removeChoice = function(choice){
      var choiceId = choice.id - 1;
      vm.choices.splice(choiceId, 1);
      for (var item in vm.choices){
        if (item.id > choice.id){
          item.id(Number(item.id) - 1).toString();
        }
      }
    }
    
    vm.showDeleteButton = function(){
      return vm.choices.length > 2;
    }
    
    // Show Add Button
    vm.showAddButton = function(choice){
      if(choice !== undefined){
        return choice.id === vm.choices[vm.choices.length-1].id;
      }
    }
    /***** End - Functionality For Controlling UI for MCQ *****/

    //Functionality For Conditionals
    vm.getFilteredQs = function(value) {
        var filteredQs = [];
        for (var i = 0; i < vm.steps.length; i++) {
          if (vm.steps[i].id != value) {
            filteredQs.push(vm.steps[i]);
          }
        }
        return filteredQs;
    };

    vm.addCondition = function(questionData){
      vm.conditional_index = vm.steps.indexOf(questionData)
      if(questionData.conditionID != ""){
        vm.conditionals = questionData.conditionID;
      } else {
        if(questionData.type == 'multipleChoice' || questionData.type == 'MultipleChoice'){
          for(var i = 0; i < questionData.choices.length; i++){
            vm.conditionals.push({from: questionData.id, on: questionData.choices[i], to: ""})
          }
        }
        if(questionData.type == 'yesNo'){
          vm.conditionals[0] = {from: questionData.id, on: 'yes', to: ""};
          vm.conditionals[1] = {from: questionData.id,on: 'no', to: ""};
        }
      }
      vm.filteredQs = vm.getFilteredQs(questionData.id);
      vm.showConditionalModel = true;
      $('#modal-conditional').modal('open');
    };

    vm.cancelConditional = function(){
      vm.conditionals = [];
      vm.filteredQs = [];
      vm.conditional_index = null;
      vm.showConditionalModel = false;
      $('#modal-conditional').modal('close');
    }

    vm.onClickAddConditional = function(){
      console.log(vm.conditionals);
      vm.steps[vm.conditional_index].conditionID = vm.conditionals;
      console.log(vm.steps);
      vm.conditionals = [];
      vm.filteredQs = [];
      vm.conditional_index = null;
      vm.showConditionalModel = false;
      $('#modal-conditional').modal('close');
    }

    // RZ SLIDER
    vm.showSlider = function(stepCount){
      if(isNaN(stepCount)){
        return false;
      } else {
        vm.priceSlider.options.floor = 1;
        vm.priceSlider.options.ceil = stepCount;
        vm.priceSlider.options.steps = 1;
        vm.priceSlider.options.showTicksValues =  true;
        vm.priceSlider.options.showTicks =  true;
        vm.priceSlider.options.stepsArray = vm.stepsArray;
        
        if(vm.stepsArray.length == 0){
          for(var i = 1; i <= stepCount; i++){
            vm.priceSlider.options.stepsArray.push({
              value: i,
              legend: ""
            });
          }
        } else {
          vm.priceSlider.options.stepsArray = [];
          for(var i = 1; i <= stepCount; i++){
            vm.priceSlider.options.stepsArray.push({
              value: i,
              legend: ""
            });
          }
        }

        // When a slider option is clicked
        vm.priceSlider.options.onChange = function(sliderId, modelValue, highValue, pointerType){
          vm.showLegendsModel = true;
          vm.legendValue = modelValue;
          $('#modal-legends').modal('open');
        }

        vm.refreshSlider();
        return true;
      }
    }

    // Add legend to each step value
    vm.refreshSlider = function () {
      $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
        // $scope.$broadcast('reCalcViewDimensions');
      });
    }

    // Update slider with new legend value
    vm.closeLegend = function (action, stepCount) {
      if(action == "cancel"){
        $('#modal-legends').modal('close');
        vm.showLegendsModel = false;
        return false;
      } else if(action == "save"){
        if(vm.legend != ""){
          if(vm.stepsArray.length == 0){
            vm.stepsArray = [];
          }
          for(var i = 1; i <= stepCount; i++){
            if(i == vm.legendValue){
              vm.stepsArray[i-1]["legend"] = vm.legend;
            }
          }
        } 
        vm.refreshSlider();
        $('#modal-legends').modal('close');
        vm.showLegendsModel = false;
      }
    }

    // Logout
    vm.initiateLogOut = function(){
     vm.auth.$signOut();
     location.path('/logout');
     vm.message = "You have Logged out successfully!"
     Materialize.toast(vm.message, 7000, 'rounded');
   }
 }
})();