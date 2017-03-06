(function(){
   /***** Landing Page Controller
   - Handles both login and register modal *****/
   "use strict";
   angular
      .module('researchApp')
      .controller('LandingController', LandingController);
   LandingController.$inject = ['$scope','$rootScope','$http','$location', 'LoginService', '$firebaseAuth',];

   function LandingController($scope,$rootScope,http,location,LoginService, $firebaseAuth){

      var vm = this;
      vm.directToLogin=directToLogin;
      vm.initModal = initModal;
      vm.directToRegister=directToRegister;
      vm.showLoginModal=false;
      vm.showRegisterModal =false;
      vm.cancelClicked =cancelClicked;

      LoginService.clearCredentials();
      $scope.auth = $firebaseAuth();
      $scope.auth.$onAuthStateChanged(function(firebaseUser) {
         $rootScope.firebaseUser = firebaseUser;
         console.log($rootScope.firebaseUser);
      });

      initModal();
      function initModal(){
         $('#modal1').modal();
         $('#modal2').modal();
         $('#modal1,#modal2').modal({
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

      vm.authUserGoogle = function() {

         var provider = new firebase.auth.GoogleAuthProvider();
         var auth = $firebaseAuth();

         auth.$signInWithPopup(provider).then(function(result) {
            location.path('/overview');
            var user = result.user;
           // ...
         }).catch(function(error) {

           var errorCode = error.code;
           var errorMessage = error.message;
           var email = error.email;
           var credential = error.credential;
         });
      };

      function directToRegister(){
         vm.showRegisterModal = true;
         $('#modal2').modal('open');
      }

      vm.loginWithEmail = function(){
         $firebaseAuth().$signInWithEmailAndPassword($scope.temp.username, $scope.temp.password)
            .then(function(firebaseUser){
               location.path('/overview');
            })
         .catch(function(error) {
            Materialize.toast(error, 7000, 'rounded');
         });
      }

      vm.registerEmailPassword = function(){
         $firebaseAuth().$createUserWithEmailAndPassword($scope.temp.registerUsername, $scope.temp.registerPassword)
            .then(function(firebaseUser) {
               $scope.message = "Hello! User created email: " + firebaseUser.email;
               Materialize.toast($scope.message, 7000, 'rounded');
               location.path('/overview')
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



