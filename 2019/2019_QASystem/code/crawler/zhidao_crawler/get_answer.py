#! /usr/bin/env python
# coding=utf-8
import requests
import re

url = 'https://zhidao.baidu.com/question/564082522759625084.html'

def get_answer(content):
    answer = ''
    best_start = content.find('wgt-best')
    best_end = content.find('wgt-answers')
    extend_start = content.find('扩展资料')
    if extend_start == -1:
        extend_start = content.find('拓展资料')
        
    first = content.find('<p>', best_start)
    answer_index = content.find('<p>', best_start)
    if best_start != -1:
        while answer_index != -1:
            answer_start = answer_index + len('<p>')
            if extend_start != -1:
                answer_end = content.find('</p>', answer_start, extend_start)
            elif best_end != -1:
                answer_end = content.find('</p>', answer_start, best_end)
            else:
                answer_end = content.find('</p>', answer_start)
            piece = content[answer_start: answer_end]
            answer_start = answer_end
            answer_index = content.find('<p>', answer_start)
            # 去掉图片
            if piece.find('href') == -1:
                answer += '    '
                answer += piece
                answer += '\n'
    
    return answer
    

def get_question_answer_pair(url):
    qa_pair = {}
    response = requests.get(url)
    response.raise_for_status()
    response_str = response.content.decode('gbk')
    question = ''
    supplement = ''
    answer = ''
    question_start = response_str.find('ask-title') + len('ask-title">')
    if response_str.find('ask-title') != -1:
        question_end = response_str.find('</span>', question_start)
        question = response_str[question_start: question_end]
        
    supplement_start = response_str.find('con conReal') + len('con conReal">')
    if response_str.find('con conReal') != -1:
        supplement_end = response_str.find('</span>', supplement_start)
        supplement = response_str[supplement_start: supplement_end]
        
    answer = get_answer(response_str)
    print(question)
    print(supplement)
    print(answer)


if __name__ == '__main__':
    get_question_answer_pair(url)

