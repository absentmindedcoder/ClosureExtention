window.onload = function(){
	document.getElementById('submit').addEventListener('click', sendRequest);
	document.getElementById('addscript').addEventListener('click', addScript);
};

function addScript(){
	var input = document.createElement('input');
	input.name = 'code_url';
	input.type = 'hidden';
	input.value = document.getElementById('scriptUrl').value;
	var label = document.getElementById('scriptUrl');
	document.getElementById('fileAdded').innerText = label.value.substring(label.value.lastIndexOf('/')+1) + ' Added!';
	document.getElementById('scriptUrl').value = "";
	document.getElementById('form').appendChild(input);
}

function sendRequest(){
	var wsCall = new XMLHttpRequest();
	
	wsCall.onreadystatechange = (function(){
  		if (wsCall.readyState==4 && wsCall.status==200){
			displayResults(wsCall.responseText);
		}
  	});
  	
  	var params = "";
  	var inputs = document.getElementsByTagName('input');
  	for(var i = 0; i < inputs.length; i++){
  		if(inputs[i].value !== "" && inputs[i].value !== "undefined")
  			params += inputs[i].name + "=" + inputs[i].value + "&";
  	}
  	var level = document.getElementById("compilationLevel");
  	params += level.name + "=" + level[level.selectedIndex].value;
	var code = document.getElementById('code');
  	params += "&" + code.name + "=" + encodeURIComponent(code.value);
	
	wsCall.open("POST","http://closure-compiler.appspot.com/compile",true);
	wsCall.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	wsCall.send(params);

}

function displayResults(response){
	var results = JSON.parse(response);
	
	if(typeof(results.errors) !== "undefined"){
		var errMsg = "Errors: " + results.errors.length;
		for(var i = 0; i < results.errors.length; i++){
			errMsg += "\n";
			errMsg += results.errors[i].type + " : " + results.errors[i].error + " at line " + results.errors[i].lineno + " character " + results.errors[i].charno
			errMsg += "\n" + results.errors[i].line;
			errMsg += "\n";
			for(var j = 0; j < results.errors[i].charno; j++)
				errMsg += " ";
			errMsg += "^";
		}
		document.getElementById("origSize").innerText = " ";
		document.getElementById("minSize").innerText = " ";
		document.getElementById("sizeSaved").innerText = " ";
		document.getElementById("output").value = errMsg;
		
		var resultText = document.getElementById("result");
		resultText.className = "error";
		resultText.innerText = "Minification encountered an error!";
	}else{
		document.getElementById("output").value = results.compiledCode;
		document.getElementById("origSize").innerText = " " + results.statistics.originalSize + " bytes";
		document.getElementById("minSize").innerText = " " + results.statistics.compressedSize + " bytes";
	
		var percentSaved = (results.statistics.originalSize - results.statistics.compressedSize) / results.statistics.originalSize;
		var bytesSaved = Math.round(results.statistics.originalSize * percentSaved);
	
		document.getElementById("sizeSaved").innerText = " " + (percentSaved * 100).toFixed(2) + "% (" + bytesSaved + " bytes)";
		
		var resultText = document.getElementById("result");
		resultText.className = "success";
		resultText.innerText = "Minification successful!";
	}
}