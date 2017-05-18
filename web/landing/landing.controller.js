(function(){
   /***** Landing Page Controller
   - Handles both login and register modal *****/
   "use strict";
   angular
      .module('researchApp')
      .controller('LandingController', LandingController);
   LandingController.$inject = ['$scope','$rootScope','$http','$location', '$firebaseAuth','$firebaseArray'];

   function LandingController($scope,$rootScope,http,location, $firebaseAuth, $firebaseArray){

      var vm = this;
      vm.directToLogin=directToLogin;
      vm.initModal = initModal;
      vm.directToRegister=directToRegister;
      vm.showLoginModal=false;
      vm.showRegisterModal =false;
      vm.cancelClicked =cancelClicked;

      initModal();
      function initModal(){
         $('#modal1').modal();
         $('#modal2').modal();
         $('#modal1, #modal2').modal({
            dismissible: true,
            opacity: .5,
            in_duration: 300,
            out_duration: 200,
            starting_top: '4%',
            ending_top: '10%',
            ready: function(modal, trigger) {}
         });
         vm.showLoginModal=false;
         vm.showRegisterModal =false;
      }

      function directToLogin(){
         vm.message ="";
         vm.showLoginModal=true;
         $('#modal1').modal('open');
      }
      function directToRegister(){
         vm.showRegisterModal = true;
         $('#modal2').modal('open');
      }

      vm.authUserGoogle = function() {
         var provider = new firebase.auth.GoogleAuthProvider();
         var auth = $firebaseAuth();
         Materialize.toast("Registration using Google is not supported at this time", 3000, 'rounded');

         //This code below will work - however, it is not supported on mobile yet so not being used for consistancy. Once used, name will also need to be stored.
         // auth.$signInWithPopup(provider).then(function(firebaseUser) {
         //    $('#modal1').modal('close');
         //    $('#modal2').modal('close');
         //    location.path('/overview');
         // }).catch(function(error) {
         //   var errorCode = error.code;
         //   var errorMessage = error.message;
         //   var email = error.email;
         //   var credential = error.credential;
         // });
      };

      vm.loginWithEmail = function(){
         $firebaseAuth().$signInWithEmailAndPassword($scope.temp.username, $scope.temp.password)
            .then(function(firebaseUser){
               $('#modal1').modal('close');
               $('#modal2').modal('close');
               location.path('/overview');
            })
         .catch(function(error) {
            Materialize.toast(error, 7000, 'rounded');
         });
      }

      vm.registerEmailPassword = function(){
         $firebaseAuth().$createUserWithEmailAndPassword($scope.temp.registerUsername, $scope.temp.registerPassword)
            .then(function(firebaseUser) {
               var newUser = {
                  email: firebaseUser.email,
                  userName: $scope.temp.registerName
               };
               var usersRef = firebase.database().ref('users');
               usersRef.child(firebaseUser.uid).set(newUser);

               $scope.message = "Hello! User created email: " + firebaseUser.email;
               Materialize.toast($scope.message, 7000, 'rounded');
            }).catch(function(error) {
               $scope.error = error;
               Materialize.toast(error, 7000, 'rounded');
         });
      }

      //Clear form and set pristine
      function cancelClicked(){
         var master = { username: '' , password:''};
         $scope.temp = angular.copy(master);
         $scope.loginForm.$setPristine();
      }
   }
})();



