//alert("fuck");

/*
2018/08/08
此js文件解决了ajax提交form的问题
index.html中js引入顺序为:
jquery
jquery-form
helper(不依赖jq)
formbinder4index(依赖于前3项)
*/

$(document).ready(function() {
	//以下内容将在页面加载完毕执行
	//alert("fuck 2");
	$("#FORM_login").ajaxForm(loginHandler);
	//alert("fuck3");
});