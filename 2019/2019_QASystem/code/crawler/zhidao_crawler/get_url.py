# coding=utf-8
import requests
import re

#url = 'https://zhidao.baidu.com'
url = 'https://zhidao.baidu.com/search?word=李白诗特点&ie=utf-8&site=-1&sites=0&date=0&pn=0'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36'}
pattern = re.compile('http://zhidao\.baidu\.com/question/[a-z0-9]+\.html')

def search_urls_with_keyword(keyword, page_num):
    # 每页10条
    #params = {'word': keyword, 'ie': 'utf-8', 'site': -1, 'sites': 0, 'pn': page_num}
    response = requests.get(url)
    #response.raise_for_status()
    #print(response.content.decode('gbk'))
    match_list = re.findall(pattern, response.content.decode('gbk'))
    new_list = []
    for item in match_list:
        if item not in new_list:
            new_list.append(item)
    return new_list


if __name__ == '__main__':
    print(search_urls_with_keyword("李白诗特点", 0))

