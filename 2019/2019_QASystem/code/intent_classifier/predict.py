from LSTM_classifier import IntentModel
from get_vocab import get_rid
import tensorflow.contrib.keras as kr
import config
from LSTM_run import get_length

checkpoint_path = 'model/intent_classifier_model'
vocab_path = 'data/vocabulary.txt'

test_question = '你叫什么'


if __name__ == '__main__':
    with open(vocab_path, 'r', encoding='utf8') as file:
        vocabulary_list = [k.strip() for k in file.readlines()]
    word2id_dict = dict([(b, a) for a, b in enumerate(vocabulary_list)])
    content_list = []
    test_question = get_rid(test_question)
    print(test_question)
    for i in range(len(test_question)):
        content_list.append(word2id_dict[test_question[i]])
    test_x = kr.preprocessing.sequence.pad_sequences([content_list], maxlen=config.sequence_length, padding='post', truncating='post')
    model = IntentModel()
    model.load(checkpoint_path)
    real_train_length = get_length(test_x)
    predictions, max_score = model.test_step([test_x], real_train_length)
    print(predictions)
    print(max_score)
    if predictions == [0]:
        print('问答')
    else:
        print('闲聊')
