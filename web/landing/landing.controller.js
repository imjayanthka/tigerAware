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
      vm.postLoginInfo =postLoginInfo;
      vm.postRegisterInfo = postRegisterInfo;
      vm.cancelClicked =cancelClicked;

      LoginService.clearCredentials();
      $scope.auth = $firebaseAuth();
      $scope.auth.$onAuthStateChanged(function(firebaseUser) {
         $rootScope.firebaseUser = firebaseUser;
         console.log($rootScope.firebaseUser);
      });

      initModal();
      //Initialize the modal
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

      //Check login by posting    to DB
      function postLoginInfo(){


         var requestURL = '../app/helpers/loginHelper.php';


         var data = { username: $scope.temp.username , password: $scope.temp.password};

         http({
             method: 'POST',
             url: requestURL,
             data: $.param(data),
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}


         }).then(function (response) {
            console.log(response.data);
            vm.message = response.data.msg;
            if(response.data.status == true){
               LoginService.setCredentials($scope.temp.username);
               Materialize.toast(vm.message, 3000, 'rounded');
               location.path('/overview');
               console.log("login yes");
            }
            else{

               Materialize.toast(vm.message, 3000, 'rounded');
               cancelClicked();
            }
         });
      }

      //Save userInfo to DB
      function postRegisterInfo(){

         var requestURL = '../app/helpers/registerHelper.php';


         var data = { username: $scope.temp.registerUsername , password: $scope.temp.registerPassword};
         console.log(data);
         http({
             method: 'POST',
             url: requestURL,
             data: $.param(data),
             headers: {'Content-Type': 'application/x-www-form-urlencoded'}


         }).then(function (response) {
            console.log(response);
            vm.message = response.data.msg;
            if(response.data.status === 2 || response.data.status == 0){
               Materialize.toast(vm.message, 7000, 'rounded');
               registerCancelClicked();
            }
            else{
               Materialize.toast(vm.message, 7000, 'rounded');
               registerCancelClicked();
               $('#modal2').modal('close');
            }
         });
      }

      //Clear form and set pristine
      function cancelClicked(){
         var master = { username: '' , password:''};
         $scope.temp = angular.copy(master);

         $scope.loginForm.$setPristine();
      }
      function registerCancelClicked(){
         var master = { registerUsername: '' , registerPassword:'', confirmPassword: ''};
         $scope.temp = angular.copy(master);
         vm.message = "";
         $scope.registerForm.$setPristine();
      }
   }
})();



