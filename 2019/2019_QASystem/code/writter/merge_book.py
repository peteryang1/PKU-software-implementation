import csv

writter_path = ['result/book_ch1.csv', 'result/book_ch2.csv', 'result/book_foreign.csv']
write_path = 'result/all_book.csv'
pro_list = ['作品名称', '简介']
ban_list = ['《归途赋》', '《词综》', '《诗格》', '《故园》', '《胡适论学近著》', '《一路兵歌》', '《存在的瞬间》', '《一个新婚诗人的日记》']

if __name__ == '__main__':
    with open(write_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, pro_list)
        writer.writeheader()
        for path in writter_path:
            with open(path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row['作品名称'] not in ban_list:
                        writer.writerow(row)
