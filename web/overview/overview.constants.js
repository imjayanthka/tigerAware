(function(){

    /***** Constants Singleton object for all the studies *****/
    
   "use strict";
   angular.module('researchApp')
   .constant('OverviewConstants',
    {
        alcoholStudy:{
            nameOfStudy: "Alcohol Craving",
            link: "alcoholCravingStudy.html",
            imageLink:"resources/images/alcohol.jpg",
            description: "The Alcohol Craving Study is was funded by X and was conducted to study the relationship between alcohol craving, context, and phisiological data."
        },
        nimhStudy:{
            nameOfStudy: "NIMH",
            link: "nimh",
            imageLink:"resources/images/nih.png",
            description: "Here is some more information about this product that is only revealed once clicked on."

        },
        moodDysregulationStudy:{
            nameOfStudy: "Mood Dysregulation",
            link: "moodDesregulationStudy.html",
            imageLink:"resources/images/mood.jpg",
            description: "Here is some more information about this product that is only revealed once clicked on."

        },
        sluWatchStudy:{
            nameOfStudy: "SLU WATCH",
            link: "sluWatch",
            imageLink:"resources/images/watch.png",
            description: "Here is some more information about this product that is only revealed once clicked on."
        }

    });
})();
