//<!-- 兼容性处理 -->
//addEventListener的IE8兼容,网上查的
(function() {
	  if (!Element.prototype.addEventListener) {
	    var eventListeners=[];
	    
	    var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
	      var self=this;
	      var wrapper=function(e) {
	        e.target=e.srcElement;
	        e.currentTarget=self;
	        if (typeof listener.handleEvent != 'undefined') {
	          listener.handleEvent(e);
	        } else {
	          listener.call(self,e);
	        }
	      };
	      if (type=="DOMContentLoaded") {
	        var wrapper2=function(e) {
	          if (document.readyState=="complete") {
	            wrapper(e);
	          }
	        };
	        document.attachEvent("onreadystatechange",wrapper2);
	        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
	        
	        if (document.readyState=="complete") {
	          var e=new Event();
	          e.srcElement=window;
	          wrapper2(e);
	        }
	      } else {
	        this.attachEvent("on"+type,wrapper);
	        eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
	      }
	    };
	    var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
	      var counter=0;
	      while (counter<eventListeners.length) {
	        var eventListener=eventListeners[counter];
	        if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
	          if (type=="DOMContentLoaded") {
	            this.detachEvent("onreadystatechange",eventListener.wrapper);
	          } else {
	            this.detachEvent("on"+type,eventListener.wrapper);
	          }
	          eventListeners.splice(counter, 1);
	          break;
	        }
	        ++counter;
	      }
	    };
	    Element.prototype.addEventListener=addEventListener;
	    Element.prototype.removeEventListener=removeEventListener;
	    if (HTMLDocument) {
	      HTMLDocument.prototype.addEventListener=addEventListener;
	      HTMLDocument.prototype.removeEventListener=removeEventListener;
	    }
	    if (Window) {
	      Window.prototype.addEventListener=addEventListener;
	      Window.prototype.removeEventListener=removeEventListener;
	    }
	  }
	})();

//<!-- 变量声明 -->

//考试相关
var exam_data;//题目内容,由服务器来赋值

var qnum_current=1;//当前题号
var ans_current='';//当前题目选择的答案
var ans_arr=[];//答案数组(记录用户选择的答案,下标是题号,从1开始)
var ans_string='';//答案字符串,比如'ABTF',最后发送给服务器用来判分

var choice_cnt;//选择题总数
var judge_cnt;//判断题总数

//系统相关
var exam_click_registered=false;//点击事件已注册(初始为假,注册后为真)

//用户信息相关
var user_name;//用户名
var user_score;//得分

//<!-- 核心函数 -->

//提交试卷
function submitPaper(timeout=false){
	//alert("s");
	ans_string='';
	for(var i=1;i<(choice_cnt+judge_cnt+1);i++){
		if(ans_arr[i]){
			ans_string+=ans_arr[i];
		}else{
			if(timeout){
				ans_arr[i]='N';
				ans_string+='N';
			}else{
				alert("有题目未完成,不能提交. ");
				return;
			}
		}
	}
	//alert("你的答案:"+ans_string);
	
	if(!timeout){
		if(!window.confirm('你确定要提交试卷吗?')){
			return;
		}
	}

	
	
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("get","submit_paper.php?ans="+ans_string,true);
	
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var resObj=JSON.parse(xmlhttp.responseText);
			
			/*
			此处协议:
				resObj.flag: 标记字符串 值为ok/fail
				resObj.score: 整型 得分
				resObj.wrongs: json对象 一个二维数组 第一维是错题 第二维是题号\正确答案
				resObj.msg: 错误提示
			*/
			
			switch(resObj.flag){
			case 'ok':
				clearInterval(exam_timer_id);
				alert('试卷提交成功,卷已判!');
				setLayout('exam_finish',resObj['wrongs'],resObj['score']);
				break;
			default:
				alert(resObj.msg);
			}
			
		}
	};
	xmlhttp.send(null);
	if(timeout){
		alert('考试结束!试卷已自动提交.');
	}
}

//获取指定题目
function getQ(qnum,which){

	var data;
	var index;
	if(qnum<=choice_cnt){
		data=exam_data.choice;
		index=qnum-1;
	}else{
		data=exam_data.judge;
		index=qnum-choice_cnt-1;
	}

	which=which.toLowerCase();

	switch(which){
		case 'body':
		return data[index].question;
		break;
		case 'a':
		return data[index].opt_a;
		break;
		case 'b':
		return data[index].opt_b;
		break;
		case 'c':
		return data[index].opt_c;
		break;
		case 'd':
		return data[index].opt_d;
		case 't':
		return '正确';
		break;
		case 'f':
		return '错误';
		break;
		case 'n':
		return '未填写';
		break;
	}
}

//跳转到指定题号的题目,qnum是题号,从1开始
function gotoQ(qnum){
	var examDiv=document.getElementById('exam');
	if(examDiv.style.display!=='')
		examDiv.style.display='';
	var timePrompt=examDiv.children[0];
	var head=examDiv.children[1];
	var part1=examDiv.children[2];
	var part2=examDiv.children[3];
	var lastBtn=examDiv.children[4];
	var nextBtn=examDiv.children[5];
		
	if(isNaN(qnum)){
		qnum=1;
	}
	
	if(qnum==1){
		lastBtn.disabled=true;
	}else if(lastBtn.disabled===true){
		lastBtn.disabled=false;
	}
	
	if(qnum==(choice_cnt+judge_cnt)){
		nextBtn.value='提交';
	}else{
		nextBtn.value='下一题';
	}
	
	if(qnum<1 || qnum>(choice_cnt+judge_cnt)){
		return;
	}
	
	ans_arr[qnum_current]=ans_current;//保存当前题目的答案
	qnum_current=qnum;//跳转题目
	ans_current=ans_arr[qnum_current];//读取当前题目的答案
	
	head.innerHTML="第"+qnum_current+"题";
	
	if(qnum<=choice_cnt){
		//选择题
		head.innerHTML="选择题(共"+choice_cnt+"题) 第"+qnum+"题";
		
		
		part2.style.display='none';
		
		var questionDiv=part1.children[0];
		var optionsDiv=part1.children[1];

		questionDiv.innerHTML=getQ(qnum,'body');
		optionsDiv.children[1].innerHTML=getQ(qnum,'A');
		optionsDiv.children[3].innerHTML=getQ(qnum,'B');
		optionsDiv.children[5].innerHTML=getQ(qnum,'C');
		optionsDiv.children[7].innerHTML=getQ(qnum,'D');
		
		//下面和radio相关的部分是用来通过脚本自动选中已经做过的题目的选项的
		var radio=-1;
		switch(ans_arr[qnum_current]){
		case 'A':
			radio=0;
			break;
		case 'B':
			radio=2;
			break;
		case 'C':
			radio=4;
			break;
		case 'D':
			radio=6;
			break;
		}
		if(radio!=-1)
			optionsDiv.children[radio].checked=true;
		else{
			optionsDiv.children[0].checked=false;
			optionsDiv.children[2].checked=false;
			optionsDiv.children[4].checked=false;
			optionsDiv.children[6].checked=false;
		}
		
		part1.style.display='';
	}else{
		//判断题
		head.innerHTML="判断题(共"+judge_cnt+"题) 第"+(qnum-choice_cnt)+"题";
		
		part1.style.display='none';
		var questionDiv=part2.children[0];
		var optionsDiv=part2.children[1];

		questionDiv.innerHTML=getQ(qnum,'body');

		var radio=-1;
		switch(ans_arr[qnum_current]){
		case 'T':
			radio=0;
			break;
		case 'F':
			radio=2;
			break;
		}
		if(radio!=-1)
			optionsDiv.children[radio].checked=true;
		else{
			optionsDiv.children[0].checked=false;
			optionsDiv.children[2].checked=false;
		}
		part2.style.display='';
	}
}

//向服务器发送开始考试的请求
function onExamRequest(){
	setLayout('exam_loading');
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("get","exam_content.php",true);
	
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var resObj=JSON.parse(xmlhttp.responseText);
			/*
			responseText是服务器返回的结果,它是一个json字符串,解析后内容如下:
				//flag,值为'ok'或'fail'
				//msg,当请求顺利完成时(ok),值为一个json字符串,表示考试题目
				//当请求失败时(fail).值为失败信息.
			*/
			if(resObj.flag!='ok'){
				alert(resObj.msg);
				setLayout('before_exam');
				return
			}
			
			examTimerInit();


			setLayout('exam');
			exam_data=JSON.parse(resObj.msg);
			
			choice_cnt=exam_data.choice.length;
			judge_cnt=exam_data.judge.length;
			
			//初始化
			ans_arr=[];
			ans_current='';
			qnum_current=1;
			
			gotoQ(1);
			
			//注册点击事件(选项\上一题\下一题)
			if(!exam_click_registered){
				exam_click_registered=true;//防止重复注册事件
				document.getElementById('exam').addEventListener("click",function(e){
					var value=e.target.value;
					//alert(value);
					if(value=='A' || value=='B' || 
					   value=='C' || value=='D' ||
					   value=='T' || value=='F')
					{
						//alert(value);
						ans_current=value;
					}else if(value=='下一题'){
						gotoQ(qnum_current+1);
					}else if(value=='上一题'){
						gotoQ(qnum_current-1);
					}else if(value=='提交'){
						ans_arr[qnum_current]=ans_current;
						submitPaper();
					}
				});
			}
		}
	};
	xmlhttp.send(null);
}

//<!-- 登录\退出按钮的响应函数 -->

function onLogoutSubmit(){
	setLayout('login');
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
	//alert("fuck1");
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
			document.getElementById('prompt').innerHTML=resObj['msg'];
			setLayout('before_exam');
			break;

			case 'user_done':
			document.getElementById('prompt').innerHTML=resObj['msg'];
			user_score=resObj['score'];
			setLayout('check_score');
			break;
		}

	}else{
		alert(resObj['msg']);
		document.getElementById('login').children[2].disabled=false;
	}
}

//<!--计时器 变量及函数-->
var exam_time_limit;//考试时限,单位秒
var exam_start_time;
var exam_timer_id;
function examTimerInit(){
	var now=(new Date()).getTime()/1000;
	exam_start_time=now;
	exam_timer_id=setInterval("examTimer()",1000);
	showDiv('exam_TIME');
	hideDiv('exam_TIME_OUT');
}
function examTimer(){
	
	var time=(new Date()).getTime()/1000;
	var past=time-exam_start_time;
	var left=Math.round(exam_time_limit-past);
	if(left<0){
		showDiv('exam_TIME_OUT');
		hideDiv('exam_TIME');
		submitPaper(true);//参数为true表示考试时间已到强制提交
		clearInterval(exam_timer_id);
		return;
	}
	var dom=document.getElementById('exam_SECOND');
	dom.innerHTML=left;
	//这将是一个按一定频率反复被调用的函数
}

var shutdown_time_limit=60;
var shutdown_start_time;
function shutdownTimerInit(){
	shutdown_start_time=(new Date()).getTime()/1000;
	var xhr=new XMLHttpRequest();
	xhr.open("get",'login_handler.php');//申请注销
	xhr.send(null);
	setInterval("shutdownTimer()",1000);
}
function shutdownTimer(){
	var dom=document.getElementById('exam_finish_TIME');
	var time=(new Date()).getTime()/1000;
	var past=time-shutdown_start_time;
	var left=Math.round(shutdown_time_limit-past);
	if(left<0){
		window.location.assign('index.php');
		return;
	} 
	dom.innerHTML=left;
}

//<!-- 页面布局 变量及函数 -->

var layout_arr=['login','exam_loading','before_exam','logout','exam','exam_finish','check_score'];
//所有index.html里参与页面布局的div都要在这个数组里注册

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
	case 'before_exam':
		showOnly(['logout','before_exam']);
		break;
	case 'exam_loading':
		showOnly(['logout','exam_loading']);
		break;
	case 'exam':
		showOnly(['logout','exam']);
		break;
	case 'exam_finish':
		//刚考完试
		showOnly(['logout','exam_finish','before_exam']);//为了测试方便,此处开启"before_exam"也即是开始考试的按钮
		document.getElementById('exam_request').value="开始考试(重复)";
		var wrongs=arguments[1];//resObj['wrongs']
		var score=arguments[2];//resObj['score']
		var content="<h3>登录名为"+user_name+"的同学,你的分数是: ";
		content+=(score+"分");
		if(score==100){
			content+="!";
		}else{
			content+=".";
		}
		content+="</h3>";

		var table='<table border="1"> \
		<tr><th>错题</th><th>你的答案</th><th>正确答案</th></tr>';

		if(!wrongs) wrongs=[];
		for(var i=0;i<wrongs.length;i++){
			var q=wrongs[i][0];
			var right=wrongs[i][1];

			table+='<tr>';
			table+=('<td>'+getQ(q,'body')+'</td>');
			table+=('<td>'+getQ(q,ans_arr[q])+'</td>');
			table+=('<td>'+getQ(q,right)+'</td>');
			table+='</tr>';

		}
		table+='</table>';

		if(score!=100){
			content+=table;
		}
		document.getElementById('exam_finish_SCORE').innerHTML=content;
		shutdownTimerInit();
		break;
	case 'check_score':
		//考完的再登录查分
		showOnly(['logout','check_score','before_exam']);//为了测试方便,此处开启"before_exam"也即是开始考试的按钮
		document.getElementById('exam_request').value="开始考试(重复)";
		document.getElementById('check_score_NAME').innerHTML=user_name;
		document.getElementById('check_score_SCORE').innerHTML=user_score;

		break;
	}
}

