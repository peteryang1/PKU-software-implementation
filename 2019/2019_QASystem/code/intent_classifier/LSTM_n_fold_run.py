from LSTM_classifier import IntentModel
from get_vocab import get_rid
from LSTM_run import get_length
import csv
import tensorflow.contrib.keras as kr
import config
import random
from calculate import roc, f1

positive_path = 'data/question.csv'
negative_path = 'data/xiaohuangji50w_nofenci.conv'
vocab_path = 'data/vocabulary.txt'

ratio_list = [0.2, 0.4, 0.6, 0.8]
total_loss = 0.0
total_accuracy = 0.0
total_f1_score = 0.0
total_precision = 0.0
total_recall = 0.0
total_auc = 0.0


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

    contentid_match_list = []
    content_match_list = []
    contentid_split_list = []
    content_split_list = []
    last_len = 0
    for ratio in ratio_list:
        new_len = int(len(content2id_list)*ratio)
        contentid_split_list.append(content2id_list[last_len: new_len])
        content_split_list.append(content_list[last_len: new_len])
        last_len = new_len
    contentid_split_list.append(content2id_list[last_len:])
    content_split_list.append(content_list[last_len:])

    for contentid_split in contentid_split_list:
        testid_split = contentid_split
        trainid_split = []
        for split in contentid_split_list:
            if split != contentid_split:
                for content_id in split:
                    trainid_split.append(content_id)
        contentid_match_list.append([trainid_split, testid_split])

    for content_split in content_split_list:
        test_content_split = content_split
        train_content_split = []
        for split in content_split_list:
            if split != content_split:
                for content in split:
                    train_content_split.append(content)
        content_match_list.append([train_content_split, test_content_split])

    for index in range(len(contentid_match_list)):
        trainid_list = contentid_match_list[index][0]
        train_list = content_match_list[index][0]
        train_x = kr.preprocessing.sequence.pad_sequences(trainid_list, maxlen=config.sequence_length, padding='post', truncating='post')

        train_y = []
        for content in train_list:
            if content[1] == 1:
                train_y.append([0, 1])
            else:
                train_y.append([1, 0])

        testid_list = contentid_match_list[index][1]
        test_list = content_match_list[index][1]
        test_x = kr.preprocessing.sequence.pad_sequences(testid_list, maxlen=config.sequence_length, padding='post', truncating='post')

        test_y = []
        for content in test_list:
            if content[1] == 1:
                test_y.append([0, 1])
            else:
                test_y.append([1, 0])

        model = IntentModel()

        for i in range(3000):
            batch_train_x = []
            batch_train_y = []
            train_num = random.sample(list(range(len(train_x))), config.batch_size)
            for num in train_num:
                batch_train_x.append(train_x[num])
                batch_train_y.append(train_y[num])
            real_train_length = get_length(batch_train_x)
            _, train_loss, train_accuracy = model.train_step([batch_train_x, batch_train_y], real_train_length)
            batch = i + 1
            '''if batch % 50 == 0:
                print('batch: %d, loss: %.4f, accuracy: %.4f' % (batch, train_loss, train_accuracy))'''
            if batch % 100 == 0:
                batch_dev_x = []
                batch_dev_y = []
                test_num = random.sample(list(range(len(test_x))), config.batch_size)
                for num in test_num:
                    batch_dev_x.append(test_x[num])
                    batch_dev_y.append(test_y[num])
                real_dev_length = get_length(batch_dev_x)
                dev_loss, dev_accuracy, dev_predictions, dev_real = model.dev_step([batch_dev_x, batch_dev_y], real_dev_length)
                dev_f1_score, dev_precision, dev_recall = f1(dev_predictions, dev_real)
                dev_auc = roc(dev_predictions, dev_real, False, False)
                print('DevTest!! batch: %d, loss: %.4f, accuracy: %.4f, f1_score: %.4f, precision: %.4f, recall: %.4f, auc: %.4f' % (batch, dev_loss, dev_accuracy, dev_f1_score, dev_precision, dev_recall, dev_auc))

        batch_test_x = []
        batch_test_y = []
        test_num = random.sample(list(range(len(test_x))), config.test_batch_size)
        for num in test_num:
            batch_test_x.append(test_x[num])
            batch_test_y.append(test_y[num])
        real_test_length = get_length(batch_test_x)
        test_loss, test_accuracy, test_predictions, test_real = model.dev_step([batch_test_x, batch_test_y], real_test_length)
        test_f1_score, test_precision, test_recall = f1(test_predictions, test_real)
        if index == len(contentid_match_list) - 1:
            test_auc = roc(test_predictions, test_real, True, True)
        else:
            test_auc = roc(test_predictions, test_real, True, False)
        print('FinalTest!!  loss: %.4f, accuracy: %.4f, f1_score: %.4f, precision: %.4f, recall: %.4f, auc: %.4f' % (test_loss, test_accuracy, test_f1_score, test_precision, test_recall, test_auc))
        total_loss += test_loss
        total_accuracy += test_accuracy
        total_f1_score += test_f1_score
        total_precision += test_precision
        total_recall += test_recall
        total_auc += test_auc

    av_loss = float(total_loss / (len(ratio_list) + 1))
    av_accuracy = float(total_accuracy / (len(ratio_list) + 1))
    av_f1_score = float(total_f1_score / (len(ratio_list) + 1))
    av_precision = float(total_precision / (len(ratio_list) + 1))
    av_recall = float(total_recall / (len(ratio_list) + 1))
    av_auc = float(total_auc / (len(ratio_list) + 1))
    print('5_Fold_Test!!  loss: %.4f, accuracy: %.4f, f1_score: %.4f, precision: %.4f, recall: %.4f, auc: %.4f' % (av_loss, av_accuracy, av_f1_score, av_precision, av_recall, av_auc))
