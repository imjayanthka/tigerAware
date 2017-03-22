
(function(){
   'use strict';
   /** Controller for the whole SLU WATCH page **/
   angular.module('researchApp').controller('SluController',SluController);
   SluController.$inject = ['$scope','$rootScope','$http','$window','$location','sluWatchAPI','graphService','ColorConstants','AggregateService', '$firebaseAuth'];

   function SluController($scope,ngRootScope,$http,window,location,sluWatchAPI,graphService,ColorConstants,AggregateService, $firebaseAuth){

      var vm = this;

      vm.takeBack = takeBack;
      vm.initSluController = initSluController;
      vm.showOverviewPageFlag = true;
      vm.showUserPageFlag = false;
      vm.findAvgCompliance = null;
      vm.auth = $firebaseAuth();
      vm.firebaseUser = vm.auth.$getAuth();

      /** Initiate LogOut **/
      vm.initiateLogOut = function(){
         vm.auth.$signOut();
         location.path('/logout');
         vm.message = "You have Logged out successfully!"
         Materialize.toast(vm.message, 7000, 'rounded');
      }
      /** Take back to previous window **/
      function takeBack(){

        if(!vm.showUserPageFlag){
           window.history.back();
        }
        else{
          vm.showUserPageFlag=false;
          initSluController();
          vm.showOverviewPageFlag=true;
        }
      }

      /*** Initialize SLU controller where the get call and main functionality happens ***/
      function initSluController(){

         $(".dropdown-button").dropdown();
         $(".button-collapse").sideNav();
         $("#navBack").click(function(){
            history.go(-1);
         });

        sluWatchAPI.getsluWatchData().then(function (response){

            vm.users = [];
            vm.cigs = [];
            vm.drinks = [];
            vm.posAvg = [];
            vm.negAvg = [];
            vm.impulsivityAvg = [];
            vm.cigsAvg = [];
            vm.drinksAvg =[];
            vm.users.surveysComplete = [];
            vm.users.daysComplete = [];
            vm.users.totalSurveys = [];

            /** GET THE RESPONSE DATA AND STORE IT **/
            vm.sluData = response.data;

            vm.sluData.users = vm.sluData["userStudyStats"];

            vm.colors = ['#FF9655', '#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FFF263', '#66FFCC', '#51b93e'];

            angular.forEach(vm.sluData.users, function(value, key){

              vm.users.push('Student ' + value.user);
              vm.cigs.push(value['cigarettes']);
              vm.drinks.push(value['drinksConsumed']);
              vm.posAvg.push(value['posAvg']);
              vm.negAvg.push(value['negAvg']);
              vm.impulsivityAvg.push(value['impulsivityAvg']);
              var val = value['cigarettes']/value['totalDays'];
              vm.cigsAvg.push(val);
              var val1 = value['drinksConsumed']/value['totalDays'];
              vm.drinksAvg.push(val1);
              vm.users.daysComplete.push(value['totalDays']);
              vm.users.surveysComplete.push(value['surveysComplete']);
              vm.users.totalSurveys.push(value['totalSurveys']);

            }); //END OF FOR-LOOP


            vm.findAvgCompliance = AggregateService.getAverageCompliance(vm.sluData.users);
            /** Find total of any property **/
            vm.findTotal = function(property){
               return AggregateService.getTotalValue(vm.sluData.users,property);
             }

            /** Sets flags and initiates route to SLU user view **/

            vm.navigateToUserPage = function(userId){

                vm.showOverviewPageFlag = false;
                vm.showUserPageFlag=true;
                window.scrollTo(0,0);
                vm.currentUser=userId;

               angular.forEach(vm.sluData.users, function(value, key){
                  vm.users.push('Student ' + value.user);
                  vm.cigs.push(value['cigarettes']);
                  vm.drinks.push(value['drinksConsumed']);
                  vm.posAvg.push(value['posAvg']);
                  vm.negAvg.push(value['negAvg']);
                  vm.impulsivityAvg.push(value['impulsivityAvg']);
               }); //END OF FOR-LOOP


               // User-specific daily phis measures
               vm.currentUser.daysSeries = []
               vm.currentUser.complianceDaysSeries = []
               vm.currentUser.gsrDailySeries = []
               vm.currentUser.heartRateDailySeries = []
               vm.currentUser.skinTempDailySeries = []
               vm.currentUser.complianceDailySeries = []

               angular.forEach(vm.currentUser.gsrDailyResult.dates, function(value, key){
                  vm.currentUser.daysSeries.push(value['date']);
                  vm.currentUser.gsrDailySeries.push(value['avg']);
               });
               angular.forEach(vm.currentUser.heartRateDaily.dates, function(value, key){
                  vm.currentUser.heartRateDailySeries.push(value['avg']);
               });
               angular.forEach(vm.currentUser.skinTempDaily.dates, function(value, key){
                  vm.currentUser.skinTempDailySeries.push(value['avg']);
               });

               angular.forEach(vm.currentUser.complianceDailyResult.dates, function(value, key){
                  vm.currentUser.complianceDaysSeries.push(value['date']);
                  vm.currentUser.complianceDailySeries.push(value['avg']);
               });


               // User-specific hourly phis measures
               vm.currentUser.hoursSeries = []
               vm.currentUser.gsrHourlySeries = []
               vm.currentUser.heartRateHourlySeries = []
               vm.currentUser.skinTempHourlySeries = []

               angular.forEach(vm.currentUser.heartRateHourly.dates, function(value, key){
                  var study_day = value['dateValue'].split("-");
                  var day_formatted = study_day[0] + "-" + study_day[1];


                  for (var hour in value['hours']) {
                    vm.currentUser.hoursSeries.push( day_formatted + "  " + value['hours'][hour]['hourValue'] + ':00 ');
                    vm.currentUser.heartRateHourlySeries.push(value['hours'][hour]['avg']);
                  }
               });
               angular.forEach(vm.currentUser.gsrHourlyResult.dates, function(value, key){
                  var study_day = value['dateValue']
                  for (var hour in value['hours']) {
                    vm.currentUser.gsrHourlySeries.push(value['hours'][hour]['avg']);
                  }
               });
               angular.forEach(vm.currentUser.skinTempHourly.dates, function(value, key){
                  var study_day = value['dateValue']
                  for (var hour in value['hours']) {
                    vm.currentUser.skinTempHourlySeries.push(value['hours'][hour]['avg']);
                  }
               });

               vm.drawUserPageGraphs(vm.currentUser);
            }

            /** All the graphs on the overview page goes under here **/
            vm.daysSurveysGraph =  graphService.getDaysInStudyGraph(vm.users, vm.users.daysComplete, vm.users.surveysComplete); //end of days-surveys graphs



            vm.cigsDrinksGraph = {

                options: {

                    chart: {
                        type: 'column'
                    },
                    title: {
                        text: 'How many people were you with?'
                    },
                    xAxis: {
                        min: 8,
                        categories: vm.users,
                        title: {
                          text: 'Students'
                        }
                    },
                    yAxis: {

                        allowDecimals: false,
                        title: {
                            text: 'Avg people present'
                        },
                        tickInterval: 2
                    },
                    tooltip: {
                        valueDecimals: 3,
                     //    formatter: function () {
                     //     return '<b>' + this.x + '</b><br/>' +
                     //         this.series.name + ': ' + this.y + '<br/>'
                     // },
                    },
                    plotOptions: {
                        column: {
                            pointPadding: 0,
                            borderWidth: 0
                        }
                    },
                    scrollbar: {
                        enabled: true
                    }
                },
                series: [{
                    name: 'Number people when felt unsafe',
                    color: vm.colors[1],
                    data: vm.cigsAvg,
                    stack: 'male'

                }, {
                    name: 'Number people when felt safe',
                    color: vm.colors[0],
                    data: vm.drinksAvg,
                    stack: 'male'

                }],
                credits: {
                    enabled: false
                }
            } //END of cigsDrinksGraph


            vm.averageValuesGraph = {

              options: {

                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Feel Safe, Feel Unsafe, and  Feel Neutral Response Averages'
                },
                subtitle: {
                    text: 'On a scale 1-5'
                },
                xAxis: {
                    min: 12,
                    categories: vm.users,
                    title: {
                        text: 'Students'
                    },
                    crosshair: true
                },
                yAxis: {

                    title: {
                        text: 'Avg rating'
                    },
                    tickInterval: 0.50
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.3f} </b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true,
                    valueDecimals: 3
                },
                plotOptions: {
                    column: {
                        pointPadding: 0,
                        borderWidth: 0,
                    },
                },
                scrollbar: {
                        enabled: true
                }
              },
              series: [{
                    name: 'Safe Avg',
                    data: vm.posAvg,
                    color: ColorConstants.Colors['AquaMarine'],
                    stack: 'male'
                }, {
                    name: 'Unsafe Avg',
                    data: vm.negAvg,
                    color: ColorConstants.Colors['Roman'],
                    stack: 'female'
                }, {
                    name: 'Neutral Avg',
                    data: vm.impulsivityAvg,
                    color: ColorConstants.Colors['Tundora'],
                    stack: 'female'
                }]
            } //END of averageValuesGraph

            /** All the graphs in the user view goes in here **/

            vm.drawUserPageGraphs = function (currentUser) {


               vm.hourlyPhisPersonalGraph = {
                  options:{
                     chart: {
                        zoomType: 'xy',
                        height: 600
                     },
                     title: {
                        text: 'Hourly Averages of Divice Data'
                     },
                     subtitle: {
                        text: 'Specifics During Study Period'
                     },
                     xAxis: [{
                        min: 20,
                        categories: currentUser.hoursSeries,
                        crosshair: true
                      }],
                     yAxis: [{ // Primary yAxis
                        labels: {
                           format: '{value}°F',
                           style: {
                                 color: Highcharts.getOptions().colors[7]
                           }
                        },
                        title: {
                           text: 'Device Temperature',
                           style: {
                              color: Highcharts.getOptions().colors[7]
                           }
                          },
                          opposite: true

                      }, { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                           text: 'Miles traveled',
                           style: {
                                 color: Highcharts.getOptions().colors[2]
                              }
                          },
                          labels: {
                              format: '{value} miles',
                              style: {
                                  color: Highcharts.getOptions().colors[2]
                              }
                          }

                      }, { // Tertiary yAxis
                          gridLineWidth: 0,
                          title: {
                              text: 'Minutes Using Phone',
                              style: {
                                 color: Highcharts.getOptions().colors[1]
                              }
                          },
                          labels: {
                              format: '{value} minutes',
                              style: {
                                 color: Highcharts.getOptions().colors[1]
                              }
                          },
                          opposite: true
                      }],
                      tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.4f} </b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true,
                        valueDecimals: 4
                      },
                      legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 80,
                        verticalAlign: 'top',
                        y: 55,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                      },
                      scrollbar: {
                        enabled: true
                      }
                  },
                  //  close options
                  series: [{
                        name: 'Miles traveled',
                        type: 'spline',
                        yAxis: 1,
                        data: currentUser.gsrHourlySeries,
                        color: Highcharts.getOptions().colors[2],
                        tooltip: {
                           valueSuffix: ' miles'
                        }
                     }, {
                        name: 'Minutes Using Phone',
                        type: 'spline',
                        yAxis: 2,
                        data: currentUser.heartRateHourlySeries,
                        color: Highcharts.getOptions().colors[1],
                        marker: {
                           enabled: false
                        },
                        dashStyle: 'shortdot',
                        tooltip: {
                           valueSuffix: ' minutes'
                        }
                      }, {
                        name: 'Divice Temp',
                        type: 'spline',
                        data: currentUser.skinTempHourlySeries,
                        color: Highcharts.getOptions().colors[7],
                        tooltip: {
                           valueSuffix: ' °F'
                        }
                      }]
               },
               vm.dailyPhisPersonalGraph = {

                  options:{
                     chart: {
                        zoomType: 'xy'
                     },
                     title: {
                        text: 'Daily Averages of Divice Data'
                     },
                     subtitle: {
                        text: 'Overview of Study Period'
                     },
                     xAxis: [{
                          min: 12,
                           categories: currentUser.daysSeries,
                        crosshair: true
                      }],
                     yAxis: [{ // Primary yAxis
                        labels: {
                           format: '{value}°F',
                           style: {
                                 color: Highcharts.getOptions().colors[7]
                           }
                        },
                        title: {
                           text: 'Device Temperature',
                           style: {
                              color: Highcharts.getOptions().colors[7]
                           }
                          },
                          opposite: true

                      }, { // Secondary yAxis
                        gridLineWidth: 0,
                        title: {
                           text: 'Miles traveled',
                           style: {
                                 color: Highcharts.getOptions().colors[2]
                              }
                          },
                          labels: {
                              format: '{value} miles',
                              style: {
                                  color: Highcharts.getOptions().colors[2]
                              }
                          }

                      }, { // Tertiary yAxis
                          gridLineWidth: 0,
                          title: {
                              text: 'Minutes Using Phone',
                              style: {
                                 color: Highcharts.getOptions().colors[1]
                              }
                          },
                          labels: {
                              format: '{value} minutes',
                              style: {
                                 color: Highcharts.getOptions().colors[1]
                              }
                          },
                          opposite: true
                      }],
                      tooltip: {
                        shared: true,
                        backgroundColor: '#FFFFFF'
                      },
                      legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 80,
                        verticalAlign: 'top',
                        y: 55,
                        floating: true,
                        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                      },
                      scrollbar: {
                        enabled: true
                      }
                  },
                  //  close options
                  series: [{
                        name: 'Miles traveled',
                        type: 'spline',
                        yAxis: 1,
                        data: currentUser.gsrDailySeries,
                        color: Highcharts.getOptions().colors[2],
                        tooltip: {
                           valueSuffix: ' miles'
                        }
                     }, {
                        name: 'Minutes Using Phone',
                        type: 'spline',
                        yAxis: 2,
                        data: currentUser.heartRateDailySeries,
                        color: Highcharts.getOptions().colors[1],
                        marker: {
                           enabled: false
                        },
                        dashStyle: 'shortdot',
                        tooltip: {
                           valueSuffix: ' minutes'
                        }
                      }, {
                        name: 'Divice Temp',
                        type: 'spline',
                        data: currentUser.skinTempDailySeries,
                        color: Highcharts.getOptions().colors[7],
                        tooltip: {
                           valueSuffix: ' °F'
                        }
                      }]
               }

              vm.userSubstanceStats = {


                   options:{

                      chart: {
                         type: 'column'
                     },
                     title: {
                         text: 'How many people were you with?'
                     },

                     xAxis: {
                         categories: ["Student "+ currentUser.user ],
                         crosshair: true
                     },
                     yAxis: {

                         title: {
                             text: 'Changes'
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
                      name: 'Num people when felt unsafe',
                      color: vm.colors[1],
                      data: [currentUser['cigarettes']]
                   }, {
                      name: 'Num people when felt safe',
                      color: vm.colors[0],
                      data: [currentUser['drinksConsumed']]
                   }],
                   credits: {
                      enabled: false
                   }
              }

              vm.userAverageResponse = {

                options: {

                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Feel Safe, Feel Unsafe, and  Feel Neutral Response Averages'
                },

                xAxis: {

                    categories: ["Student "+ currentUser.user ],
                    crosshair: true
                },
                yAxis: {

                    title: {
                        text: 'Avg value'
                    },
                    tickInterval: 0.50
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.3f} </b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.1,

                        borderWidth: 0
                    },
                },
                scrollbar: {
                        enabled: false
                }
              },
              series: [{
                    name: 'Safe Avg',
                    data: [currentUser['posAvg']],
                    color: vm.colors[7],
                    stack: 'male'
                }, {
                    name: 'Unsafe Avg',
                    data: [currentUser['negAvg']],
                    color: vm.colors[2],
                    stack: 'female'
                }, {
                    name: 'Neutral Avg',
                    data: [currentUser['impulsivityAvg']],
                    color: vm.colors[3],
                    stack: 'female'
                }]

              } //END of userAverageResponse graph


              vm.userDailyComplianceGraph = {

                options : {
                      chart: {
                          type: 'column'
                      },
                      title: {
                          text: 'Daily Survey Compliance'
                      },

                      xAxis: {
                          min: 8,
                          categories: vm.currentUser.complianceDaysSeries,
                          crosshair: true
                      },
                      yAxis: {
                          min: 0,
                          title: {
                              text: 'Survey Count'
                          }
                      },
                      tooltip: {
                          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                              '<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
                          footerFormat: '</table>',
                          shared: true,
                          useHTML: true
                      },
                      plotOptions: {
                          column: {
                              pointPadding: 0.2,
                              borderWidth: 0
                          }
                      },
                      scrollbar: {
                        enabled: true
                      }
                  },
                  series: [{
                      name: 'Student ' + vm.currentUser.user,
                      data: vm.currentUser.complianceDailySeries

                  }]

              }//END of userDailyAverageCompliance graph

            } //END of drawUserPageGraphs function

        }); //END OF .then of API CALL

      } //END of initSluController function

      initSluController();
    }

})();