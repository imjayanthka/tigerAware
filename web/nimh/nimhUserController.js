(function(){


	angular.module('researchApp').controller('nimhUserController',nimhUserController);
    nimhUserController.$inject = ['$scope','$rootScope','$http','nimhAPI','$window','$location'];

    function nimhUserController(ngScope,ngRootScope,$http,nimhAPI,window,location){

    	var vm=this;
    	vm.takeBack = takeBack;
      	function takeBack(){
       	 	window.history.back();
     	}
     	nimhAPI.setUser();
    	vm.userId = nimhAPI.getUser();
    	//alert(vm.userId);
    	console.log(vm.userId);
    }
}) ();