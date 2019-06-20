# coding=utf-8

from words_vector import tools
import pandas as pd
import re

qa_csv = '../data/zhidao_qa.csv'
chat_file = '../data/xiaohuangji50w_nofenci.conv'
# 词表
words = {}
# 匹配标点
pattern = re.compile("[^\u4e00-\u9fa5^a-z^A-Z^0-9]")
target_file = 'data/cut_words_small'

table_qa = pd.read_csv(qa_csv, index_col=0, encoding='utf-8')


if __name__ == '__main__':
    for i in range(len(table_qa)):
        question = table_qa.loc[i]['question']
        answer = table_qa.loc[i]['answer']

        # 调用分词接口，标点不存储
        question_lexer = tools.lexer(question)
        for word in question_lexer:
            if re.search(pattern, word):
                continue
            if word not in words:
                words[word] = 1
            else:
                words[word] += 1

        answer_lexer = tools.lexer(answer)
        for word in answer_lexer:
            if re.search(pattern, word):
                continue
            if word not in words:
                words[word] = 1
            else:
                words[word] += 1

        if i % 1000 == 0:
            print(i)

    print('jieba qa finish!')

    with open(chat_file, 'r', encoding='utf-8') as f:
        i = 0
        for line in f.readlines():
            if line[0] in ['E', 'M']:
                qa = line[2:]
            else:
                qa = line

            qa_lexer = tools.lexer(qa)
            for word in qa_lexer:
                if re.search(pattern, word):
                    continue
                if word not in words:
                    words[word] = 1
                else:
                    words[word] += 1

            if i % 1000 == 0:
                print(i)
            i += 1

    print('jieba chat finish!  len = ' + str(len(words)))
    with open(target_file, 'w', encoding='utf-8') as f:
        for word, num in words.items():
            if num > 10:
                f.write(word + '\n')
