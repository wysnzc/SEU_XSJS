$(document).ready(function(){
	//页面加载完执行
	switch(pageArgs['flag']){
		case 'not_login':
			setLayout('login');
			break;
		case 'already_login':
			user_name=pageArgs['username'];
			if(pageArgs['score']){
				user_score=pageArgs['score'];
				setLayout('check_score');
			}else{
				alert("检测到你已登录,将跳转到考试页面.");
				window.location.assign('exam.php');
			}
			break;
	}

	$("#FORM_login").ajaxForm(loginHandler);
});

//页面加载前执行
var pageArgs=JSON.parse(pageArgsStr);

var user_name;

function onLogoutSubmit(){
	var xmlhttp=new XMLHttpRequest();
	//约定:对于login_handler.php,get是退出,post是登录
	xmlhttp.open("get","login_handler.php",true);
	
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var resObj=JSON.parse(xmlhttp.responseText);
			alert(resObj['msg']);
			if(resObj['flag']=='ok'){
				window.location.assign('index.php');
			}
		}
	};
	xmlhttp.send(null);
}

function loginHandler(data){	
	var xmlhttp=new XMLHttpRequest();
	var resObj=JSON.parse(data);
	if(resObj['flag']=='ok'){
		user_name=resObj['username'];
		switch(resObj['type']){
			case 'admin':
			alert("管理员身份验证成功!");
			window.location.assign('department.php');
			break;

			case 'user_not_done':
			alert("登录成功,将转入考试页面!");
			window.location.assign('exam.php');
			break;

			case 'user_done':
			document.getElementById('prompt').innerHTML=resObj['msg'];
			user_score=resObj['score'];
			setLayout('check_score');
			break;
		}

	}else{
		alert(resObj['msg']);
		//document.getElementById('login').children[2].disabled=false;
	}
}

//----------------------------------布局相关------------------------------------------
var layout_arr=['login','logout','check_score'];

function hideDiv(id){
	document.getElementById(id).style.display = "none";
}

function showDiv(id){
	document.getElementById(id).style.display = "";
}

function showOnly(arr){
	for(var i=0;i<layout_arr.length;i++){
		hideDiv(layout_arr[i]);
	}
	for(i=0;i<arr.length;i++){
		showDiv(arr[i]);
	}
}

function setLayout(layout){
	switch(layout){
	case 'login':
		showOnly(['login']);
		//document.getElementById('login_submit').disabled=false;
		break;
	case 'check_score':
		//考完的再登录查分
		showOnly(['logout','check_score']);
		document.getElementById('check_score_NAME').innerHTML=user_name;
		document.getElementById('check_score_SCORE').innerHTML=user_score;

		break;
	}
}

