source_path = 'data/question_pair_label2.txt'
destination_path = 'data/q_a_l_ori.txt'

if __name__ == '__main__':
    with open(source_path, 'r', encoding='utf-8') as f1:
        with open(destination_path, 'w', encoding='utf-8') as f2:
            for line in f1.readlines():
                question = line.split('	')
                if question[0].endswith('...') or question[1].endswith('...'):
                    continue
                else:
                    line = line.replace('&lt;', '').replace('&gt;', '').replace('&quot;', '').replace('&#39;', '')
                    f2.write(line)
