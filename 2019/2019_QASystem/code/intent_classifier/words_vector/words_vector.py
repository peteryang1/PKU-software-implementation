# coding=utf-8

from words_vector import tools
import time

cut_path = 'data/cut_words_small'
target_path = 'data/words_vector/'

if __name__ == '__main__':
    words_dict = {}
    with open(cut_path, 'r', encoding='utf-8') as f:
        words = [line.strip() for line in f.readlines()]
    i = 1
    for word in words:
        time.sleep(0.5)
        res = tools.word2vec(word)
        if 'error_code' in res:
            continue
        vector = res['vec']
        words_dict[word] = vector

        if i % 1000 == 0:
            print('process ' + str(i))
            with open(target_path + str(int(i / 1000)), 'w', encoding='utf-8') as f:
                index = len(words_dict)
                for word in words_dict:
                    if words_dict[word] == 1:
                        continue
                    f.write(word)
                    f.write('\t')
                    f.write(str(words_dict[word]))
                    index -= 1
                    if index:
                        f.write('\n')
            words_dict = {}
        i += 1

    print('vector finish!')
