i = 0
for line in open('run_data/20000.txt', 'r', encoding='utf-8'):
    if i < 4000:
        with open('run_data/pa_1.txt', 'a', encoding='utf-8') as f:
            f.write(line)
            i += 1
    elif i < 8000:
        with open('run_data/pa_2.txt', 'a', encoding='utf-8') as f:
            f.write(line)
            i += 1
    elif i < 12000:
        with open('run_data/pa_3.txt', 'a', encoding='utf-8') as f:
            f.write(line)
            i += 1
    elif i < 16000:
        with open('run_data/pa_4.txt', 'a', encoding='utf-8') as f:
            f.write(line)
            i += 1
    else:
        with open('run_data/pa_5.txt', 'a', encoding='utf-8') as f:
            f.write(line)
            i += 1
