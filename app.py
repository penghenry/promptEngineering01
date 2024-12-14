import os
import openai
import requests
import json
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from pathlib import Path
import mylib as mylib

app = Flask(__name__)
app.secret_key = os.urandom(24)

# OpenAI API Key
# openai.api_key = "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"

# Dify API endpoint and credentials (replace with actual API credentials)
DIFY_API_URL = "your_dify_api_url"
DIFY_API_KEY = "your_dify_api_key"

# File upload settings
UPLOAD_FOLDER = os.path.join(Path(__file__).resolve().parent,'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt','doc','xls','xlsx','csv'}

difyUrl = "https://api.dify.ai/v1/completion-messages"

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route for homepage (Login page)
@app.route('/')
def home():
    return render_template('index.html')

# Route for handling login (authentication not implemented here)
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    # Add login validation logic here (e.g., check in the database)
    
    session['user'] = username
    return redirect(url_for('page_b'))

# Route for page B (input form with integrated functionality for C, D, E, F)
@app.route('/page_b', methods=['GET', 'POST'])
def page_b():
    if request.method == 'POST':
        # Extract input data from the form
        industry_description = request.form['industry_description']
        company_description = request.form['company_description']
        project_description = request.form['project_description']
        job_responsibilities = request.form['job_responsibilities']
        other_description = request.form['other_description']
        uploaded_file = request.files['uploaded_file']

        # Save uploaded file if valid
        if uploaded_file and allowed_file(uploaded_file.filename):
            filename = os.path.join(app.config['UPLOAD_FOLDER'], uploaded_file.filename)
            uploaded_file.save(filename)
        else:
            filename = None

        # Create a dictionary for the user input
        prompt_data = {
            'industry_description': industry_description,
            'company_description': company_description,
            'project_description': project_description,
            'job_responsibilities': job_responsibilities,
            'other_description': other_description,
            'uploaded_file': filename
        }

        # Process each step sequentially (C, D, E, F)
        c_prompt = generate_prompt(prompt_data, "information collection framework")
        c_openai_response = generate_openai_response(c_prompt)
        c_dify_response = generate_dify_response(c_prompt)
        c_merged_output = merge_responses(c_openai_response, c_dify_response)

        d_prompt = generate_prompt({**prompt_data, 'c_output': c_merged_output}, "checklist")
        d_openai_response = generate_openai_response(d_prompt)
        d_dify_response = generate_dify_response(d_prompt)
        d_merged_output = merge_responses(d_openai_response, d_dify_response)

        e_prompt = generate_prompt({**prompt_data, 'd_output': d_merged_output}, "decision criteria")
        e_openai_response = generate_openai_response(e_prompt)
        e_dify_response = generate_dify_response(e_prompt)
        e_merged_output = merge_responses(e_openai_response, e_dify_response)

        f_prompt = generate_prompt({**prompt_data, 'e_output': e_merged_output}, "scenario dialogue")
        f_openai_response = generate_openai_response(f_prompt)
        f_dify_response = generate_dify_response(f_prompt)
        f_merged_output = merge_responses(f_openai_response, f_dify_response)

        # Combine all outputs for the final G section
        g_output = {
            'c_output': c_merged_output,
            'd_output': d_merged_output,
            'e_output': e_merged_output,
            'f_output': f_merged_output
        }

        return render_template('page_b.html', prompt_data=prompt_data, c_output=c_merged_output, d_output=d_merged_output,
                               e_output=e_merged_output, f_output=f_merged_output, g_output=g_output)

    return render_template('page_b.html')
    
@app.route('/generateFromChatgpt', methods=['POST'])
def generate_response_chatgpt():
    print('generateFromChatgpt')
    data = request.get_json()
    prompt = data.get('prompt')
    api_key = "app-fBDvSQvqAqsKDXQWWMp1S5rY"
    
    if not prompt:
        return jsonify({'success': False, 'error': '提示词描述不能为空！'})
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    #print(prompt)
    
    uploadFileConten = ""
    if 'uploadFileConten' in g:
        uploadFileConten = g.uploadFileConten
        
    data = {
        "inputs": {
            "query": prompt + "\n\n" + uploadFileConten
        },
        "response_mode": "blocking",
        "user": "abc-123"
    }
    
    try:
        response = requests.post(difyUrl, headers=headers, data=json.dumps(data))
        #print(response.text)
        answer = response.json()['answer']
        #print(answer)
        #print("66666666666666666666666666666666666666666666666666");
        return jsonify({'success': True, 'answer': answer})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


@app.route('/generateFromDoubao', methods=['POST'])
def generate_response_doubao():
    data = request.get_json()
    prompt = data.get('prompt')
    api_key = "app-dMkBnChVVCGD7E82CetDLci2"
    
    if not prompt:
        return jsonify({'success': False, 'error': '提示词描述不能为空！'})
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    #print(prompt)
    
    uploadFileConten = ""
    if 'uploadFileConten' in g:
        uploadFileConten = g.uploadFileConten
        
    data = {
        "inputs": {
            "query": prompt + "\n\n" + uploadFileConten
        },
        "response_mode": "blocking",
        "user": "abc-123"
    }
    
    try:
        response = requests.post(difyUrl, headers=headers, data=json.dumps(data))

        answer = response.json()['answer']
        #print(answer)
        #print("777777777777777777777777777777");
        return jsonify({'success': True, 'answer': answer})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})     
            

@app.route('/uploadFile', methods=['POST'])
def uploadFile():

    if 'file' not in request.files:
        return jsonify({"error": "没有文件上传"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "没有选择文件"}), 400

    if file and allowed_file(file.filename):
        # 保存文件到服务器,只有先保存后才能再提取文件内容
        #print(Path(__file__).resolve().parent);
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        
        print(filename)

        # 你可以在这里进行处理文件的操作（比如提取内容）
        file_content = ''
        if filename.endswith('.pdf'):
            file_content = mylib.extract_pdf_content(filename)
        elif filename.endswith('.docx'):
            file_content = mylib.extract_docx_content(filename)
        elif filename.endswith('.doc'):
            file_content = mylib.extract_doc_content(filename)
        elif filename.endswith('.xls') or filename.endswith('.xlsx'):
            file_content = mylib.extract_excel_content(filename)
        elif filename.endswith('.csv'):
            file_content = mylib.extract_csv_content(filename)
        elif filename.endswith('.txt'):
            try: 
                f = open(filename, 'r',encoding='utf-8')  #, encoding='utf-8',errors='ignore'
                file_content = f.read()
            except:
                f = open(filename, 'r',encoding='gbk')  
                file_content = f.read()
        
        print(len(file_content))
        file_content2 = ''.join(x for x in file_content if x.isprintable())
        file_content3 = ' '.join(file_content2.split())
        #print(file_content3)
        
        g.uploadFileConten=file_content3

        return jsonify({"message": "文件上传成功", "filename": file.filename}), 200

    return jsonify({"error": "无效的文件类型"}), 400

#智能合并,直接走js前端
@app.route('/autoMerge', methods=['POST'])
def merge_responses(openai_response, dify_response):
    
    return openai_response + "\n\n" + dify_response


    
# Helper functions
def generate_prompt(data, task_type):
    return f"Generate {task_type} based on the following data: {data}"

def generate_openai_response(prompt_data):
    prompt = f"Generate detailed output for the task based on the following: {prompt_data}"
    response = openai.Completion.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=500
    )
    return response.choices[0].text.strip()

def generate_dify_response(prompt_data):

    '''原有生成，暂时注释
    headers = {'Authorization': f'Bearer {DIFY_API_KEY}'}
    payload = {'input_data': prompt_data}
    response = requests.post(DIFY_API_URL, json=payload, headers=headers)
    return response.json()['output_data']
    '''
    
    # 豆包大模型
    # Calls the Dify API to get a response from the 豆包大模型.
    headers = {
        'Authorization': f'Bearer {DIFY_API_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'doubao-large',  # Specify the 豆包大模型
        'prompt': prompt,
        'max_tokens': 500
    }
    response = requests.post(DIFY_API_URL, json=payload, headers=headers)
    response_data = response.json()
    if 'choices' in response_data and len(response_data['choices']) > 0:
        return response_data['choices'][0]['text'].strip()
    else:
        return "Error: Unable to generate response from Dify."
    



if __name__ == '__main__':
    app.run(debug=True)
