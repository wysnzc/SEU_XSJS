<?php
/*
login handler的作用
1.返回处理结果json,包括成功\失败信息,若成功,还包括用户名
2.若成功,向session写入所有需要的信息
*/
session_start();
$response=array();

if($_SERVER['REQUEST_METHOD']=='GET'){
    $_SESSION = array();
    setcookie(session_name(), '', time() - 42000);
    $response['msg']='注销成功.';
    $response['flag']='ok';

}else if($_SERVER['REQUEST_METHOD']=='POST'){

    require 'database_keys/testdb0802.php';
    
    try {
        $conn=new PDO("mysql:host=$servername;dbname=$database",$db_username,$db_password);
        
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt=$conn->prepare("SELECT password,score FROM member WHERE username=:username");
        $username=trim($_POST["username"]);
        $stmt->bindParam(':username', $username);
        
        $stmt->execute();
        
        $rows=$stmt->fetchAll();
        $rowCount=$stmt->rowCount();
        
        if($rowCount==1 && $rows[0]['password']==trim($_POST["password"])){
            
            $response['flag']='ok';
            $response['msg']='登录成功.';
            $response['username']=$username;
            $_SESSION['user']=$username;

            if(preg_match('/^admin(\w{2})$/', $username , $reg)){
                
                $response['type']='admin';
                $response['depa_id']=$reg[1];

                $_SESSION['type']='admin';
                $_SESSION['admin_id']=$reg[1];
                //至此,session里录入了 用户名 用户类型(管理员) 院系编号

            }else if($rows[0]['score']==-1){

                $response['type']='user_not_done';

                $_SESSION['type']='exam';
                //至此,session里录入了 用户名 用户类型(考试学生)

            }else{
                $response['type']='user_done';
                $response['score']=$rows[0]['score'];

                $_SESSION['type']='score';
                $_SESSION['score']=$rows[0]['score'];
                //至此,session里录入了 用户名 用户类型(查分学生) 分数
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