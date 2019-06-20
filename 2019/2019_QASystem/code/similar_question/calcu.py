compare_path = 'data/q_a_l.txt'
# test_path = 'data/q_a_l_new_0.8.txt'
# test_path = 'data/q_a_l_new_filter.txt'
# test_path = 'data/q_a_l_ori.txt'
test_path = 'data/q_a_l_much_1.txt'


compare_list = []
with open(compare_path, 'r', encoding='utf-8') as f:
    i = 0
    for line in f.readlines():
        if i == 1000:
            break
        compare_list.append(line.split('\t')[-1].rstrip('\n'))
        i += 1

test_list = []
with open(test_path, 'r', encoding='utf-8') as f:
    i = 0
    for line in f.readlines():
        if i == 1000:
            break
        test_list.append(line.split('\t')[-1].rstrip('\n'))
        i += 1

right = 0
for i in range(len(compare_list)):
    if compare_list[i] == test_list[i]:
        right += 1
print('rate:', float(right / len(compare_list)))
