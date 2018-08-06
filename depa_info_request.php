<?php
session_start();
$response=array();

if(isset($_SESSION['user']) && !empty($_SESSION['user'])){
    if(preg_match('/^admin(\w{2})$/', $_SESSION['user'] , $reg)){
    	//$reg[1]是院系编号
    	getDataFromDepartment($reg[1]);
    }else{
    	$response['flag']='fail';
    	$response['msg']='你不是管理员,不能查询!';
    }
}else{
	$response['flag']='fail';
	$response['msg']='查询前请先登录.';
}

echo json_encode($response);


function getDataFromDepartment($depa_id){
	global $response;
	$response['gdata']=array();
	require 'database_keys/testdb0802.php';
    try {
        $conn=new PDO("mysql:host=$servername;dbname=$database",$db_username,$db_password);
        
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt=$conn->prepare("SELECT password,score FROM member 
        	WHERE department_id=:did AND username!=:uname");

        $stmt->bindValue(':did', $depa_id);
        $stmt->bindValue(':uname',$_SESSION['user']);
        
        $stmt->execute();
        
        $rows=$stmt->fetchAll();
        foreach ($rows as $key => $value) {
        	$response['gdata'][$key]=array($value['password'],$value['score']);
        }
        $response['flag']='ok';
    }
    catch(PDOException $ex){
    	global $response;
        $response['flag']='fail';
        $response['msg']=$ex->getMessage();
    }
    $conn=null;
}

?>