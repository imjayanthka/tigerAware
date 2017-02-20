/** Custom Service which does the get request for SLU WATCH Data **/
(function(){
   angular.module('researchApp').service('sluWatchAPI',['$http', function sluWatchAPI($http){


      var data ={ ID : ''};

      return{

         getsluWatchData: getsluWatchData,
         getUser: getUser,
         setUser: setUser

      };
      function getsluWatchData(){


          var requestURL = '../../tigerAware/app/studies/sluWatchResponse.json';
          return $http.get(requestURL);


      }

      function setUser(user){
        data.ID = user;
        console.log("user is set to "+ data.ID);
      }

      function getUser(){
        console.log("sending user as "+ data.ID);
        return data.ID;
      }
   }]);
}) ();