/** Custom Service which does the get request for NIMH Data **/
(function(){
   angular.module('researchApp').service('nimhAPI',['$http', function nimhAPI($http){


      var data ={ ID : ''};

      return{

         getNIMHData: getNIMHData,
         getUser: getUser,
         setUser: setUser

      };
      function getNIMHData(){

          var requestURL = '../../tigerAware/app/studies/nimhStudyResponse.json';
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