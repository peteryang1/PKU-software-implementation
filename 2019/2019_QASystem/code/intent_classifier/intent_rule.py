# coding=utf-8
from words_vector import tools

subject_person = 'data/subject_person'
subject_work = 'data/subject_work'
subject_filename = [subject_person, subject_work]
subject_dict = {}

# 加载全部实体
for file in subject_filename:
    for line in open(file, encoding='utf-8'):
        words = line.split(',')
        for word in words:
            word = word.strip()
            if word not in subject_dict:
                subject_dict[word] = 1


# 使用规则来做意图分类   
def intent_classify_rule(query):
    # 分词
    intent = 0
    words = tools.lexer(query)
    for word in words:
        if word in subject_dict:
            # 意图为问答
            intent = 1
    return intent


if __name__ == '__main__':
    query = '李白诗歌特点'
    print(intent_classify_rule(query))
