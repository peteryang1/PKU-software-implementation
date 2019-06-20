# coding=utf-8
# @author=cer

import tensorflow as tf
import config
import os
from calculate import f1


class IntentModel(object):
    """
    A CNN for text classification.
    Uses an embedding layer, followed by a convolutional, max-pooling and softmax layer.
    """
    def __init__(self):
        tf.reset_default_graph()
        self.sequence_length = config.sequence_length
        self.num_classes = config.num_classes
        self.vocab_size = config.vocab_size
        self.embedding_size = config.embedding_size
        self.filter_sizes = config.filter_sizes
        self.num_filters = config.num_filters
        self.l2_reg_lambda = config.l2_reg_lambda

        # Placeholders for input, output and dropout
        self.input_x = tf.placeholder(tf.int32, [None, self.sequence_length], name="input_x")   # Line not sure
        self.input_y = tf.placeholder(tf.float32, [None, self.num_classes], name="input_y")
        self.dropout_keep_prob = tf.placeholder(tf.float32, name="dropout_keep_prob")

        # Keeping track of l2 regularization loss (optional)
        l2_loss = tf.constant(0.0)

        # Embedding layer
        with tf.device('/cpu:0'), tf.name_scope("embedding"):
            self.W = tf.Variable(
                tf.random_uniform([self.vocab_size, self.embedding_size], -1.0, 1.0),
                name="W")
            self.embedded_chars = tf.nn.embedding_lookup(self.W, self.input_x)
            self.embedded_chars_expanded = tf.expand_dims(self.embedded_chars, -1)

        # Create a convolution + maxpool layer for each filter size
        pooled_outputs = []
        for i, filter_size in enumerate(self.filter_sizes):
            with tf.name_scope("conv-maxpool-%s" % filter_size):
                # Convolution Layer
                filter_shape = [filter_size, self.embedding_size, 1, self.num_filters]
                W = tf.Variable(tf.truncated_normal(filter_shape, stddev=0.1), name="W")
                b = tf.Variable(tf.constant(0.1, shape=[self.num_filters]), name="b")
                conv = tf.nn.conv2d(
                    self.embedded_chars_expanded,
                    W,
                    strides=[1, 1, 1, 1],
                    padding="VALID",
                    name="conv")
                # Apply nonlinearity
                h = tf.nn.relu(tf.nn.bias_add(conv, b), name="relu")
                # Maxpooling over the outputs
                pooled = tf.nn.max_pool(
                    h,
                    ksize=[1, self.sequence_length - filter_size + 1, 1, 1],
                    strides=[1, 1, 1, 1],
                    padding='VALID',
                    name="pool")
                pooled_outputs.append(pooled)

        # Combine all the pooled features
        num_filters_total = self.num_filters * len(self.filter_sizes)
        self.h_pool = tf.concat(pooled_outputs, 3)
        self.h_pool_flat = tf.reshape(self.h_pool, [-1, num_filters_total])

        # Add dropout
        with tf.name_scope("dropout"):
            self.h_drop = tf.nn.dropout(self.h_pool_flat, self.dropout_keep_prob)

        # Final (unnormalized) scores and predictions
        with tf.name_scope("output"):
            W = tf.get_variable(
                "W",
                shape=[num_filters_total, self.num_classes],
                initializer=tf.contrib.layers.xavier_initializer())
            b = tf.Variable(tf.constant(0.1, shape=[self.num_classes]), name="b")
            l2_loss += tf.nn.l2_loss(W)
            l2_loss += tf.nn.l2_loss(b)
            self.scores = tf.nn.xw_plus_b(self.h_drop, W, b, name="scores")
            self.predictions = tf.argmax(self.scores, 1, name="predictions")
            self.max_score = tf.reduce_max(tf.nn.softmax(self.scores), 1, name="max_score")

        # Calculate mean cross-entropy loss
        with tf.name_scope("loss"):
            losses = tf.nn.softmax_cross_entropy_with_logits(logits=self.scores, labels=self.input_y)
            self.loss = tf.reduce_mean(losses) + self.l2_reg_lambda * l2_loss

        # Accuracy
        with tf.name_scope("accuracy"):
            correct_predictions = tf.equal(self.predictions, tf.argmax(self.input_y, 1))
            self.accuracy = tf.reduce_mean(tf.cast(correct_predictions, "float"),
                                           name="accuracy")
            self.real = tf.argmax(self.input_y, 1)
        self.global_step = tf.Variable(0, name="global_step", trainable=False)
        optimizer = tf.train.AdamOptimizer(1e-3)
        grads_and_vars = optimizer.compute_gradients(self.loss)
        self.train_op = optimizer.apply_gradients(grads_and_vars,
                                                  global_step=self.global_step)
        self.saver = tf.train.Saver(tf.global_variables(), max_to_keep=2)

        init = tf.global_variables_initializer()
        self.session = tf.Session()
        self.session.run(init)

    def train_step(self, batch):
        """
        A single training step
        """
        feed_dict = {
            self.input_x: batch[0],
            self.input_y: batch[1],
            self.dropout_keep_prob: config.dropout_keep_prob
        }
        result = self.session.run(
            [self.train_op, self.loss, self.accuracy],
            feed_dict)
        return result

    def dev_step(self, batch):
        """
        Evaluates model on a dev set
        """
        feed_dict = {
            self.input_x: batch[0],
            self.input_y: batch[1],
            self.dropout_keep_prob: 1.0
        }
        result = self.session.run(
            [self.loss, self.accuracy, self.predictions, self.real],
            feed_dict)
        return result

    def test_step(self, batch):
        """
        Evaluates model on a dev set
        """
        feed_dict = {
            self.input_x: batch[0],
            self.dropout_keep_prob: 1.0
        }
        result = self.session.run(
            [self.predictions, self.max_score],
            feed_dict)
        return result

    def save(self, checkpoint_path, checkpoint_name="best"):
        if not os.path.exists(checkpoint_path):
            os.makedirs(checkpoint_path)
            print("make dir: ", checkpoint_path)
        print('[*] saving checkpoints to {}...'.format(checkpoint_path))
        self.saver.save(self.session, os.path.join(checkpoint_path, checkpoint_name))

    def load(self, checkpoint_path, checkpoint_name="best"):
        print('[*] Loading checkpoints from {}...'.format(checkpoint_path))
        try:
            self.saver.restore(self.session, os.path.join(checkpoint_path, checkpoint_name))
        except Exception as e:
            print(e)
            print("check ckpt file path !!!")
            exit(1)
