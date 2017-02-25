var database = firebase.database();
var blueprints = {}

function createStudiesObject(){
   //Get current user. Retrieve all surveys corresponding to the user.
   var user_surveys = []
   var userRef = firebase.database().ref('users/user1/surveys/');
   userRef.once('value', function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
         user_surveys.push(childSnapshot.val());
      });
   });

   var demo_study
   // Parse through data blueprint & retreive corresponding data
   var blueprintRef = database.ref('blueprints/');

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

            shallow_dataRef = database.ref('data/' + childSnapshot.key);
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
      parse_blueprint(blueprints);
   });
   function parse_blueprint(blueprints){
      blueprints = blueprints;
   }

}
createStudiesObject();