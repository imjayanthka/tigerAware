(function(){

   /** Controller for the whole NIMH page **/
   angular.module('researchApp').controller('FirebaseController',FirebaseController);
   FirebaseController.$inject = ['$scope','$rootScope','$http','nimhAPI','$window','$location','ColorConstants','graphService','AggregateService', '$firebaseObject','$firebaseArray', "$timeout", "$firebaseAuth"];

   function FirebaseController($scope,$rootScope,$http,nimhAPI,$window,$location,ColorConstants,graphService,AggregateService, $firebaseObject,$firebaseArray, $timeout, $firebaseAuth){
      var vm = this;
      vm.auth = $firebaseAuth();
      vm.firebaseUser = vm.auth.$getAuth();

      vm.takeBack = takeBack;
      vm.length = 10;
      vm.surveySchema = {}

      initNIMHController();
      createStudiesObject();
      $(".dropdown-button").dropdown();
      $(".button-collapse").sideNav();
      $("#navBack").click(function(){
         history.go(-1);
      });


      var ref = firebase.database().ref();
      $scope.data = $firebaseObject(ref);


      function createStudiesObject(){
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
                  parse_blueprint(blueprints);
               });
            });
         });

         function parse_blueprint(blueprints){
            vm.surveySchema = blueprints["-KaG7uz6fbY_rQPTx9kN"];
            vm.study_name = vm.surveySchema.name;
            vm.number_responses = Object.keys(vm.surveySchema.answers).length;

            var surveys = vm.surveySchema.survey;
            var survey_display_data = {}
            for(var question in surveys){
               var chart = {}
               chart.title = surveys[question].title;
               chart.type = surveys[question].type

               if (surveys[question].type === "textSlide" || surveys[question].type === "textField") {
                  continue;
               }else{
                  answers = {}
                  for (var response in vm.surveySchema.answers) {
                     if (vm.surveySchema.answers.hasOwnProperty(response)) {
                        response = vm.surveySchema.answers[response].surveyData[surveys[question].id]
                        if (answers[response]){
                           answers[response]++;
                        }else{
                           answers[response] = 1;
                        }
                     }
                  }
               }
               chart.answers = answers;
               chart.graph = vm.nd;

               survey_display_data[surveys[question].id] = chart;
            }
            vm.loadedResponses = survey_display_data;
            console.log(vm.loadedResponses);
            }
         }

      vm.initiateLogOut = function(){
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

      vm.nd = {
               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Negative Mood Change Triggers'
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
                     color: vm.colors[1],
                     y: 2
                  }, {
                     name: 'No',
                     color: vm.colors[0],
                     y: 2
                  }]
               }]
            }// end of graph

      function initNIMHController(){
         vm.showOverviewPageFlag =true;


      //        //Colors for the graph
         vm.colors = ['#FF9655', '#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FFF263', '#66FFCC', '#51b93e'];

      //        //Data for the graphs in desired format



      //        vm.navigateToUserPage = function(userId){

      //         vm.showOverviewPageFlag = false;
      //         vm.showUserPageFlag=true;
      //         window.scrollTo(0,0);
      //         vm.currentUser=userId;
      //         vm.drawUserPageGraphs(vm.currentUser);
      //         console.log(vm.currentUser);

      //        }
      //        /** Any graphs to be drawn on the USER view of NIMH page **/
      //        vm.drawUserPageGraphs = function(currentUser){

      //           vm.totalUserMoodBreakdownGraph = {
      //              options:{

      //                 chart: {
      //                    type: 'column'
      //                },
      //                title: {
      //                    text: 'Overall User Moodchange Data'
      //                },

      //                xAxis: {
      //                    categories: ["USER "+ currentUser.user ],
      //                    crosshair: true
      //                },
      //                yAxis: {
      //                    min: 0,
      //                    title: {
      //                        text: 'Changes'
      //                    }
      //                },
      //                tooltip: {
      //                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      //                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      //                        '<td style="padding:0"><b>{point.y: .1f} </b></td></tr>',
      //                    footerFormat: '</table>',
      //                    shared: true,
      //                    useHTML: true
      //                },
      //                plotOptions: {
      //                    column: {
      //                        pointPadding: 0.2,
      //                        borderWidth: 0
      //                    }
      //                }
      //              },
      //              series: [{
      //                 name: 'Total Changes',
      //                 color: vm.colors[3],
      //                 data: [currentUser['total_mood_changes']]
      //              }, {
      //                 name: 'Positive Changes',
      //                 color: vm.colors[7],
      //                 data: [currentUser['positive_changes']]
      //              }, {
      //                 name: 'Negative Changes',
      //                 color: vm.colors[2],
      //                 data: [currentUser['negative_changes']]
      //              }],
      //              credits: {
      //                 enabled: false
      //              }

      //           } //end of user-mood-changes breakdown graph
      //        }

      //        /** All the graphs on the OVERVIEW page **/
      //       vm.daysSurveysGraph = graphService.getDaysInStudyGraph(vm.users, vm.users.daysComplete, vm.users.surveysComplete); //end of days-surveys graphs

      //       vm.moodChangesGraph ={
      //          options :{

      //            chart: {
      //                type: 'column'
      //            },
      //            title: {
      //                text: 'Positive and Negative Mood Changes Across Participants'
      //            },
      //            xAxis: {
      //                categories: vm.users
      //            },
      //            yAxis: {
      //                allowDecimals: false,
      //                min: 0,
      //                title: {
      //                    text: 'Number of changes'
      //                }
      //            },
      //            tooltip: {
      //                formatter: function () {
      //                    return '<b>' + this.x + '</b><br/>' +
      //                        this.series.name + ': ' + this.y + '<br/>' +
      //                        'Total: ' + this.point.stackTotal;
      //                }
      //            },
      //             plotOptions: {
      //                column: {
      //                    stacking: 'normal'
      //                }
      //             }
      //          },

      //         credits: {
      //             enabled: false
      //          },

      //         series: [{
      //             name: 'Total Changes',
      //             color: vm.colors[3],
      //             data: vm.users.totalMoodChanges,
      //             stack: 'male'
      //         }, {
      //             name: 'Positive Changes',
      //             color: vm.colors[7],
      //             data: vm.users.positiveMoodChanges,
      //             stack: 'female'
      //         }, {
      //             name: 'Negative Changes',
      //             color: vm.colors[2],
      //             data: vm.users.negativeMoodChanges,
      //             stack: 'female'
      //         }]

      //       }//end of mood-changes graph

      //       vm.totalMoodBreakdownGraph = {
      //          options:{

      //             chart: {
      //                type: 'column'
      //            },
      //            title: {
      //                text: 'Overall Moodchange Data'
      //            },

      //            xAxis: {
      //                categories: ['Participants'],
      //                crosshair: true
      //            },
      //            yAxis: {
      //                min: 0,
      //                title: {
      //                    text: 'Changes'
      //                }
      //            },
      //            tooltip: {
      //                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      //                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      //                    '<td style="padding:0"><b>{point.y: .1f} </b></td></tr>',
      //                footerFormat: '</table>',
      //                shared: true,
      //                useHTML: true
      //            },
      //            plotOptions: {
      //                column: {
      //                    pointPadding: 0.2,
      //                    borderWidth: 0
      //                }
      //            }
      //          },
      //          series: [{
      //             name: 'Total Changes',
      //             color: vm.colors[3],
      //             data: [parseInt(vm.findTotal('total_mood_changes'))]
      //          }, {
      //             name: 'Positive Changes',
      //             color: vm.colors[7],
      //             data: [parseInt(vm.findTotal('positive_changes'))]
      //          }, {
      //             name: 'Negative Changes',
      //             color: vm.colors[2],
      //             data: [parseInt(vm.findTotal('negative_changes'))]
      //          }],
      //          credits: {
      //             enabled: false
      //          }

      //       } //end of mood-changes breakdown graph

            vm.negativeMoodBreakdownGraph = {

               options:{
                  chart: {
                     plotBackgroundColor: null,
                     plotBorderWidth: null,
                     plotShadow: false,
                     type: 'pie'
                  },
                  title: {
                     text: 'Negative Mood Change Triggers'
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
                     color: vm.colors[1],
                     y: 5
                  }, {
                     name: 'No',
                     color: vm.colors[0],
                     y: 2
                  }]
               }]

            }// end of neg-mood breakdown graph

      //       vm.positiveMoodBreakdownGraph = {

      //          options:{
      //             chart: {
      //                plotBackgroundColor: null,
      //                plotBorderWidth: null,
      //                plotShadow: false,
      //                type: 'pie'
      //             },
      //             title: {
      //                text: 'Positive Mood Change Triggers'
      //             },
      //             tooltip: {
      //                pointFormat: '{series.data.name} {point.percentage:.1f}%</b>'
      //             },
      //             plotOptions: {
      //                pie: {
      //                   allowPointSelect: true,
      //                   cursor: 'pointer',
      //                   dataLabels: {
      //                      enabled: false
      //                   },
      //                   showInLegend: true
      //                }
      //             }
      //          },
      //          credits: {
      //             enabled: false
      //          },
      //          series: [{
      //             name: 'Positive Triggers',
      //             colorByPoint: true,
      //             data: [{
      //                name: 'Exercised',
      //                color: vm.colors[0],
      //                y: parseInt(vm.nimhData['pos_exercised'])
      //             },{
      //                name: 'Felt Accepted and Supported',
      //                color: vm.colors[2],
      //                y: parseInt(vm.nimhData['pos_felt_accepted_and_supported'])
      //             }, {
      //                name: 'Had Nice Day or Evening',
      //                color: vm.colors[3],
      //                y: parseInt(vm.nimhData['pos_had_nice_day_or_evening'])
      //             }, {
      //                name: 'Had Sex',
      //                color: vm.colors[4],
      //                y: parseInt(vm.nimhData['pos_had_sex'])
      //             }, {
      //                name: 'No Trigger',
      //                color: vm.colors[5],
      //                y: parseInt(vm.nimhData['pos_no_trigger'])
      //             },{
      //                name: 'Other',
      //                color: vm.colors[6],
      //                y: parseInt(vm.nimhData['pos_other'])
      //             }, {
      //                name: 'Received Good News',
      //                color: vm.colors[7],
      //                y: parseInt(vm.nimhData['pos_received_good_news'])
      //             },{
      //                name: 'Someone Complemented Me',
      //                color: vm.colors[8],
      //                y: parseInt(vm.nimhData['pos_someone_complimented_me'])
      //             },{
      //                name: 'Spent Time with Someone Close',
      //                color: vm.colors[9],
      //                y: parseInt(vm.nimhData['pos_spent_time_with_someone_close'])
      //             }, {
      //                name: 'Used Alcohol',
      //                color: vm.colors[10],
      //                y: parseInt(vm.nimhData['pos_used_alcohol'])
      //             },{
      //                name: 'Used Drugs',
      //                color: vm.colors[11],
      //                y: parseInt(vm.nimhData['pos_used_drugs'])
      //             }, {
      //                name: 'Used Prescribed Medications',
      //                color: vm.colors[12],
      //                y: parseInt(vm.nimhData['pos_used_prescribed_medications'])
      //             }]
      //          }]

      //       } //end of pos-mood breakdown graph

      //    }); // end of .then call for the service

      } //end of initNIMHController

   }//end of controller


}) ();