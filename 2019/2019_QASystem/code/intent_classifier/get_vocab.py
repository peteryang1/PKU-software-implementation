import csv
import re

positive_path = 'data/question.csv'
negative_path = 'data/xiaohuangji50w_nofenci.conv'
vocab_path = 'data/vocabulary.txt'

word_dict = {}


def get_rid(raw):
    return re.sub(u"([^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a])", "", raw)


if __name__ == '__main__':
    word_dict['0'] = 0
    with open(positive_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            question = get_rid(row['question'])
            for i in range(len(question)):
                if question[i].isdigit():
                    word_dict['0'] += 1
                else:
                    if question[i] not in word_dict.keys():
                        word_dict[question[i]] = 1
                    else:
                        word_dict[question[i]] += 1

    with open(negative_path, 'r', encoding='utf-8') as f:
        state = 0
        question = ''
        for line in f.readlines():
            if line[0] == 'E':
                state = 1
            elif state == 1 and line[0] == 'M':
                state = 2
                question = get_rid(line[2:])
            elif state == 2 and line[0] not in ['E', 'M']:
                question += get_rid(line)
            elif state == 2 and line[0] == 'M':
                state = 0
                for i in range(len(question)):
                    if question[i].isdigit():
                        word_dict['0'] += 1
                    else:
                        if question[i] not in word_dict.keys():
                            word_dict[question[i]] = 1
                        else:
                            word_dict[question[i]] += 1

    word_tuple = sorted(word_dict.items(), key=lambda item: item[1], reverse=True)

    with open(vocab_path, 'w', encoding='utf-8') as f:
        f.write('<pad>\n')
        words_len = len(word_tuple)
        index = 0
        for word in word_tuple:
            index += 1
            if index == words_len:
                f.write(word[0])
            else:
                f.write(word[0] + '\n')
