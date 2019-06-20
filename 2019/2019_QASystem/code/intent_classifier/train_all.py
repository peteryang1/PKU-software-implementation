from LSTM_classifier import IntentModel
from get_vocab import get_rid
import csv
import tensorflow.contrib.keras as kr
import config
import random
import numpy as np

positive_path = 'data/question.csv'
negative_path = 'data/xiaohuangji50w_nofenci.conv'
vocab_path = 'data/vocabulary.txt'
checkpoint_path = 'model/intent_classifier_model'


def get_length(x_batch):
    real_len = []
    for line in x_batch:
        real_len.append(np.sum(np.sign(line)))
    return real_len


if __name__ == '__main__':
    with open(vocab_path, 'r', encoding='utf8') as file:
        vocabulary_list = [k.strip() for k in file.readlines()]
    word2id_dict = dict([(b, a) for a, b in enumerate(vocabulary_list)])

    content_list = []
    with open(positive_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            content_list.append([get_rid(row['question']), 1])

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
                content_list.append([question, 0])

    random.shuffle(content_list)

    content2id = lambda content: [word2id_dict[word] for word in content if word in word2id_dict]
    content2id_list = [content2id(content[0]) for content in content_list]

    train_x = kr.preprocessing.sequence.pad_sequences(content2id_list, maxlen=config.sequence_length, padding='post', truncating='post')

    train_y = []
    for content in content_list:
        if content[1] == 1:
            train_y.append([0, 1])
        else:
            train_y.append([1, 0])

    model = IntentModel()

    for i in range(3000):
        batch_train_x = []
        batch_train_y = []
        train_num = random.sample(list(range(len(train_x))), config.train_batch_size)
        for num in train_num:
            batch_train_x.append(train_x[num])
            batch_train_y.append(train_y[num])
        real_train_length = get_length(batch_train_x)
        _, train_loss, train_accuracy = model.train_step([batch_train_x, batch_train_y], real_train_length)
        batch = i + 1
        if batch % 100 == 0:
            print('batch: %d, loss: %.4f, accuracy: %.4f' % (batch, train_loss, train_accuracy))
    model.save(checkpoint_path)
