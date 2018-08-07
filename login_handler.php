<?php
session_start();

$response=array();

if($_SERVER['REQUEST_METHOD']=='GET'){
    $_SESSION = array();
    setcookie(session_name(), '', time() - 42000);
    $response['msg']='注销成功.';
    $response['flag']='ok';

}else if($_SERVER['REQUEST_METHOD']=='POST'){
    //这里要对$_POST["username"]和$_POST["password"]做验证,防止sql注入(还没写)
    require 'database_keys/testdb0802.php';
    
    try {
        $conn=new PDO("mysql:host=$servername;dbname=$database",$db_username,$db_password);
        
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt=$conn->prepare("SELECT password,score FROM member WHERE username=:username");
        $username=$_POST["username"];
        $stmt->bindParam(':username', $username);
        
        $stmt->execute();
        
        $rows=$stmt->fetchAll();
        $rowCount=$stmt->rowCount();
        
        if($rowCount==1 && $rows[0]['password']==$_POST["password"]){
            
            $response['flag']='ok';
            $response['msg']='登录成功.';
            $response['username']=$username;
            $_SESSION['user']=$username;
            if(preg_match('/^admin(\w{2})$/', $username , $reg)){
                $response['type']='admin';
                $response['depa_id']=$reg[1];
            }else if($rows[0]['score']==-1){
                $response['type']='user_not_done';
            }else{
                $response['type']='user_done';
                $response['score']=$rows[0]['score'];
                $_SESSION['score']=$rows[0]['score'];
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