<script>
var flag='start';
</script>

<?php
session_start();
require 'db_init.php';
if($GLOBALS['resFlag']!='ok'){
    echo $GLOBALS['errorMsg'];
    exit();
}

echo "<br>==========php代码测试============<br>";
//在这儿测试一些后端语句比较方便
echo "sid=",session_id();

echo "<br>==============================<br>";

$response=array();
//response是个数组,其值将会作为json传递给index.html,下面将会为它合理地赋值

require 'exam_conf.php';
$response['time_limit']=$conf_time_limit-60;//无论是否登录,都应该传递这个参数,因为在页面登录时并不会刷新页面,也就是这些index.php的代码只会在刚打开页面时执行一次

if(isset($_SESSION['user']) && !empty($_SESSION['user'])){
    //echo "Welcome ",$_SESSION['user'],"<br>";
    $response['flag']='already_login';
    $response['username']=$_SESSION['user'];
    if(isset($_SESSION['score'])){
    	$response['score']=$_SESSION['score'];
    }
}else{
    $response['flag']='not_login';
}

echo "<script>var sysParam=JSON.parse('",json_encode($response),"');</script>";

require 'view/index.html';

?>
