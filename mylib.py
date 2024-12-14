# -*- coding:utf-8 -*- ＃

import re
import PyPDF2
import docx
import win32com.client
import pandas as pd

#pdf
def extract_pdf_content(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

# 示例
'''
file_path = 'example.pdf'
pdf_content = extract_pdf_content(file_path)
print(pdf_content)
'''

#docx
def extract_docx_content(file_path):
    doc = docx.Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

# 示例
'''
file_path = 'example.docx'
docx_content = extract_docx_content(file_path)
print(docx_content)
'''



#doc
def extract_doc_content(file_path):
    word = win32com.client.Dispatch("Word.Application")
    doc = word.Documents.Open(file_path)
    text = doc.Content.Text
    doc.Close()
    return text

# 示例
'''
file_path = 'example.doc'
doc_content = extract_doc_content(file_path)
print(doc_content)
'''


#使用 pandas 和 openpyxl 库来提取 .xlsx 文件内容，而 .xls 文件使用 xlrd 库进行处理
def extract_excel_content(file_path):
    #df = pd.read_excel(file_path, sheet_name=None)  # sheet_name=None 获取所有工作表
	# 判断文件后缀
    if file_path.endswith('.xlsx'):
        # 读取 .xlsx 文件
        df = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')  # 读取所有工作表
    elif file_path.endswith('.xls'):
        # 读取 .xls 文件
        df = pd.read_excel(file_path, sheet_name=None, engine='xlrd')  # 读取所有工作表
    else:
        raise ValueError("不支持的文件格式，只支持 .xls 或 .xlsx 文件")
	
    text = ""
    for sheet, data in df.items():
        #text += f"Sheet: {sheet}\n"
        text += data.to_string(index=False) + "\n\n"
    return text

# 示例
'''
file_path = 'example.xlsx'
excel_content = extract_excel_content(file_path)
print(excel_content)
'''

#使用 pandas 库来处理 CSV 文件并提取其内容
def extract_csv_content(file_path):
    df = pd.read_csv(file_path)
    return df.to_string(index=False)

# 示例
'''
file_path = 'example.csv'
csv_content = extract_csv_content(file_path)
print(csv_content)
'''

#正则表达式去除中文字之间的空格，保留英文单词之间的空格，对于英文单词中间夹杂着数字的情况，应该保留空格但没有保留

'''
def _clean_space(text):
​    match_regex = re.compile(u'[\u4e00-\u9fa5。\.,，:：《》、\(\)（）]{1} +(?<![a-zA-Z])|\d+ +| +\d+|[a-z A-Z]+')
​    should_replace_list = match_regex.findall(text)
​    order_replace_list = sorted(should_replace_list,key=lambda i:len(i),reverse=True)
​    for i in order_replace_list:
​        if i == u' ':
​            continue
​        new_i = i.strip()
​        text = text.replace(i,new_i)
​    return text

text = "从大约40万 年前开始，一个关键的环境转变  发生了。hello world！"
text=text.decode("utf-8")
text=_clean_space(text).encode("utf-8")
print(text)
'''
