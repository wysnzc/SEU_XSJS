<?php
session_start();

$response=array();

if(!isset($_POST['submit']) || empty($_POST['submit'])){
    $response['flag']='fail';
    $response['msg']='请求无法识别.';
}else if($_POST['submit']=="退出"){
    //echo "退出";
    $_SESSION['user']='';
    $response['flag']='ok';
    $response['msg']='注销成功.';
}else{
    //这里要对$_POST["username"]和$_POST["password"]做验证,防止sql注入(还没写)
    require 'database_keys/testdb0802.php';
    
    try {
        $conn=new PDO("mysql:host=$servername;dbname=$database",$db_username,$db_password);
        
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt=$conn->prepare("SELECT password FROM member WHERE username=:username");
        $username=$_POST["username"];
        $stmt->bindParam(':username', $username);
        
        $stmt->execute();
        
        $rows=$stmt->fetchAll();
        $rowCount=$stmt->rowCount();
        
        if($rowCount==1 && $rows[0][0]==$_POST["password"]){
            //echo "登录成功。注册时间：",$rows[0][1],"<br>";
            $response['flag']='ok';
            $response['msg']='登录成功.';
            $_SESSION['user']=$username;
            if(preg_match('/^admin(\w{2})$/', $username , $reg)){
                $response['type']='admin';
                $response['depa_id']=$reg[1];
            }else{
                $response['type']='user';
            }


        }else{
            $response['flag']='fail';
            $response['msg']='用户名或密码不正确.';
        }
    }
    catch(PDOException $ex){
        $response['flag']='fail';
        $response['msg']=$ex->getMessage();
    }

    
    $conn=null;
}

echo json_encode($response);

?>