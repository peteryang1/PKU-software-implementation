# coding=utf-8
import json
import urllib
import jieba
import re
from urllib import request
pattern = re.compile("[^\u4e00-\u9fa5^a-z^A-Z^0-9]")
host_lexer = 'https://aip.baidubce.com/rpc/2.0/nlp/v1/lexer?access_token=24.9122e1797411b3cfcd811bd79061b51e.2592000.1554432662.282335-15687713'
host_word2vec = 'https://aip.baidubce.com/rpc/2.0/nlp/v2/word_emb_vec?access_token=24.9122e1797411b3cfcd811bd79061b51e.2592000.1554432662.282335-15687713'
host_sim = 'https://aip.baidubce.com/rpc/2.0/nlp/v2/simnet?access_token=24.9122e1797411b3cfcd811bd79061b51e.2592000.1554432662.282335-15687713'


# 分词，词法分析接口
def lexer(query):
    # 使用百度api提供的服务
    '''body = {}
    body['text'] = query
    body = json.dumps(body).encode()
    req = request.Request(url=host_lexer, data=body)
    req.add_header('Content-Type', 'application/json; charset=UTF-8')
    response = request.urlopen(req)
    content = response.read()
    return json.loads(content.decode('gbk'))'''
    # 使用结巴分词
    word_list = []
    for one in jieba.cut(query, cut_all=False):
        word_list.append(one)
    return word_list


# 获取词向量接口
def word2vec(word):
    body = {}
    body['word'] = word
    body = json.dumps(body).encode()
    req = request.Request(url=host_word2vec, data=body)
    req.add_header('Content-Type', 'application/json; charset=UTF-8')
    response = request.urlopen(req)
    content = response.read()
    return json.loads(content.decode('gbk'))


# 计算短文本相似度接口
def sim(query1, query2):
    body = {}
    body['text_1'] = query1
    body['text_2'] = query2
    req = request.Request(url=host_sim, data=body)
    req.add_header('Content-Type', 'application/json; charset=UTF-8')
    response = request.urlopen(req)
    content = response.read()
    # print(content)
    return content.decode('gbk')


if __name__ == '__main__':
    query = '李白'
    res = word2vec(query)
    vector = res['vec']
    print(type(vector))
