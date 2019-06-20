import csv

writter_path = ['result/ch_1.csv', 'result/ch_2.csv', 'result/foreign.csv']
write_path = 'result/all_writter.csv'
pro_list = ['本名', '外文名', '别名', '字号', '所处时代', '国籍', '毕业院校', '民族', '出生时间', '逝世时间', '职业', '官职', '出生地', '代表作品', '人物关系', '简介']

if __name__ == '__main__':
    with open(write_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, pro_list)
        writer.writeheader()
        for path in writter_path:
            with open(path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if path.find('ch_') != -1:
                        row['外文名'] = ''
                    writer.writerow(row)
