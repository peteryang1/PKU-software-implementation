# coding=utf-8
import tools
import time
# 标注问题对数据，相似or不相似
old = 'run_data/ori.txt'
target = 'run_data/result_2.txt'
rid_list = ['字', '个', '篇', '首']
num_list = ['二', '三', '四', '五', '六', '七', '八', '九', '十']

with open('data/stop_words.txt', 'r', encoding='utf-8') as f1:
    stopwords = f1.readlines()


def stop_words(question):
    for word in stopwords:
        question = question.replace(word.rstrip('\n'), '')
    return question


def get_rid(question):
    for rid in rid_list:
        while 1:
            if_rid = False
            pos1 = question.find(rid)
            pos2 = pos1
            if pos1 != -1:
                while pos1 - 1 >= 0 and (question[pos1 - 1] in num_list or question[pos1 - 1].isdigit()):
                    if_rid = True
                    pos1 -= 1
            if if_rid:
                question = question[:pos1] + question[pos2 + 1:]
            else:
                break
    return question.replace('《', '').replace('》', '')


if __name__ == '__main__':
    with open(target, "w", encoding='utf-8') as f2:
        i = 0
        flag = 0
        for line in open(old, 'r', encoding='utf-8'):
            if i % 100 == 0:
                print('process %d' % i)
            line = line.strip().replace('&lt;', '').replace('&gt;', '').replace('&quot;', '').replace('&#39;', '')
            content = line.split('\t')
            if content[0] == '脊髓损伤高位截瘫有望康复吗？':
                flag = 1
            if flag:
                time.sleep(0.5)
                for j in range(5):
                    try:
                        query1 = get_rid(content[0])
                        query2 = get_rid(content[1])
                        score = tools.sim(query1, query2)
                        label = 0
                        if score > 0.8:
                            label = 1
                        else:
                            query1 = stop_words(query1)
                            query2 = stop_words(query2)
                            score = tools.sim(query1, query2)
                            if score > 0.8:
                                label = 1

                        '''else:
                            if query1.find('，') != -1:
                                short_query1 = query1.split('，')
                                for short in short_query1:
                                    if len(short) > 5 and tools.sim(short, query2) > 0.8:
                                        label = 1
                            if query2.find('，') != -1:
                                short_query2 = query2.split('，')
                                for short in short_query2:
                                    if len(short) > 5 and tools.sim(short, query1) > 0.8:
                                        label = 1'''
                        f2.write(content[0])
                        f2.write('\t')
                        f2.write(content[1])
                        f2.write('\t')
                        f2.write(str(label))
                        f2.write('\n')
                        break
                    except Exception as e:
                        print(e)
                        print(line)
            i += 1
