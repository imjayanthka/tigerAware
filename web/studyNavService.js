/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('studyNavService',['$http', function graphService($http){

      return{
         setUserSurveys: setUserSurveys,
         getUserSurvey: getUserSurvey
      };

      function setUserSurveys(username){

         //Get current user. Retrieve all surveys corresponding to the user.
         var user_surveys = []
         var userRef = firebase.database().ref('users/user1/surveys/');
         userRef.once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
               user_surveys.push(childSnapshot.val());
            });
         }).then(function(){

            var demo_study;
            // Parse through data blueprint & retreive corresponding data
            var blueprintRef = firebase.database().ref('blueprints/');
            var blueprints = {}

            //Iterate through all study blueprints and save data
            blueprintRef.once('value', function(snapshot) {
               snapshot.forEach(function(childSnapshot) {
                  var study_information = {}
                  var childKey = childSnapshot.key;
                  var childData = childSnapshot.val();

                  // Scope result to surveys owned by current user
                  if (-1 !== $.inArray(childSnapshot.key, user_surveys)){
                     study_information['name'] = childData.name;
                     study_information['survey'] = childData.survey;

                     shallow_dataRef = firebase.database().ref('data/' + childSnapshot.key);
                     shallow_dataRef.once('value', function(snapshot_data){
                        if (snapshot_data.val() != null){
                           study_information['answers'] = snapshot_data.val().answers;
                        }else{
                           study_information['answers'] = null;
                        }
                     });
                     blueprints[childKey] = study_information;
                  }
               });
               $timeout(function() {
                  console.log(blueprints);
                  parse_blueprint(blueprints);
               });
            });
         })
      }

      function createYesNoBarGraph(survey){
         console.log(survey.answers['Yes'])
         return {
            options:{

               chart: {
                  type: 'column'
               },
               title: {
                  text: survey.title
               },

               xAxis: {
                  categories: ['Participants'],
                  crosshair: true
               },
               yAxis: {
                  min: 0,
                  title: {
                     text: 'Responses'
                  }
               },
                 tooltip: {
                     headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                     pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                         '<td style="padding:0"><b>{point.y: .1f} </b></td></tr>',
                     footerFormat: '</table>',
                     shared: true,
                     useHTML: true
                 },
                 plotOptions: {
                     column: {
                         pointPadding: 0.2,
                         borderWidth: 0
                     }
                 }
               },
               series: [{
                  name: 'Yes',
                  color: ColorConstants.Colors['AppleGreen'],
                  data: survey.answers['Yes']
               }, {
                  name: 'No',
                  color: ColorConstants.Colors['Red'],
                  data: survey.answers['No']
               }],
               credits: {
                  enabled: false
               }
         }
      }

      function createYesNoPieGraph(survey){

          return {
               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: survey.title
                  },
                  tooltip: {
                     borderColor: null,
                     pointFormat: '{series.data.name} {point.percentage:.1f}%</b>'
                  },
                  plotOptions: {
                     pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                           enabled: true
                        }
                     }
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Negative Triggers',
                  colorByPoint: true,
                  data: [{
                     name: 'Yes',
                     color: ColorConstants.Colors['AppleGreen'],
                     y: survey.answers['Yes']
                  }, {
                     name: 'No',
                     color: ColorConstants.Colors['Red'],
                     y: survey.answers['No']
                  }]
               }]
            }// end of graph
      }

   }]);
}) ();