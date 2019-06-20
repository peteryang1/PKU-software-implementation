import csv
import numpy as np
from get_vocab import get_rid

positive_path = 'data/question.csv'
negative_path = 'data/xiaohuangji50w_nofenci.conv'
length_edge = 50

length_list = []

if __name__ == '__main__':
    over = 0
    with open(positive_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        all_len = 0
        for row in reader:
            all_len += 1
            question = get_rid(row['question'])
            length_list.append(len(question))
            if len(question) > length_edge:
                over += 1

    print('中位数: ' + str(np.median(length_list)) + ' 平均值: ' + str(np.mean(length_list)))
    print('超出: ' + str(float(over / all_len)))
    print(all_len)
