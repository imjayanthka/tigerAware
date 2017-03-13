/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('dynamicGraphService',['$http', 'ColorConstants', function graphService($http, ColorConstants){

      return{
         getSurveyGraph: getSurveyGraph
      };

      function getSurveyGraph(survey){
         //conditional binding logic goes here
         console.log(survey.type);
         if( survey.type ===  "yesNo"){
            return createYesNoPieGraph(survey);
         }
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