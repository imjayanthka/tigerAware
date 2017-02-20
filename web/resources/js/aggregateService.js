/** Shared Service to calculate aggregate functions similar across all the studies **/
(function(){
   angular.module('researchApp').service('AggregateService',['$http', function AggregateService($http){

      return{

         getAverageCompliance: getAverageCompliance,
         getTotalValue: getTotalValue
         

      };


      function getAverageCompliance(studyUsers){

        var total = 0;
        for (var i = 0; i < studyUsers.length ; i++) {
               total+=studyUsers[i]['compliance'];
        }
        return (total/i).toFixed(2);
      }

      function getTotalValue(studyUsers,property) {

          var total = 0;
          for (var i = 0; i < studyUsers.length ; i++) {
            total+=studyUsers[i][property];
          }
          return (total);
      }

   }]);
}) ();