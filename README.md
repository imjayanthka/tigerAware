# TigerAware

TigerAware is a cross-platform survey engine allowing users to build surveys using on a mobile or desktop environment, then take surveys on a phone. A variety of question types will be supported, including:
* YesNo
* Multiple Choice
* Free Text
* Images
* Time interval
* DateTime
* Interval scale


## Getting Started

All dependencies are loaded via cdn in `web/index.html`, so no bower or npm dependcies need be installed locally. To set up a developent environment, configure an AWS ec2 instance if you wish to run the code remotely, or setup localhost. The "Campus Safety" and "Student Satisfaction" tabs will not populate with data since they are loaded via PHP on an AWS server and used for demo purposes.

You will need to configure the Firebase Database in order to fetch and update data, enter cradentials in `web/firebase.js`

```
// Initialize Firebase, cradentials provided in Slack
var config = {
 apiKey: "",
 authDomain: "",
 databaseURL: "",
 storageBucket: "",
 messagingSenderId: ""
};
firebase.initializeApp(config);
```

## Built With

* [Firebase](https://firebase.google.com/docs/database/web/start) - NoSQL realtime database, all client side
* [Angular 1](https://angularjs.org/) - Front-end framework for logic
* [AngularFire](https://github.com/firebase/angularfire/) - A library for connecting Angular with Firebase
* [Highcharts](https://www.highcharts.com/docs) - Interactive data visualization

