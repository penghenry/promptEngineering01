
//alert(1);
//从文件上传控件中获得完整路径名
document.getElementById('b_file_upload').addEventListener('change', function(event) {
	var filePath = event.target.value;
	//document.getElementById('filePath').textContent = filePath ? filePath : '未选择文件';
	//alert(filePath);
});



//初始信息区，清空按钮
document.getElementById('b_clear_btn').addEventListener('click', function() {

	document.getElementById('b_industry_status').value="";
	document.getElementById('b_company_status').value="";
	document.getElementById('b_project_status').value="";
	document.getElementById('b_job_name').value="";
	document.getElementById('b_job_duties').value="";
	document.getElementById('b_other_info').value="";
	document.getElementById('b_file_upload').value="";

});


//初始信息区，下一步按钮,负责生成信息收集框架区中的提示词描述
/* 提示词模板：
我需要你帮我生成一份“信息收集框架”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。
我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}，其他我还需要补充的是{other},附件是我提供的一些相关文档信息。

*/
document.getElementById('b_next_btn').addEventListener('click', function() {
	alert(2);
	var promptTpl = "我需要你帮我生成一份“信息收集框架”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。";
    promptTpl = promptTpl + "我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}";
	
	industry = document.getElementById('b_industry_status').value;
	company = document.getElementById('b_company_status').value;
	project = document.getElementById('b_project_status').value;
	jobname = document.getElementById('b_job_name').value;
	duty = document.getElementById('b_job_duties').value;
	other = document.getElementById('b_other_info').value;
	attachFile = document.getElementById('b_file_upload').value;
	
	if(industry.trim() === "" || company.trim() === "" || project.trim() === "" || jobname.trim() === "" || duty.trim() === ""){
		alert("行业，企业，项目，岗位及职责描述不能为空！");
		return;
	}
	promptTpl = promptTpl.replace("{industry}",industry).replace("{company}",company).replace("{project}",project).replace("{jobname}",jobname).replace("{duty}",duty);
	if(!other.trim() === ""){
		promptTpl = promptTpl + "其他我还需要补充的是" + other.trim();
	}
	
	if(!attachFile.trim() === ""){
		promptTpl = promptTpl + "附件是我提供的一些相关文档信息。" ;
	}
	
	//alert(promptTpl);
	//上传附件文件到后端，获得解析内容保存在服务端，并返回ok状态
	var formData = new FormData();
	var fileInput = document.getElementById("b_file_upload");
	formData.append("file", fileInput.files[0]);

	// 发送文件到服务器
	fetch('/uploadFile', {  // 替换为你的服务端URL
		method: "POST",
		body: formData
	})
	.then(response => response.json())
	.then(data => {
		alert("文件上传成功!");
	})
	.catch(error => {
		//console.error("上传失败:", error);
		alert("上传失败，请重试。");
	});
	
	
	document.getElementById('c_prompt').value = promptTpl;

});


//信息收集框架区，生成
document.getElementById('c_generate_btn').addEventListener('click', function() {
	
	const prompt = document.getElementById('c_prompt').value;
	const responseBoxChatgpt = document.getElementById('c_chatgpt_response');
	const responseBoxDoubao = document.getElementById('c_doubao_response');
	answerTypeSel = document.getElementById('c_question_type');
	answerTypeValue = answerTypeSel.options[answerTypeSel.selectedIndex].value;
	
	
	if (prompt.trim() === "") {
		alert("请提供有效的提示词描述");
		return;
	}

	try {
		
		if(answerTypeValue.indexOf("chatgpt")>-1){
			const response = fetch('/generateFromChatgpt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxChatgpt.value = data.answer;
				} else {
					responseBoxChatgpt.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});

		} 
		
		if(answerTypeValue.indexOf("doubao")>-1){
			const response = fetch('/generateFromDoubao', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxDoubao.value = data.answer;
				} else {
					responseBoxDoubao.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});
		} 
		
		if(answerTypeValue ==="chatgpt"){
			responseBoxDoubao.value = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});

//信息收集框架区，智能合并
document.getElementById('c_merge_btn').addEventListener('click', function() {
	
	//目前暂时简单相加
	chatgptRp = document.getElementById('c_chatgpt_response').value;
	doubaoRp = document.getElementById('c_doubao_response').value;
	
	document.getElementById('c_merged_output').value = chatgptRp +"\r\n" + doubaoRp ;
	
	
});


//信息收集框架区，下一步，产生下一区的提示词描述
document.getElementById('c_next_btn').addEventListener('click', function() {
	
	//只需将本区的提示词描述加上输出内容即可
	c_prompt = document.getElementById('c_prompt').value;
	c_output = document.getElementById('c_merged_output').value;
	document.getElementById('d_prompt').value = c_prompt + "我目前的信息收集框架是："+ c_output;
	
});


//检查清单区，生成
document.getElementById('d_generate_btn').addEventListener('click', function() {
	
	const prompt = document.getElementById('d_prompt').value;
	const responseBoxChatgpt = document.getElementById('d_chatgpt_response');
	const responseBoxDoubao = document.getElementById('d_doubao_response');
	answerTypeSel = document.getElementById('d_question_type');
	answerTypeValue = answerTypeSel.options[answerTypeSel.selectedIndex].value;
	
	
	if (prompt.trim() === "") {
		alert("请提供有效的提示词描述");
		return;
	}

	try {
		
		if(answerTypeValue.indexOf("chatgpt")>-1){
			const response = fetch('/generateFromChatgpt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxChatgpt.value = data.answer;
				} else {
					responseBoxChatgpt.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});

		} 
		
		if(answerTypeValue.indexOf("doubao")>-1){
			const response = fetch('/generateFromDoubao', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxDoubao.value = data.answer;
				} else {
					responseBoxDoubao.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});
		} 
		
		if(answerTypeValue ==="chatgpt"){
			responseBoxDoubao.value = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//检查清单区，智能合并
document.getElementById('d_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('d_chatgpt_response').value;
	doubaoRp = document.getElementById('d_doubao_response').value;
	
	document.getElementById('d_merged_output').value = chatgptRp +"\r\n" + doubaoRp ;
	
});


//检查清单区，下一步
document.getElementById('d_next_btn').addEventListener('click', function() {
	
	//只需将本区的提示词描述加上输出内容即可
	d_prompt = document.getElementById('d_prompt').value;
	d_output = document.getElementById('d_merged_output').value;
	document.getElementById('e_prompt').value = d_prompt + "我目前的检查清单是："+ d_output;
	
});


//决策标准，生成
document.getElementById('e_generate_btn').addEventListener('click', function() {
	
	const prompt = document.getElementById('e_prompt').value;
	const responseBoxChatgpt = document.getElementById('e_chatgpt_response');
	const responseBoxDoubao = document.getElementById('e_doubao_response');
	answerTypeSel = document.getElementById('e_question_type');
	answerTypeValue = answerTypeSel.options[answerTypeSel.selectedIndex].value;
	
	
	if (prompt.trim() === "") {
		alert("请提供有效的提示词描述");
		return;
	}

	try {
		
		if(answerTypeValue.indexOf("chatgpt")>-1){
			const response = fetch('/generateFromChatgpt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxChatgpt.value = data.answer;
				} else {
					responseBoxChatgpt.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});

		} 
		
		if(answerTypeValue.indexOf("doubao")>-1){
			const response = fetch('/generateFromDoubao', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxDoubao.value = data.answer;
				} else {
					responseBoxDoubao.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});
		} 
		
		if(answerTypeValue ==="chatgpt"){
			responseBoxDoubao.value = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//决策标准，智能合并
document.getElementById('e_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('e_chatgpt_response').value;
	doubaoRp = document.getElementById('e_doubao_response').value;
	
	document.getElementById('e_merged_output').value = chatgptRp +"\r\n" + doubaoRp ;
	
});


//决策标准，下一步
document.getElementById('e_next_btn').addEventListener('click', function() {
	
	//只需将本区的提示词描述加上输出内容即可
	e_prompt = document.getElementById('e_prompt').value;
	e_output = document.getElementById('e_merged_output').value;
	document.getElementById('f_prompt').value = e_prompt + "我目前的决策标准是："+ e_output;
	
});


//情景对话，生成
document.getElementById('f_generate_btn').addEventListener('click', function() {
	
	const prompt = document.getElementById('f_prompt').value;
	const responseBoxChatgpt = document.getElementById('f_chatgpt_response');
	const responseBoxDoubao = document.getElementById('f_doubao_response');
	answerTypeSel = document.getElementById('f_question_type');
	answerTypeValue = answerTypeSel.options[answerTypeSel.selectedIndex].value;
	
	
	if (prompt.trim() === "") {
		alert("请提供有效的提示词描述");
		return;
	}

	try {
		
		if(answerTypeValue.indexOf("chatgpt")>-1){
			const response = fetch('/generateFromChatgpt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxChatgpt.value = data.answer;
				} else {
					responseBoxChatgpt.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});

		} 
		
		if(answerTypeValue.indexOf("doubao")>-1){
			const response = fetch('/generateFromDoubao', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ prompt: prompt })
			})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				//alert(data.success);
				if (data.success) {
					//alert(data.answer);
					responseBoxDoubao.value = data.answer;
				} else {
					responseBoxDoubao.value = "Error: " + data.error;
				}	
			})
			.catch(error => {
				alert("出错了"+error.message);
			
			});
		} 
		
		if(answerTypeValue ==="chatgpt"){
			responseBoxDoubao.value = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//情景对话，智能合并
document.getElementById('f_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('f_chatgpt_response').value;
	doubaoRp = document.getElementById('f_doubao_response').value;
	
	document.getElementById('f_merged_output').value = chatgptRp +"\r\n" + doubaoRp ;
	
});


//情景对话，下一步
document.getElementById('f_next_btn').addEventListener('click', function() {
	
	document.getElementById('g_info_collection').value = document.getElementById('c_merged_output').value;
	document.getElementById('g_checklist').value = document.getElementById('d_merged_output').value;
	document.getElementById('g_decision_criteria').value = document.getElementById('e_merged_output').value;
	document.getElementById('g_scenario_dialogue').value = document.getElementById('f_merged_output').value;
	
});


//汇总，生成结果
document.getElementById('g_generate_btn').addEventListener('click', function() {
	
	alert("要求什么格式的结果？");
	
});


