(function(){

   /** Controller for the whole NIMH page **/
   angular.module('researchApp').controller('NimhController',NimhController);
   NimhController.$inject = ['$scope','$rootScope','$http','nimhAPI','$window','$location','ColorConstants','graphService','AggregateService', '$firebaseAuth'];

   function NimhController($scope,ngRootScope,$http,nimhAPI,window,location,ColorConstants,graphService,AggregateService, $firebaseAuth){

      var vm = this;
      initNIMHController();
      vm.takeBack = takeBack;
      vm.auth = $firebaseAuth();
      vm.firebaseUser = vm.auth.$getAuth();

      $(".dropdown-button").dropdown();
      $(".button-collapse").sideNav();
      $("#navBack").click(function(){
         history.go(-1);
      });
      vm.initiateLogOut =function(){
          vm.auth.$signOut();
          location.path('/logout');
          vm.message = "You have Logged out successfully!"
          Materialize.toast(vm.message, 7000, 'rounded');
      }
      function takeBack(){
        if(!vm.showUserPageFlag){
           window.history.back();
          }
        else{
          vm.showUserPageFlag=false;
          vm.showOverviewPageFlag=true;
        }
      }
      function initNIMHController(){

          nimhAPI.getNIMHData().then(function (d){

             vm.nimhData = d.data;
             vm.nimhData.users = vm.nimhData.participants;
             vm.showUserPageFlag =false;
             vm.showOverviewPageFlag =true;
             vm.userSelected = null;

             vm.findAvgCompliance = AggregateService.getAverageCompliance(vm.nimhData.users);

             vm.findTotal = function(property){
               return AggregateService.getTotalValue(vm.nimhData.users,property);
             }

             //Colors for the graph
             vm.colors = ['#FF9655', '#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FFF263', '#66FFCC', '#51b93e'];

             //Data for the graphs in desired format
             vm.users = [];
             vm.users.daysComplete = [];
             vm.users.surveysComplete = [];
             vm.users.totalMoodChanges = [];
             vm.users.positiveMoodChanges = [];
             vm.users.negativeMoodChanges = [];
             angular.forEach(vm.nimhData.users, function(value, key) {
                  vm.users.push('Student ' + value.user);
                  vm.users.daysComplete.push(value['day-count']);
                  vm.users.surveysComplete.push(value['survey-count']);
                  vm.users.totalMoodChanges.push(value['total_mood_changes']);
                  vm.users.positiveMoodChanges.push(value['positive_changes']);
                  vm.users.negativeMoodChanges.push(value['negative_changes']);
             });
             vm.navigateToUserPage = function(userId){

              vm.showOverviewPageFlag = false;
              vm.showUserPageFlag=true;
              window.scrollTo(0,0);
              vm.currentUser=userId;
              vm.drawUserPageGraphs(vm.currentUser);

             }
             /** Any graphs to be drawn on the Student view of NIMH page **/
             vm.drawUserPageGraphs = function(currentUser){

                vm.totalUserMoodBreakdownGraph = {
                   options:{

                      chart: {
                         type: 'column'
                     },
                     title: {
                         text: 'Overall User Report Data'
                     },

                     xAxis: {
                         categories: ["Student "+ currentUser.user ],
                         crosshair: true
                     },
                     yAxis: {
                         min: 0,
                         title: {
                             text: 'Ratings'
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
                      name: 'Total Ratings',
                      color: vm.colors[3],
                      data: [currentUser['total_mood_changes']]
                   }, {
                      name: 'Positive Ratings',
                      color: vm.colors[7],
                      data: [currentUser['positive_changes']]
                   }, {
                      name: 'Negative Ratings',
                      color: vm.colors[2],
                      data: [currentUser['negative_changes']]
                   }],
                   credits: {
                      enabled: false
                   }

                } //end of user-mood-changes breakdown graph
             }

             /** All the graphs on the OVERVIEW page **/
            vm.daysSurveysGraph = graphService.getDaysInStudyGraph(vm.users, vm.users.daysComplete, vm.users.surveysComplete); //end of days-surveys graphs

            vm.moodChangesGraph ={
               options :{

                 chart: {
                     type: 'column'
                 },
                 title: {
                     text: 'Do you feel generally satisfied with MU?'
                 },
                 xAxis: {
                     categories: vm.users
                 },
                 yAxis: {
                     allowDecimals: false,
                     min: 0,
                     title: {
                         text: 'Number of reports'
                     }
                 },
                 tooltip: {
                     formatter: function () {
                         return '<b>' + this.x + '</b><br/>' +
                             this.series.name + ': ' + this.y + '<br/>' +
                             'Total: ' + this.point.stackTotal;
                     }
                 },
                  plotOptions: {
                     column: {
                         stacking: 'normal'
                     }
                  }
               },

              credits: {
                  enabled: false
               },

              series: [{
                  name: 'Total Ratings',
                  color: vm.colors[3],
                  data: vm.users.totalMoodChanges,
                  stack: 'male'
              }, {
                  name: 'Positive Ratings',
                  color: vm.colors[7],
                  data: vm.users.positiveMoodChanges,
                  stack: 'female'
              }, {
                  name: 'Negative Ratings',
                  color: vm.colors[2],
                  data: vm.users.negativeMoodChanges,
                  stack: 'female'
              }]

            }//end of mood-changes graph

            vm.totalMoodBreakdownGraph = {
               options:{

                  chart: {
                     type: 'column'
                 },
                 title: {
                     text: 'Overall Report Summary'
                 },

                 xAxis: {
                     categories: ['Students'],
                     crosshair: true
                 },
                 yAxis: {
                     min: 0,
                     title: {
                         text: 'Ratings'
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
                  name: 'Total Ratings',
                  color: vm.colors[3],
                  data: [parseInt(vm.findTotal('total_mood_changes'))]
               }, {
                  name: 'Positive Ratings',
                  color: vm.colors[7],
                  data: [parseInt(vm.findTotal('positive_changes'))]
               }, {
                  name: 'Negative Ratings',
                  color: vm.colors[2],
                  data: [parseInt(vm.findTotal('negative_changes'))]
               }],
               credits: {
                  enabled: false
               }

            } //end of mood-changes breakdown graph

            vm.negativeMoodBreakdownGraph = {

               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Why are you not currently satisfied with MU?'
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
                           enabled: false
                        },
                        showInLegend: true
                     }
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Unsatisfied causes',
                  colorByPoint: true,
                  data: [{
                     name: 'Disconnected from others',
                     color: vm.colors[0],
                     y: parseInt(vm.nimhData['neg_argument_or_conflict'])
                  }, {
                     name: 'Workload',
                     color: vm.colors[1],
                     y: parseInt(vm.nimhData['neg_felt_rejected'])
                  }, {
                     name: 'No parking',
                     color: vm.colors[2],
                     y: parseInt(vm.nimhData['neg_lack_of_sleep'])
                  }, {
                     name: 'Weather',
                     color: vm.colors[3],
                     y: parseInt(vm.nimhData['neg_no_trigger'])
                  }, {
                     name: 'Other',
                     color: vm.colors[4],
                     y: parseInt(vm.nimhData['neg_other'])
                  }, {
                     name: 'Argument with students',
                     color: vm.colors[5],
                     y: parseInt(vm.nimhData['neg_pain_or_bodiy_discomfort'])
                  },{
                     name: 'Argument with faculty',
                     color: vm.colors[6],
                     y: parseInt(vm.nimhData['neg_problem_at_work_or_school'])
                  }, {
                     name: 'Lack of community',
                     color: vm.colors[7],
                     y: parseInt(vm.nimhData['neg_received_bad_news'])
                  },{
                     name: 'Stress',
                     color: vm.colors[8],
                     y: parseInt(vm.nimhData['neg_stress'])
                  },{
                     name: 'Upset/Mad at Myself',
                     color: vm.colors[9],
                     y: parseInt(vm.nimhData['neg_upset_mad_at_myself'])
                  }, {
                     name: 'Class sizes',
                     color: vm.colors[10],
                     y: parseInt(vm.nimhData['neg_used_alcohol'])
                  },{
                     name: 'Campus size',
                     color: vm.colors[11],
                     y: parseInt(vm.nimhData['neg_used_drugs'])
                  }, {
                     name: 'Class schedule',
                     color: vm.colors[12],
                     y: parseInt(vm.nimhData['neg_used_prescribed_medications'])
                  }]
               }]

            }// end of neg-mood breakdown graph

            vm.positiveMoodBreakdownGraph = {

               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Why are you currently satisfied with MU?'
                  },
                  tooltip: {
                     pointFormat: '{series.data.name} {point.percentage:.1f}%</b>'
                  },
                  plotOptions: {
                     pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                           enabled: false
                        },
                        showInLegend: true
                     }
                  }
               },
               credits: {
                  enabled: false
               },
               series: [{
                  name: 'Positive Triggers',
                  colorByPoint: true,
                  data: [{
                     name: 'Feel accepted',
                     color: vm.colors[0],
                     y: parseInt(vm.nimhData['pos_exercised'])
                  },{
                     name: 'Get along with students',
                     color: vm.colors[2],
                     y: parseInt(vm.nimhData['pos_felt_accepted_and_supported'])
                  }, {
                     name: 'Get along with faculty',
                     color: vm.colors[3],
                     y: parseInt(vm.nimhData['pos_had_nice_day_or_evening'])
                  }, {
                     name: 'Good parking',
                     color: vm.colors[4],
                     y: parseInt(vm.nimhData['pos_had_sex'])
                  }, {
                     name: 'Good class schedule',
                     color: vm.colors[5],
                     y: parseInt(vm.nimhData['pos_no_trigger'])
                  },{
                     name: 'Other',
                     color: vm.colors[6],
                     y: parseInt(vm.nimhData['pos_other'])
                  }, {
                     name: 'Campus climate',
                     color: vm.colors[7],
                     y: parseInt(vm.nimhData['pos_received_good_news'])
                  },{
                     name: 'Weather',
                     color: vm.colors[8],
                     y: parseInt(vm.nimhData['pos_someone_complimented_me'])
                  },{
                     name: 'Recieved good grade',
                     color: vm.colors[9],
                     y: parseInt(vm.nimhData['pos_spent_time_with_someone_close'])
                  }, {
                     name: 'Parent support',
                     color: vm.colors[10],
                     y: parseInt(vm.nimhData['pos_used_alcohol'])
                  },{
                     name: 'Learned something new',
                     color: vm.colors[11],
                     y: parseInt(vm.nimhData['pos_used_drugs'])
                  }]
               }]

            } //end of pos-mood breakdown graph

         }); // end of .then call for the service

      } //end of initNIMHController

   }//end of controller


}) ();