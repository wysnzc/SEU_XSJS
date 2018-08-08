<?php
session_start();

$args=array();

if(isset($_SESSION['type']) && $_SESSION['type']=='exam'){
	require 'exam_conf.php';
	$args['username']=$_SESSION['user'];
	$args['time_limit']=$conf_time_limit-60;
}else{
	$args['msg']='fail';
}

echo "<script>var pageArgsStr='",json_encode($args),"';</script>";
require 'view/exam.html';
?>