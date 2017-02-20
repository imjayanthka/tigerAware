/** Custom Service to help highcharts config object, to be hsared for similar graphs across the studies **/
(function(){
   angular.module('researchApp').service('graphService',['$http', 'ColorConstants', function graphService($http, ColorConstants){


      return{

         getDaysInStudyGraph: getDaysInStudyGraph,
         getMoodBreakdownGraph: getMoodBreakdownGraph
      };


      function getDaysInStudyGraph(users, daysComplete, surveysComplete){

          daysSurveysGraph = {
               options: {

                  chart: {
                         zoomType: 'xy'
                  },
                  title: {
                          text: 'Days in Study and Surveys Complete'
                  },
                  xAxis: {
                           categories: users,
                           crosshair: true
                  },
                  yAxis: [{ // Primary yAxis
                     labels: {
                         format: '{value} Days',
                         style: {
                             color: ColorConstants.Colors['AppleGreen']
                         }
                     },
                     title: {
                         text: 'Days in Study',
                         style: {
                             color: ColorConstants.Colors['AppleGreen']
                         }
                     }
                  }, { // Secondary yAxis
                     title: {
                         text: 'Surveys Complete',
                         style: {
                             color: ColorConstants.Colors['Tundora']
                         }
                     },
                     labels: {
                         format: '{value} Surveys',
                         style: {
                             color: ColorConstants.Colors['Tundora']
                         }
                     },
                     opposite: true
                  }],

                  tooltip: {
                  shared: true
                  },

                  legend: {
                  layout: 'vertical',
                  align: 'left',
                  x: 120,
                  verticalAlign: 'top',
                  y: 40,
                  floating: true,
                  backgroundColor: '#FFFFFF'
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Surveys',
                  type: 'column',
                  yAxis: 1,
                  data: surveysComplete,
                  tooltip: {
                      valueSuffix: ' surveys'
                  },
                  color: ColorConstants.Colors['Tundora']

               }, {
                  name: 'Days in Study',
                  type: 'spline',
                  data: daysComplete,
                  tooltip: {
                      valueSuffix: ' days'
                  },
                  color: ColorConstants.Colors['AppleGreen']
               }]
            } //end of days-surveys graphs

            return daysSurveysGraph;

      }

      function getMoodBreakdownGraph(){

      }

   }]);
}) ();