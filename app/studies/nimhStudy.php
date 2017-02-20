<?php
header('Access-Control-Allow-Origin: *');
include_once('../config/database.php');

//Get a new DB object and use it for this study
$db = new Database();

//query for surveys complete
$study_surveys_sql = 'select patient, COUNT(*) from nimhTest where patient IN (select Distinct patient from nimhTest ) and surveylabel !="Suspension" group by patient;';
$study_surveys_result = $db->executeQuery($study_surveys_sql);
$study_stats = array();


if ($study_surveys_result->num_rows > 0) {
    // output data of each row
    while($row = $study_surveys_result->fetch_assoc()) {
      $participant_survey = array();
      $participant_survey["user"] = $row["patient"];
      $participant_survey["survey-count"] = intval($row["COUNT(*)"]);
      array_push($study_stats, $participant_survey);
    }
    
}
//query for all surveys taken by a patient
$num_of_surveys_sql = "select patient, COUNT(*) as totalSurvey from nimhTest where patient IN (select Distinct patient from nimhTest ) group by patient;";
$num_of_surveys_result = $db->executeQuery($num_of_surveys_sql);
if ($num_of_surveys_result->num_rows > 0) {
   $i = 0;
    while($row = $num_of_surveys_result->fetch_assoc()) {
      $study_stats[$i]["totalSurveyCount"] = intval($row["totalSurvey"]);
      $i++;
    }
}
//query for days in study
$study_days_sql = 'SELECT patient,COUNT(DISTINCT DATE_FORMAT(STR_TO_DATE(SurveyStart, "%c/%e/%Y %H:%i"), "%Y-%m-%d")) AS dates from nimhTest where patient IN (select DISTINCT patient from nimhTest) and surveylabel != "Suspension" GROUP BY patient;';
$study_days_result = $db->executeQuery($study_days_sql);

if ($study_days_result->num_rows > 0) {
   $i = 0;
    while($row = $study_days_result->fetch_assoc()) {
      $study_stats[$i]["day-count"] = intval($row["dates"]);
      $i++;
    }
}
//query to get mood change stats for all the users

$user_mood_changes_sql = "select participant,total_mood_changes,positive_changes,negative_changes from nimhTestStats where participant!= 1111 order by participant;";
$user_mood_changes_result = $db->executeQuery($user_mood_changes_sql);

if ($user_mood_changes_result->num_rows > 0) {
   $i = 0;
    while($row = $user_mood_changes_result->fetch_assoc()) {
      $study_stats[$i]["total_mood_changes"] = intval($row["total_mood_changes"]);
      $study_stats[$i]["positive_changes"] = intval($row["positive_changes"]);
      $study_stats[$i]["negative_changes"] = intval($row["negative_changes"]);
      $i++;
    }
}

//query to get meta-data for all user

$all_user_meta_data_sql = "select * from nimhTestStats where participant=1111;";
$all_user_meta_data_result = $db->executeQuery($all_user_meta_data_sql);

if ($all_user_meta_data_result->num_rows > 0) {
   $all_user_study_stats = $all_user_meta_data_result->fetch_assoc() ;
   $all_user_study_stats=array_slice($all_user_study_stats,2);
   //$all_user_study_stats["participants"] = $study_stats;
}

//query to get missed surveys and compliance
$total_completed_surveys_sql = 'select COUNT(*) from nimhTest where patient IN (select Distinct patient from nimhTest ) and surveylabel !="Suspension";';
$total_surveys_sql= "select COUNT(*) from nimhTest where patient IN (select Distinct patient from nimhTest );";

$total_completed_surveys_result = $db->executeQuery($total_completed_surveys_sql);
$total_surveys_result= $db->executeQuery($total_surveys_sql);

if ($total_surveys_result->num_rows > 0 && $total_completed_surveys_result->num_rows >0) {
  $all_surveys=$total_surveys_result->fetch_assoc();
  $all_completed_surveys=$total_completed_surveys_result->fetch_assoc();
}
json_encode($all_surveys);
json_encode($all_completed_surveys);
$all_user_study_stats["missed_surveys"]=$all_surveys['COUNT(*)']-$all_completed_surveys['COUNT(*)'];

//query for compliance for each user
$all_surveys_view_sql ='CREATE OR REPLACE VIEW allcompletedsurveys AS select patient, COUNT(*) as surveys from nimhTest where patient IN (select Distinct patient from nimhTest ) and surveylabel !="Suspension" group by patient;';
$view_result = $db->executeQuery($all_surveys_view_sql);
$all_completed_surveys_view_sql = "CREATE OR REPLACE VIEW allsurveys AS select patient, COUNT(*) as surveys from nimhTest where patient IN (select Distinct patient from nimhTest ) group by patient;";
$view_result_1 = $db->executeQuery($all_completed_surveys_view_sql);

$user_compliance_sql ="select c.patient , (c.surveys/a.surveys) as compliance from allcompletedsurveys c inner join allsurveys a ON c.patient=a.patient; ";

$user_compliance_result=$db->executeQuery($user_compliance_sql);
if ($user_compliance_result->num_rows > 0) {
   $i = 0;
    while($row = $user_compliance_result->fetch_assoc()) {

      $study_stats[$i]["compliance"] = floatval($row["compliance"]);
      $i++;
    }
}

//Query for getting startdate and enddate for each patient
$user_get_dates_sql = 'SELECT distinct patient, MIN(DATE_FORMAT(STR_TO_DATE(SurveyStart, "%c/%e/%Y %H:%i"), "%Y-%m-%d")) as startDate,MAX(DATE_FORMAT(STR_TO_DATE(SurveyStart, "%c/%e/%Y %H:%i"), "%Y-%m-%d")) as endDate
FROM nimhTest
WHERE
  patient IN ( SELECT patient FROM (
     SELECT DISTINCT patient
          FROM nimhTest
    ) l
  ) and surveystart!="" GROUP BY patient;';

$user_get_dates_result = $db->executeQuery($user_get_dates_sql);

if ($user_get_dates_result->num_rows > 0) {
   $i = 0;
    while($row = $user_get_dates_result->fetch_assoc()) {
      date_default_timezone_set('America/Chicago');
      $startDate = date('F d Y', strtotime($row["startDate"]));
      $endDate = date('F d Y', strtotime($row["endDate"]));
      $study_stats[$i]["startDate"] = $startDate;
      $study_stats[$i]["endDate"] = $endDate;
      $i++;
    }
}

//Close Connection
$db->closeConnection();
//Add study stats array as an object at "participants"

$all_user_study_stats["participants"] = $study_stats;

file_put_contents("nimhStudyResponse.json",json_encode($all_user_study_stats));
?>
