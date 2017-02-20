<?php
header('Access-Control-Allow-Origin: *');

require_once('../config/database.php');


$db = new Database();
$registerInfo =array();

$data = file_get_contents("php://input");
parse_str($data,$formData);


function generateSalt($max = 64) {
	$characterList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";
	$i = 0;
	$salt = "";
	while ($i < $max) {
	    $salt .= $characterList{mt_rand(0, (strlen($characterList) - 1))}; //better than rand()
	    $i++;
	}
	return $salt;
}


$username =  trim($formData['username']);
$username = strip_tags($username);
$password =  trim($formData['password']);
$password = strip_tags($password);
$user_salt = generateSalt(); // Generates a salt from the function above
$combo = $user_salt . $password; // Appending user password to the salt 
$hashed_pwd = hash('sha512',$combo); // Using SHA512 to hash the salt+password combo string

/* check if user is present */

$check_user_sql = "SELECT * FROM userInfo WHERE USERNAME = '$username'";
$check_result = $db -> executeQuery($check_user_sql);
if($check_result -> num_rows >0 ){
	$msg = "This username already exists. Please login, else, contact admin";
	$registerStatus = 2;
}
else{
	$insert_sql = "INSERT INTO userInfo(USERNAME,PASSWORD,SALT) VALUES ('$username','$hashed_pwd','$user_salt')";
	$insert_result = $db -> executeQuery($insert_sql);
	if(!$insert_result){
		$msg = "Something went wrong Please try again, or contact admin";
		$registerStatus = 0;
	}
	else{
		$msg = "Registration success. Click Login to enter the site";
		$registerStatus = 1;
	}
}
/*Load the register info to send back response */
$registerInfo['msg'] = $msg;
$registerInfo['status'] = $registerStatus;

echo json_encode($registerInfo);
$db->closeConnection();
?>