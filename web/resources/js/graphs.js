/*
The purpose of this demo is to demonstrate how multiple charts on the same page can be linked
through DOM and Highcharts events and API methods. It takes a standard Highcharts config with a
small variation for each data set, and a mouse/touch event handler to bind the charts together.
*/

$(function () {
   $(".dropdown-button").dropdown();
   $(".button-collapse").sideNav();
   Highcharts.setOptions({
     colors: ['#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
   });
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */
    $('#phisdata').bind('mousemove touchmove touchstart', function (e) {
        var chart,
            point,
            i,
            event;

        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
            point = chart.series[0].searchPoint(event, true); // Get the hovered point

            if (point) {
                point.highlight(e);
            }
        }
    });
    /**
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    Highcharts.Pointer.prototype.reset = function () {
        return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function (event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
        var thisChart = this.chart;

        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
            Highcharts.each(Highcharts.charts, function (chart) {
                if (chart !== thisChart) {
                    if (chart.xAxis[0].setExtremes) { // It is null while updating
                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                }
            });
        }
    }

    // Get the data. The contents of the data file can be viewed at
    // https://github.com/highcharts/highcharts/blob/master/samples/data/activity.json
    $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=activity.json&callback=?', function (activity) {
        $.each(activity.datasets, function (i, dataset) {

            // Add X values
            dataset.data = Highcharts.map(dataset.data, function (val, j) {
                return [activity.xData[j], val];
            });

            $('<div class="chart">')
                .appendTo('#phisdata')
                .highcharts({
                    chart: {
                        marginLeft: 40, // Keep all charts left aligned
                        spacingTop: 20,
                        spacingBottom: 20
                    },
                    title: {
                        text: dataset.name,
                        align: 'left',
                        margin: 0,
                        x: 30
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes
                        },
                        labels: {
                            format: '{value} km'
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        positioner: function () {
                            return {
                                x: this.chart.chartWidth - this.label.width, // right aligned
                                y: -1 // align to title
                            };
                        },
                        borderWidth: 0,
                        backgroundColor: 'none',
                        pointFormat: '{point.y}',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '18px'
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    series: [{
                        data: dataset.data,
                        name: dataset.name,
                        type: dataset.type,
                        color: Highcharts.getOptions().colors[i],
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' ' + dataset.unit
                        }
                    }]
                });
        });
   });
});


$(function () {
   Highcharts.setOptions({
     colors: ['#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
   });
   $('#activity-pie-chart').highcharts({
     chart: {
         plotBackgroundColor: null,
         plotBorderWidth: null,
         plotShadow: false,
         type: 'pie'
     },
     title: {
         text: 'Activity Summary'
     },
     tooltip: {
         pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
     },
     plotOptions: {
         pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             dataLabels: {
                 enabled: true,
                 format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                 style: {
                     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                 }
             }
         }
     },
     series: [{
         name: 'Activities',
         colorByPoint: true,
         data: [{
             name: 'drinking',
             y: 56.33
         }, {
             name: 'smoking',
             y: 24.03,
             sliced: true
         }, {
             name: 'eating',
             y: 10.38
         }, {
             name: 'playing rugby',
             y: 4.77
         }, {
             name: 'singing opera',
             y: 0.91
         }, {
             name: 'nothing',
             y: 0.2
         }]
     }]
   });
});


$(function () {
   Highcharts.setOptions({
     colors: ['#adfc71', '#dd616e', '#454545', '#b3aee5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
   });
   $('#compliance-pie-chart').highcharts({
     chart: {
         plotBackgroundColor: null,
         plotBorderWidth: null,
         plotShadow: false,
         colors: ['#adfc71', '#dd616e'],
         type: 'pie'
     },
     title: {
         text: 'Compliance'
     },
     tooltip: {
         pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
     },
     colors: ['#adfc71', '#dd616e'],
     plotOptions: {

         pie: {
             allowPointSelect: true,
             cursor: 'pointer',
             colors: ['#adfc71', '#dd616e'],
             dataLabels: {
                 enabled: true,
                 format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                 style: {
                     colors: ['#adfc71', '#dd616e']
                 }
             }
         }
     },
     series: [{
         name: 'Compliance',
         colorByPoint: true,
         data: [{
             name: 'answered',
             y: 83
         }, {
             name: 'non-answered',
             y: 17,
             sliced: true
         }]
     }]
   });
});

$(function () {
    $('#study-progress').highcharts({
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Study Progress'
        },
        subtitle: {
            text: 'John Apple'
        },
        xAxis: [{
             categories: ['Oct 1, 2016', 'Oct 2, 2016', 'Oct 3, 2016', 'Oct 4 2016', 'Oct 5, 2016', 'Oct 6, 2016',
                'Oct 7, 2016', 'Oct 8, 2016', 'Oct 9, 2016', 'Oct 10, 2016', 'Oct 11, 2016', 'Oct 12, 2016'],
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value} hours',
                style: {
                    color: Highcharts.getOptions().colors[8]
                }
            },
            title: {
                text: 'Hours of Data',
                style: {
                    color: Highcharts.getOptions().colors[8]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Number of Surveys',
                style: {
                    color: Highcharts.getOptions().colors[8]
                }
            },
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[8]
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
            y: 100,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'Surveys',
            type: 'column',
            yAxis: 1,
            color: '#454545',
            data: [6, 9, 11, 14, 2, 2, 13, 9, 5, 2, 3, 4],
            tooltip: {
                valueSuffix: ''
            }

        }, {
            name: 'Hours of Data',
            type: 'spline',
            color: '#b3aee5',
            data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 24, 18.3, 23.3, 18.3, 13.9, 9.6],
            tooltip: {
                valueSuffix: ' hours'
            }
        }]
    });
});


