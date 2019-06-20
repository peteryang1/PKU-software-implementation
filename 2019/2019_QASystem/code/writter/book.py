#! /usr/bin/env python
# coding=utf-8
import requests
import csv
from tqdm import *

headers = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 ' \
          'Safari/537.36'
read_path = 'result/ch_1.csv'
write_path = 'result/book_ch1.csv'
href_url = 'https://baike.baidu.com/search/none?word='
word_url = 'https://baike.baidu.com/item/'
pro_list = ['作品名称', '简介']
book_name_list = ['书名', '作品名称']
bad_name_list = ['本名', '出生地', '国籍']
label_list = ['书籍', '文学', '小说', '散文', '出版物', '演出', '文化', '戏剧']
right_words_list = ['书', '小说', '散文', '文学']
bad_label_list = ['人物']


def get_title(response_str):
    title_head = response_str.find('<h1 >') + 5
    title_tail = response_str.find('</h1>')
    title = response_str[title_head: title_tail]
    trash = [['（', '）'], ['<', '>'], ['[', ']'], ['(', ')']]
    title = rid(title, trash).replace('《', '').replace('》', '')
    return title


def is_book(response_str, book):
    book_start = response_str.find('basic-info cmn-clearfix')
    book_end = response_str.find('</dl></div>', book_start)

    if book_start == -1:
        return False

    title = get_title(response_str)
    pozhe = book.find('—')
    if pozhe != -1:
        book = book[0: pozhe]
    same_meaning_start = response_str.find('title="同义词"')
    same_meaning_end = response_str.find('class="lemma-summary"', same_meaning_start)
    book_headline = book[1: -1]
    if response_str.find(book_headline, book_start, book_end) == -1 and title.find(book_headline) == -1 and response_str.find(book_headline, same_meaning_start, same_meaning_end) == -1:
        print('No name' + book + '：')
        return False

    for book_name in book_name_list:
        find_name = response_str.find(book_name + '</dt>', book_start, book_end)
        if len(book_name) == 2 and find_name == -1:
            pro_long = book_name[0] + '&nbsp;&nbsp;&nbsp;&nbsp;' + book_name[1]
            find_name = response_str.find(pro_long, book_start, book_end)
        if find_name != -1:
            return True

    for bad_name in bad_name_list:
        find_name = response_str.find(bad_name + '</dt>', book_start, book_end)
        if len(bad_name) == 2 and find_name == -1:
            pro_long = bad_name[0] + '&nbsp;&nbsp;&nbsp;&nbsp;' + bad_name[1]
            find_name = response_str.find(pro_long, book_start, book_end)
        if find_name != -1:
            return False

    label_head = response_str.find('<div class="open-tag-title">词条标签：')
    label_tail = response_str.find('class="open-tag-collapse" id="open-tag-collapse"', label_head)

    for label in bad_label_list:
        if response_str.find(label, label_head, label_tail) != -1:
            return False

    for label in label_list:
        if response_str.find(label, label_head, label_tail) != -1:
            return True

    for words in right_words_list:
        if response_str.find(words, book_start, book_end) != -1:
            return True

    return False


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


def get_infor(response_str, book):
    item = {}

    item['作品名称'] = book

    intro_head = response_str.find('label-module="lemmaSummary">') + 29
    if intro_head == -1:
        return

    intro_tail = response_str.find('</div>', intro_head)
    intro_raw = response_str[intro_head: intro_tail].replace('\n', '').replace('&nbsp;', '')
    trash = [['（', '）'], ['<', '>'], ['[', ']'], ['(', ')']]
    intro_raw = rid(intro_raw, trash)

    if len(intro_raw) <= 10:
        find_second = response_str.find('</div><div class="para" label-module="para">', intro_tail)
        if find_second != -1:
            intro_head = find_second + 44
            intro_tail = response_str.find('</div>', intro_head)
            intro_raw = response_str[intro_head: intro_tail].replace('\n', '').replace('&nbsp;', '')

            trash = [['（', '）'], ['<', '>'], ['[', ']'], ['(', ')']]
            intro_raw = rid(intro_raw, trash)

    item['简介'] = intro_raw.replace('&lt', '').replace('&gt', '')
    return item


def rough_search(book, writter, nickname):
    s = requests.Session()
    s.headers['User-Agent'] = headers
    response = s.get(word_url + book)
    response.raise_for_status()
    response_str = response.content.decode('utf-8')

    writter_name_list = nickname.split('，')
    writter_name_list.append(writter)
    diff_writter = True
    for writter in writter_name_list:
        if writter == '':
            continue
        if writter.find('·') != -1:
            writter = writter.split('·')[-1]
        if response_str.find(writter) != -1:
            diff_writter = False
            break

    if not is_book(response_str, book) or diff_writter:
        print('Wrong ' + book)
        return

    return get_infor(response_str, book)


def precise_search(book, writter, nickname):
    s = requests.Session()
    s.headers['User-Agent'] = headers
    if writter.find('·') != -1:
        writter = writter.split('·')[-1]
    response = s.get(href_url + book + writter)
    response.raise_for_status()
    response_str = response.content.decode('utf-8')

    href_num = 2
    href_end = 0
    while 1:
        href_num -= 1
        href_start = response_str.find('class="result-title"', href_end) + 27
        href_end = response_str.find('" target="_blank"', href_start)
        href = response_str[href_start: href_end]

        if href_start == 26:
            return rough_search(book, writter, nickname)

        else:
            if href.startswith('/item/'):
                href = 'https://baike.baidu.com' + href
            response = s.get(href)
            response.raise_for_status()
            href_str = response.content.decode('utf-8')

        if is_book(href_str, book) or href_num < 0:
            break

    if not is_book(href_str, book):
        return rough_search(book, writter, nickname)

    return get_infor(href_str, book)


if __name__ == '__main__':
    book_all = []
    with open(read_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['代表作品'] != '':
                book_all.append([row['代表作品'], row['本名'], row['别名']])

    infor_dict = {}
    unwrite_list = []

    for book_infor in tqdm(book_all):
        book_list = []
        name_head = 0
        name_tail = 0
        for i in range(len(book_infor[0])):
            if book_infor[0][i] == '《':
                name_head = i
            elif book_infor[0][i] == '》':
                name_tail = i + 1
                book_list.append(book_infor[0][name_head: name_tail])
        for book in book_list:
            infor = precise_search(book, book_infor[1], book_infor[2])
            if infor:
                if infor['作品名称'] not in infor_dict.keys():
                    infor_dict[infor['作品名称']] = infor
            else:
                unwrite_list.append([book, book_infor[1], book_infor[2]])

    step = 1
    while 1:
        print('rolling step: %d' % step)
        step += 1
        last_len = len(unwrite_list)
        new_list = []
        for book in unwrite_list:
            infor = precise_search(book[0], book[1], book[2])
            if infor:
                if infor['作品名称'] not in infor_dict.keys():
                    infor_dict[infor['作品名称']] = infor
                    print(infor['作品名称'])
            else:
                new_list.append([book[0], book[1], book[2]])
        unwrite_list = new_list
        next_len = len(unwrite_list)
        if next_len == last_len:
            break

    with open(write_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, pro_list)
        writer.writeheader()
        for title, infor in infor_dict.items():
            writer.writerow(infor)
