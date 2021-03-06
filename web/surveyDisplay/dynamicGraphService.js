/** Custom Service to help highcharts config object, to be shared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('dynamicGraphService',['$http', 'ColorConstants', function graphService($http, ColorConstants){

      return{
         getSurveyGraph: getSurveyGraph
      };

      function getSurveyGraph(survey){
         //conditional binding logic goes here
         if( survey.type ===  "yesNo") {
            return createYesNoPieGraph(survey);
         } else if (survey.type == "MultipleChoice"){
            return createMCQPieGraph(survey);
         } else if (survey.type == "timeInt") {
             return createTimeIntGraph(survey);
         }
      }

      function createYesNoBarGraph(survey){
         console.log(survey.answers);
         return {
            options:{

               chart: {
                  type: 'column'
               },
               title: {
                  text: null        // survey.title
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
                     text: null        // survey.title
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

      function createMCQPieGraph(survey){
          
         var return_json = {
               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: null        // survey.title
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
               series: []
            }
            var series_data = {}
            series_data.name = survey.title;
            series_data.colorByPoint = true;
            series_data.data = []
            if(Object.keys(survey.answers).length > survey.choices.length)
                  series_data.data.push({
                     name: 'No Responses',
                     y: survey.answers[""]})
            for(var i = 0; i < survey.choices.length; i++){
               series_data.data.push({
                     name: survey.choices[i],
                     y: survey.answers[i.toString()]})
            }
         return_json.series.push(series_data)
         return return_json
      }
       
       
      function createTimeIntGraph(survey) {
          var largestTime = 0;
          for(var response in survey.answers) {
              if(parseInt(response) > parseInt(largestTime)) {
                  largestTime = response;
              }
          }
          var categories = [];
          for(var i = 0; i <= parseInt(largestTime); i++) {
              categories.push(i);
          }
          var data = [];
          for(var i = 0; i < categories.length; i++) {
              if(survey.answers.hasOwnProperty(i)) {
                  data.push(survey.answers[i]);
              } else {
                  data.push(0);
              }
          }
          
          var return_json = {
              chart: {
                  type: 'column'
              },
              title: {
                  text: null        // survey.title
              },
              xAxis: {
                  title: {
                      text: 'Time in Minutes',
                      style: {"font-weight": "bold"}
                  },
                  categories,
                  crosshair: true
              },
              yAxis: {
                  min: 0,
                  title: {
                      text: 'Number of Users',
                      style: {"font-weight": "bold"}
                  }
              },
              series: [{
                  showInLegend: false,
                  tooltip: {
                      headerFormat: '{point.key} minutes<br/>',
                      pointFormat: '{point.y} users'
                  },
                  name: '',
                  type: 'column',
                  pointPadding: 0,
                  groupPadding: 0,
                  borderWidth: 0,
                  shadow: false,
                  data
              }]
          }
          return return_json;
      }
       

   }]);
}) ();