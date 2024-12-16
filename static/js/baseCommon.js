
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
	//alert(2);
	var promptTpl = "我需要你帮我生成一份“信息收集框架”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。";
    promptTpl = promptTpl + "我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}。";
	
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
	if(other.trim() != ""){
		promptTpl = promptTpl + "。其他我还需要补充的是" + other.trim();
	}
	
	if(attachFile.trim() != ""){
		promptTpl = promptTpl + "。附件是我提供的一些相关文档信息。" ;
		
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
	}
	
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
			
			responseBoxChatgpt.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			
			responseBoxDoubao.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			responseBoxDoubao.placeholder = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
			responseBoxChatgpt.placeholder = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});

//信息收集框架区，智能合并
document.getElementById('c_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('c_chatgpt_response').value;
	doubaoRp = document.getElementById('c_doubao_response').value;
	var merged = document.getElementById('c_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.placeholder = '这里将采用chatgpt对上述两个回答进行整合，请稍等...若出错请重试。';
		
		myprompt = "对如下信息收集框架(A)部分的内容和信息收集框架(B)部分的内容，请基于前述上下文背景信息帮我将这两部分内容按照其内在含义及逻辑关系进行重新整合，并给出条理清晰逻辑严谨且无重复内容的输出。";
		myprompt = myprompt + "信息收集框架(A):"+ chatgptRp + " 。信息收集框架(B):"+ doubaoRp ;
		
		const response = fetch('/mergeFromChatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: myprompt })
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
				merged.value = data.answer;
			} else {
				merged.value = "Error: " + data.error;
			}	
		})
		.catch(error => {
			alert("出错了"+error.message);
		
		});
		
		
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
	
});


//信息收集框架区，下一步，产生下一区的提示词描述
document.getElementById('c_next_btn').addEventListener('click', function() {
	
	var promptTpl = "我需要你帮我生成一份“检查清单”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。";
    promptTpl = promptTpl + "我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}。";
	
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
	if(other.trim() != ""){
		promptTpl = promptTpl + "。其他我还需要补充的是" + other.trim();
	}
	
	//信息收集框架输出内容
	//c_prompt = document.getElementById('c_prompt').value;
	c_output = document.getElementById('c_merged_output').value;
	if(c_output.trim() != ""){
		promptTpl = promptTpl + "。信息收集情况是：" + c_output.trim();
	}
	
	//附件内容在首次上传后已经保存到后台服务端变量中待用，这里不再上传
	if(attachFile.trim() != ""){
		promptTpl = promptTpl + "。附件是我提供的一些相关文档信息。" ;
		
	}
	
	document.getElementById('d_prompt').value = promptTpl;
	
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
			
			responseBoxChatgpt.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			
			responseBoxDoubao.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			responseBoxDoubao.placeholder = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
			responseBoxChatgpt.placeholder = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//检查清单区，智能合并
document.getElementById('d_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('d_chatgpt_response').value;
	doubaoRp = document.getElementById('d_doubao_response').value;
	var merged = document.getElementById('d_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.placeholder = '这里将采用chatgpt对上述两个回答进行整合，请稍等...若出错请重试。';
		
		myprompt = "对如下检查清单(A)部分的内容和检查清单(B)部分的内容，请基于前述上下文背景信息帮我将这两部分内容按照其内在含义及逻辑关系进行重新整合，并给出条理清晰逻辑严谨且无重复内容的输出。";
		myprompt = myprompt + "检查清单(A):"+ chatgptRp + " 。检查清单(B):"+ doubaoRp ;
		
		const response = fetch('/mergeFromChatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: myprompt })
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
				merged.value = data.answer;
			} else {
				merged.value = "Error: " + data.error;
			}	
		})
		.catch(error => {
			alert("出错了"+error.message);
		
		});
		
		
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});


//检查清单区，下一步
document.getElementById('d_next_btn').addEventListener('click', function() {
	
	var promptTpl = "我需要你帮我生成一份“决策标准”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。";
    promptTpl = promptTpl + "我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}。";
	
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
	if(other.trim() != ""){
		promptTpl = promptTpl + "。其他我还需要补充的是" + other.trim();
	}
	
	//信息收集框架输出内容
	//c_prompt = document.getElementById('c_prompt').value;
	c_output = document.getElementById('c_merged_output').value;
	if(c_output.trim() != ""){
		promptTpl = promptTpl + "。信息收集情况是：" + c_output.trim();
	}
	
	//检查清单输出内容
	//d_prompt = document.getElementById('d_prompt').value;
	d_output = document.getElementById('d_merged_output').value;
	if(d_output.trim() != ""){
		promptTpl = promptTpl + "。检查清单是：" + d_output.trim();
	}
	
	//附件内容在首次上传后已经保存到后台服务端变量中待用，这里不再上传
	if(attachFile.trim() != ""){
		promptTpl = promptTpl + "。附件是我提供的一些相关文档信息。" ;
		
	}
	
	document.getElementById('e_prompt').value = promptTpl;
	
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
			
			responseBoxChatgpt.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			
			responseBoxDoubao.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			responseBoxDoubao.placeholder = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
			responseBoxChatgpt.placeholder = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//决策标准，智能合并
document.getElementById('e_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('e_chatgpt_response').value;
	doubaoRp = document.getElementById('e_doubao_response').value;
	var merged = document.getElementById('e_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.placeholder = '这里将采用chatgpt对上述两个回答进行整合，请稍等...若出错请重试。';
		
		myprompt = "对如下决策标准(A)部分的内容和决策标准(B)部分的内容，请基于前述上下文背景信息帮我将这两部分内容按照其内在含义及逻辑关系进行重新整合，并给出条理清晰逻辑严谨且无重复内容的输出。";
		myprompt = myprompt + "决策标准(A):"+ chatgptRp + " 。决策标准(B):"+ doubaoRp ;
		
		const response = fetch('/mergeFromChatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: myprompt })
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
				merged.value = data.answer;
			} else {
				merged.value = "Error: " + data.error;
			}	
		})
		.catch(error => {
			alert("出错了"+error.message);
		
		});
		
		
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});


//决策标准，下一步
document.getElementById('e_next_btn').addEventListener('click', function() {
	
	var promptTpl = "我需要你帮我生成一份“情景对策”，以便为我后续的咨询工作提供一套需要收集那些岗位相关信息的依据。";
    promptTpl = promptTpl + "我所处的行业现状为{industry}，现在我们的企业现状为{company}，我们这个项目的现状是{project}，这份岗位名字叫{jobname}，职责是{duty}。";
	
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
	if(other.trim() != ""){
		promptTpl = promptTpl + "。其他我还需要补充的是" + other.trim();
	}
	
	//信息收集框架输出内容
	//c_prompt = document.getElementById('c_prompt').value;
	c_output = document.getElementById('c_merged_output').value;
	if(c_output.trim() != ""){
		promptTpl = promptTpl + "。信息收集情况是：" + c_output.trim();
	}
	
	//检查清单输出内容
	//d_prompt = document.getElementById('d_prompt').value;
	d_output = document.getElementById('d_merged_output').value;
	if(d_output.trim() != ""){
		promptTpl = promptTpl + "。检查清单是：" + d_output.trim();
	}
	
	//决策标准输出内容
	//e_prompt = document.getElementById('e_prompt').value;
	e_output = document.getElementById('e_merged_output').value;
	if(e_output.trim() != ""){
		promptTpl = promptTpl + "。决策标准是：" + e_output.trim();
	}
	
	//附件内容在首次上传后已经保存到后台服务端变量中待用，这里不再上传
	if(attachFile.trim() != ""){
		promptTpl = promptTpl + "。附件是我提供的一些相关文档信息。" ;
		
	}
	
	
	document.getElementById('f_prompt').value = promptTpl;
	
});


//情景对策，生成
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
			
			responseBoxChatgpt.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			
			responseBoxDoubao.placeholder = '请稍等...若出错，请不妨重试！';
			
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
			responseBoxDoubao.placeholder = "";
		} else if(answerTypeValue ==="doubao"){
			responseBoxChatgpt.value = "";
			responseBoxChatgpt.placeholder = "";
		}
		
		
	} catch (error) {
		alert("Error: " + error.message);
	}
});



//情景对话，智能合并
document.getElementById('f_merge_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('f_chatgpt_response').value;
	doubaoRp = document.getElementById('f_doubao_response').value;
	var merged = document.getElementById('f_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.placeholder = '这里将采用chatgpt对上述两个回答进行整合，请稍等...若出错请重试。';
		
		myprompt = "对如下情景对策(A)部分的内容和情景对策(B)部分的内容，请基于前述上下文背景信息帮我将这两部分内容按照其内在含义及逻辑关系进行重新整合，并给出条理清晰逻辑严谨且无重复内容的输出。";
		myprompt = myprompt + "情景对策(A):"+ chatgptRp + " 。情景对策(B):"+ doubaoRp ;
		
		const response = fetch('/mergeFromChatgpt', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt: myprompt })
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
				merged.value = data.answer;
			} else {
				merged.value = "Error: " + data.error;
			}	
		})
		.catch(error => {
			alert("出错了"+error.message);
		
		});
		
		
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
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
	
	alert("暂无，请先确定可能的输出格式。");
	
});


//人工修改按钮的监听事件

document.getElementById('c_labor_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('c_chatgpt_response').value;
	doubaoRp = document.getElementById('c_doubao_response').value;
	var merged = document.getElementById('c_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.value="";
		merged.placeholder = '请将整合后的内容复制到此或在这里编辑。';
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});


document.getElementById('d_labor_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('d_chatgpt_response').value;
	doubaoRp = document.getElementById('d_doubao_response').value;
	var merged = document.getElementById('d_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.value="";
		merged.placeholder = '请将整合后的内容复制到此或在这里编辑。';
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});

document.getElementById('e_labor_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('e_chatgpt_response').value;
	doubaoRp = document.getElementById('e_doubao_response').value;
	var merged = document.getElementById('e_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.value="";
		merged.placeholder = '请将整合后的内容复制到此或在这里编辑。';
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});

document.getElementById('f_labor_btn').addEventListener('click', function() {
	
	chatgptRp = document.getElementById('f_chatgpt_response').value;
	doubaoRp = document.getElementById('f_doubao_response').value;
	var merged = document.getElementById('f_merged_output');
	
	if(chatgptRp.trim()!="" && doubaoRp.trim()!=""){
		merged.value="";
		merged.placeholder = '请将整合后的内容复制到此或在这里编辑。';
	}else if(chatgptRp.trim()!=""){
		merged.value=chatgptRp.trim();
		merged.placeholder = '';
	}else if(doubaoRp.trim()!=""){
		merged.value=doubaoRp.trim();
		merged.placeholder = '';
	}
	
});




// 监听焦点事件，清空提示信息
document.getElementById('c_merged_output').addEventListener('focus', function() {
	this.placeholder = '';  // 当点击时清除placeholder
});

// 监听焦点事件，清空提示信息
document.getElementById('d_merged_output').addEventListener('focus', function() {
	this.placeholder = '';  // 当点击时清除placeholder
});

// 监听焦点事件，清空提示信息
document.getElementById('e_merged_output').addEventListener('focus', function() {
	this.placeholder = '';  // 当点击时清除placeholder
});

// 监听焦点事件，清空提示信息
document.getElementById('f_merged_output').addEventListener('focus', function() {
	this.placeholder = '';  // 当点击时清除placeholder
});




// 点击按钮，动态设置textarea的placeholder
/*
function setPlaceholder() {
	var textarea = document.getElementById('myTextarea');
	textarea.placeholder = '请将合并信息复制到此或在此处编辑。';
}
*/
// 监听失去焦点事件，重新设置提示信息
/*
document.getElementById('myTextarea').addEventListener('blur', function() {
	if (this.value === '') {
		this.placeholder = '请将合并信息复制到此或在此处编辑。';  // 如果文本框为空，恢复提示信息
	}
});
*/

