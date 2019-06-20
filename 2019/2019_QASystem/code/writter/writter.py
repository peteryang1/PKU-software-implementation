#! /usr/bin/env python
# coding=utf-8
import requests
import csv
from tqdm import *
import re

url = 'https://baike.baidu.com/item/'
source_path = 'data/ch_2.txt'
result_path = 'result/ch_2.csv'
property_path = 'data/property.txt'

headers = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 ' \
          'Safari/537.36'
headers_wise = 'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J)AppleWebKit/534.30 (KHTML, like ' \
               'Gecko) Version/4.0 Mobile Safari/534.30'
pro_list = ['本名', '外文名', '别名', '字号', '所处时代', '国籍', '毕业院校', '民族', '出生时间', '逝世时间', '职业', '官职', '出生地', '代表作品', '人物关系', '简介']
nickname_list = ['笔名', '曾名', '学名', '谱名', '别名', '小名', '谱名', '曾用名', '原名']


def rid(raw, trash):
    for pair in trash:
        first = pair[0]
        end = pair[1]
        while 1:
            head = raw.find(first)
            if head == -1:
                break
            tail = raw.find(end, head)
            if tail == -1:
                break
            if tail + 1 < len(raw):
                raw = raw[0: head] + raw[tail + 1:]
            else:
                raw = raw[0: head]
    return raw


def get_relation(index):
    s = requests.Session()
    s.headers['User-Agent'] = headers_wise
    response = s.get(url + index)
    response.raise_for_status()
    response_str = response.content.decode('utf-8')
    start = response_str.find('scroll relations-list')
    raw = response_str[start:]
    note = 0
    result = {}
    while 1:
        value_head = raw.find('href-name', note)
        if value_head == -1:
            break
        value_tail = raw.find('</span>', value_head)
        key_head = raw.find('desc', value_tail)
        key_tail = raw.find('</div>', key_head)
        note = key_tail
        key = raw[key_head + 6: key_tail]
        value = raw[value_head + 11: value_tail]
        if key in result.keys():
            result[key] += value + '，'
        else:
            result[key] = value + '，'
    raw = ''
    for key, value in result.items():
        value = value.rstrip('，')
        raw += key + '：' + value + '\n'
    raw = raw.rstrip('\n')
    return raw


def deal_book(raw):            # 统一书名
    if raw.find('《') != -1:
        new_raw = ''
        open_read = False
        for i in range(len(raw)):
            if raw[i] == '《':
                open_read = True
                new_raw += '《'
                continue
            elif raw[i] == '》':
                open_read = False
                new_raw += '》，'
            if open_read:
                new_raw += raw[i]
        return new_raw
    else:
        new_raw = ''
        raw = raw.replace('，，', '，').rstrip('，').rstrip('等')
        book_list = raw.split('，')
        for book in book_list:
            new_raw += '《' + book + '》' + '，'
        return new_raw


def deal_nickname(raw):
    zihao = ''
    while 1:
        head = raw.find('字')
        if head == -1:
            head = raw.find('别号')
        if head == -1:
            head = raw.find('号')
        if head == -1:
            break
        tail = raw.find('，', head)
        if tail != -1:
            zihao += raw[head: tail + 1]
            raw = raw[: head] + raw[tail + 1:]
        else:
            zihao += raw[head:]
            raw = raw[: head]
    for nickname in nickname_list:
        raw = raw.replace(nickname, '')
    return raw, zihao.rstrip('，')


def get_infor(index):
    item = {}
    zihao = ''
    s = requests.Session()
    s.headers['User-Agent'] = headers
    response = s.get(url + index)
    response.raise_for_status()
    response_str = response.content.decode('utf-8')
    start = response_str.find('basic-info cmn-clearfix')
    end = response_str.find('</dl></div>', start)
    if end == -1:
        print('Wrong ' + index)

    property_list = []
    with open(property_path, 'r') as f:
        property_raw = f.read()
        property_same = property_raw.split('\n')
        for property in property_same:
            property = property.split('，')
            property_list.append(property)

    for property in property_list:
        for pro in property:
            if pro == '人物关系':
                raw = get_relation(index)

            elif pro == '简介':
                '''
                intro_head = response_str.find('label-module="para"') + 20
                intro_tail = response_str.find('<div class="configModuleBanner">', intro_head)
                raw = response_str[intro_head: intro_tail].replace('\n', '').replace('&nbsp;', '')
                para = 0
                while 1:
                    para = raw.find('label-module="para"', para) + 20
                    if para == 19:
                        break
                    next_para = raw.find('</div>', para)
                    if raw.find('<i>', para, next_para) != -1:
                        continue
                    raw = raw[0: para] + '\n' + raw[para:]
                trash = [['（', '）']]
                raw = rid(raw, trash)'''

                intro_head = response_str.find('label-module="lemmaSummary">') + 29
                intro_tail = response_str.find('<div class="configModuleBanner">', intro_head)
                if intro_tail == -1:
                    intro_tail = response_str.find('<div class="basic-info cmn-clearfix">', intro_head)
                if intro_head == -1 or intro_tail == -1:
                    print('Intro Wrong:' + index)
                    raw = ''
                else:
                    raw = response_str[intro_head: intro_tail].replace('\n', '').replace('&nbsp;', '')
                    trash = [['（', '）']]
                    raw = rid(raw, trash)

            else:
                first = response_str.find(pro + '</dt>', start, end)
                if len(pro) == 2 and first == -1:
                    pro_long = pro[0] + '&nbsp;&nbsp;&nbsp;&nbsp;' + pro[1]
                    first = response_str.find(pro_long, start, end)
                if first == -1:
                    continue
                head = response_str.find('value">', first) + 8
                tail = response_str.find('</dd>', head) - 1
                raw = response_str[head: tail].replace('\n', '，').replace('&nbsp;', '').replace(' ', '，').replace('、', '，').replace('；', '，')

            trash = [['（', '）'], ['<', '>'], ['[', ']'], ['(', ')']]
            raw = rid(raw, trash)

            if pro in ['代表作品', '代表作', '作品', '个人作品']:
                raw = deal_book(raw)

            if pro in ['别名', '别称', '原名', '异名', '称号', '自号', '誉称']:
                raw, zihao = deal_nickname(raw)

            if pro in ['本名', '中文名']:
                raw = raw.split('，')[0]

            raw = raw.replace('，，', '，').rstrip('，').rstrip('等')

            if pro in ['别名', '别称', '原名', '异名', '称号', '自号', '誉称']:  # 别名可累加
                if property[0] not in item.keys():
                    item[property[0]] = raw
                else:
                    item[property[0]] += '，' + raw
            else:
                item[property[0]] = raw
                break

    if '本名' not in item.keys():
        return
    else:
        if '字号' not in item.keys() and zihao != '':
            item['字号'] = zihao

        title_head = response_str.find('<h1 >') + 5     # 本名不等于title，需要替换
        title_tail = response_str.find('</h1>')
        title = response_str[title_head: title_tail]
        if item['本名'] != title and item['本名'] != '亚历山大·小仲马':
            if '别名' not in item.keys():
                item['别名'] = item['本名']
            else:
                rid_head = item['别名'].find(title)
                if rid_head != -1:
                    if item['别名'].find('，', rid_head) != -1:
                        item['别名'] = item['别名'].replace(title + '，', '')
                    else:
                        item['别名'] = item['别名'].replace(title, '')
                if item['别名'] != '':
                    item['别名'] += '，' + item['本名']
                else:
                    item['别名'] = item['本名']
            item['本名'] = title

        if '别名' in item.keys():
            new_nick = ''
            name_list = item['别名'].split('，')           # 去掉长度为1和带英文字母的别名
            for name in name_list:
                if len(name) == 1 or bool(re.search('[a-zA-Z]', name)):
                    continue
                else:
                    new_nick += name + '，'
            item['别名'] = new_nick.rstrip('，')

        return item


if __name__ == '__main__':
    with open(source_path, 'r') as f:
        index_list = f.read().replace('\n', '').replace(' ', '').split(',')
    infor_dict = {}
    i = 0
    for index in tqdm(index_list):
        i += 1
        infor = get_infor(index)
        if infor:
            if infor['本名'] not in infor_dict.keys():
                infor_dict[infor['本名']] = infor
            else:
                print(infor['本名'])

    with open(result_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, pro_list)
        writer.writeheader()
        for name, row in infor_dict.items():
            writer.writerow(row)
