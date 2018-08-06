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
echo "<br>==============================<br>";


if(isset($_SESSION['user']) && !empty($_SESSION['user'])){
    //echo "Welcome ",$_SESSION['user'],"<br>";
    echo "<script>flag='already_login';</script>";
}else{
    echo "<script>flag='not_login';</script>";
}

require 'view/index.html';

?>
