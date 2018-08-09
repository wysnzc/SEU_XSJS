$(document).ready(function(){
	//页面加载完执行
	onRequestGrades(false);
	document.getElementById("admin_id").innerHTML=php_department_id;
});

//页面加载前执行
var grades_data=[];

function onRequestGrades(real){
	if(real===undefined) real=true;
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("get","depa_info_request.php",true);
	
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			var resObj=JSON.parse(xmlhttp.responseText);
			if(resObj.flag=='ok'){
				grades_data=resObj['gdata'];
				stat_data=resObj['stat'];
				var table1=produceTable(grades_data,'学号','分数');
				document.getElementById('grade_table').innerHTML=table1;
				var table2=produceTable(stat_data,'院系','平均分','完成人数比例(%)');
				document.getElementById('stat_table').innerHTML=table2;
				if(real){
					alert('已从服务器获取最新数据!');
				}
				//alert(resObj.gdata);
			}else{
				alert(resObj.msg);
			}
		}
	};
	xmlhttp.send(null);
}

function produceTable(data){
	//备注:data必须是个二维数组
	//此函数具体用法参考被调用的地方
	var rowCnt=data.length;
	var colCnt=arguments.length-1;
	var table='<table border="1"><tr>';
	for(var i=0;i<colCnt;i++){
		table+='<th>';
		table+=arguments[i+1];
		table+='</th>';
	}
	table+='</tr>';

	for(i=0;i<rowCnt;i++){
		table+='<tr>';
		for(var j=0;j<colCnt;j++){
			table+='<td>';
			table+=data[i][j];
			table+='</td>';
		}
		table+='</tr>';
	}

	table+='</table>';
	return table;

}

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