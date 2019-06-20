# coding=utf-8
import csv
import re

path = 'result/all_writter.csv'

with open(path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['别名'] != '':
            name_list = row['别名'].split('，')
            for name in name_list:
                if len(name) == 1:
                    print(row['本名'])
