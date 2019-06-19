define([
    'jquery',
    'wx',
    'recorder'
], function ($, wx, recorder) {
    'use strict';
    return new audio();
    function audio() {
        var undefined;
        var self = this;

        function createDeferredAndUpdateOption(options) {
            var deferred = $.Deferred().done(options.success).fail(options.fail).always(options.complete);
            options.success = deferred.resolve;
            options.fail = deferred.reject;
            options.complete = $.noop;
            return deferred;
        }

        // options:
        // * onRecordTimeout: a fuction to be called when recording is timeout.
        self.startRecord = function (options) {
            options = $.extend({}, options);
            var deferred = createDeferredAndUpdateOption(options);
            self.rec.startRecord(options);
            return deferred;
        };

        self.stopRecord = function (options) {
            options = $.extend({}, options);
            var deferred = createDeferredAndUpdateOption(options);
            self.rec.stopRecord(options);
            return deferred;
        };

        self.uploadVoice = function (options) {
            options = $.extend({}, options);
            // Modifying options.success, rather than deferred.done, is to ensure that
            // the result is modified since the first done callback.
            // TODO: move flag isWeChat to outside of audio.js, and pass it in.
            var success = options.success || $.noop;
            options.success = function (r) {
                r.isWeChatServerId = !device.bingDict() && device.wechat();
                if (!r.isWeChatServerId) {
                    r.binary = options.binary;
                }
                r.localId = options.localId;
                success(r);
            };
            var deferred = createDeferredAndUpdateOption(options);
            deferred.fail(function (r) {
                mAlert(options.uploadVoiceFailMessage || '上传语音失败(T_T), 请重录.');
            });
            self.rec.uploadVoice(options);
            return deferred;
        };

        self.downloadVoice = function (options) {
            options = $.extend({}, options);
            var deferred = createDeferredAndUpdateOption(options);
            deferred.fail(function (r) {
                mAlert('下载语音失败(T_T).');
            });
            self.rec.downloadVoice(options);
            return deferred;
        };

        self.playRecord = function (options) {
            options = $.extend({}, options);
            var deferred = createDeferredAndUpdateOption(options);
            self.rec.playRecord(options);
            return deferred;
        };

        self.stopPlayRecord = function (options) {
            options = $.extend({}, options);
            var deferred = createDeferredAndUpdateOption(options);
            self.rec.stopPlayRecord(options);
            return deferred;
        };

        function base64ToBlobAndBinary(base64String) {
            var byteString = atob(base64String);
            var unitArray = new Uint8Array(new ArrayBuffer(byteString.length));
            // Service API doesn't support typed array, have to use js built-in array.
            var data = [];
            for (var i = 0; i < byteString.length; i++) {
                unitArray[i] = byteString.charCodeAt(i);
                data.push(unitArray[i]);
            }
            var newBlob = new Blob([unitArray], { type: "audio/wav" });
            return { blob: newBlob, binary: data };
        };

        function attachWeChatRecorder(self) {
            self.rec = {
                startRecord: function (options) {
                    var success = options.success;
                    options.success = function () {
                        wx.onVoiceRecordEnd({
                            complete: options.onRecordTimeout
                        });
                        success();
                    }
                    wx.startRecord(options);
                },
                stopRecord: wx.stopRecord,
                uploadVoice: wx.uploadVoice,
                downloadVoice: wx.downloadVoice,
                playRecord: function (options) {
                    var success = options.success;
                    options.success = function (r) {
                        wx.onVoicePlayEnd({
                            complete: options.onPlayEnd
                        });
                        success(r);
                    }
                    wx.playVoice(options);
                },
                stopPlayRecord: wx.stopVoice
            };
        }

        var playRecord = function (options) {
            var au = $('<audio id="user-record" src="' + options.localId + '">');
            au.appendTo('body');
            au.trigger('play');
            au.on('ended', options.onPlayEnd || $.noop)
                .on('ended', function () { $(this).remove(); });
            options.success();
            options.complete();
        };

        var stopPlayRecord = function (options) {
            $('#user-record').remove();
            options.success();
            options.complete();
        };

        var uploadVoice = function (options) {
            setTimeout(function () {
                var res = {};
                if (Math.random() < 1) {// If you want to test what will happen when uploadFail, change this number to a decimal.
                    res.errMsg = 'uploadVoice:ok';
                    options.success(res);
                } else {
                    res.errMsg = 'uploadVoice:fail';
                    options.fail(res);
                }
                options.complete(res);
            }, 100);
        };

        var downloadVoice = function (options) {
            options.success({});
            options.complete();
        };

        function getAudioContext() {
            if (!window.audioContext) {
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    window.audioContext = new AudioContext();
                } catch (e) {
                    console.log('No web audio support in this browser!');
                }
            }
            return window.audioContext;
        }

        function attachH5Recorder(self) {
            getAudioContext();
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
            window.URL = window.URL || window.webkitURL;
            navigator.getUserMedia({ audio: true },
                function (stream) {
                    var input = audioContext.createMediaStreamSource(stream);
                    console.log('Media stream created.');

                    var rec = new Recorder(input, { workerPath: '/src/lib/recorderWorker.js' });
                    rec.startRecord = function (options) {
                        audioContext.resume() && self.rec.record();
                        options.success();
                        options.complete();
                    };
                    rec.stopRecord = function (options) {
                        rec.stop();
                        rec.exportWAV(function (blob) {
                            var localId = URL.createObjectURL(blob);
                            rec.localMap[localId] = blob;
                            var reader = new FileReader();
                            reader.onload = function () {
                                var buf = new Uint8Array(this.result);
                                var data = [];
                                for (var i = 0; i < buf.length; ++i) {
                                    data.push(buf[i]);
                                }
                                var res = { localId: localId, binary: data, isWeChatServerId: false };
                                options.success(res);
                                options.complete(res);
                            };
                            reader.readAsArrayBuffer(blob);
                        });
                        rec.clear();
                    };
                    rec.uploadVoice = uploadVoice;
                    rec.downloadVoice = downloadVoice;
                    rec.playRecord = playRecord;
                    rec.stopPlayRecord = stopPlayRecord;
                    rec.localMap = {};
                    self.rec = rec;
                    console.log('Recorder initialised.');
                },
                function (e) {
                    console.log('No live audio input: ' + e);
                    mAlert('没有检测到音频输入设备!');
                });
        }

       
       

        +function init() {
            if (window.appName === "app-writing-rater") {
                return;
            }
            if (device.wechat()) {
                attachWeChatRecorder(self);
            } else {
                // HTML5 Recorder
                attachH5Recorder(self);
            }
        }();

    }
});