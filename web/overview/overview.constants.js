(function(){

    /***** Constants Singleton object for all the studies *****/

   "use strict";
   angular.module('researchApp')
   .constant('OverviewConstants',
    {
        alcoholStudy:{
            nameOfStudy: "Campus Safety",
            link: "safety",
            imageLink:"resources/images/safety.jpg",
            description: "The Campus Safety Survey was conducted to examine what makes students feel unsafe, where they feel the most protected, and what campus safety officers can do to improve feelings of security."
        },
        nimhStudy:{
            nameOfStudy: "Student Satisfaction",
            link: "satisfaction",
            imageLink:"resources/images/satisfaction.jpg",
            description: "Here is some more information about this product that is only revealed once clicked on."

        },
        moodDysregulationStudy:{
            nameOfStudy: "Sexual Assault",
            link: "moodDesregulationStudy.html",
            imageLink:"resources/images/assault.jpg",
            description: "Here is some more information about this product that is only revealed once clicked on."

        },
        sluWatchStudy:{
            nameOfStudy: "Mumps Spread",
            link: "alcoholCravingStudy.html",
            imageLink:"resources/images/doctor.jpg",
            description: "Here is some more information about this product that is only revealed once clicked on."
        }

    });
})();
