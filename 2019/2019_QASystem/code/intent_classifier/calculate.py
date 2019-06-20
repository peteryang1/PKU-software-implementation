from sklearn.metrics import auc, roc_curve, precision_score, recall_score, f1_score
import matplotlib.pyplot as plt


def f1(y_predict, y_true):
    f1 = f1_score(y_true, y_predict)
    precision = precision_score(y_true, y_predict)
    recall = recall_score(y_true, y_predict)
    return f1, precision, recall


def roc(y_predict, y_true, if_show, if_write):
    fpr, tpr, thresholds = roc_curve(y_true, y_predict, pos_label=1)
    auc_value = auc(fpr, tpr)
    if if_show:
        plt.plot(fpr, tpr)
        plt.title('ROC_curve' + '(AUC: ' + str(auc_value) + ')')
        plt.ylabel('True Positive Rate')
        plt.xlabel('False Positive Rate')
    if if_write:
        plt.show()
    return auc_value
