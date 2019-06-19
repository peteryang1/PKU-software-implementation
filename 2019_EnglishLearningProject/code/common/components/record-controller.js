define([
    'jquery',
    'knockout',
    'audio'
],  
    function ($, ko, audio) {
        return {
            template:
                '<!-- ko template: { nodes: $componentTemplateNodes } --><!--/ko-->',
            viewModel: viewModel
        };
        
        function viewModel(params) {
            var self = this,
                minRecordTime = 1000,
                maxRecordTime = 30000;

            params.callbacks = $.extend({
                startRecord: $.noop,
                stopRecord: $.noop,
                uploadVoice: function (p) { return p; },
                onRecordTimeout: function () {
                    mAlert("您的录音超过30秒, 已经自动停止录音.");
                }
            }, params.callbacks);

            var totalRecordTime = params.totalRecordTime || 0;
            var StateEnum = {
                DEFAULT: 0,
                STARTING: 1,
                RECORDING: 2,
                STOPPING: 3,
                SCORING: 4,
                STOP_TOO_EARLY: 5
            };
            self.state = ko.observable(StateEnum.DEFAULT);
            var minRecordTimer, maxRecordTimer;

            var element;

            ko.bindingHandlers.recordController = {
                init: function (elem) {
                    element = elem;
                    //mode: press record | single click record
                    //usage: add 'single-click-record' class to the record button if a single click record mode is required.
                    //attention: single click record should manually stop by triggering 'stopRecord' event
                    if (interactionMode.isMouseSupported()) {
                        if ($(elem).hasClass('single-click-record')) {
                            $(elem)
                                .on('startRecord mousedown', startRecord)
                                .on('stopRecord', stopRecord);
                        } else {
                            $(elem)
                                .on('startRecord mousedown', startRecord)
                                .on('stopRecord mouseup', stopRecord);
                        }
                    } else {
                        if ($(elem).hasClass('single-click-record')) {
                            $(elem)
                                .on('startRecord touchstart', startRecord)
                                .on('stopRecord', stopRecord);
                        } else {
                            $(elem)
                                .on('startRecord touchstart', startRecord)
                                .on('stopRecord touchend', stopRecord);
                        }
                    }
                }
            };

            function startRecord() {
                // can only start record in state default.
                if (self.state() != StateEnum.DEFAULT) return;
                self.state(StateEnum.STARTING);
                var promise = audio.startRecord()
                    .done(recordStarted)
                    .fail(function () {
                        self.state(StateEnum.DEFAULT);
                        mAlert('开始录音失败(T_T). 请重试.');
                    });
                params.callbacks.startRecord(promise, element);
            }

            function recordStarted() {
                if (self.state() != StateEnum.STOP_TOO_EARLY) {
                    self.state(StateEnum.RECORDING);
                }
                minRecordTimer = setTimeout(atMinRecordTime, minRecordTime);
            }

            function atMinRecordTime() {
                minRecordTimer = undefined;
                if (self.state() == StateEnum.STOP_TOO_EARLY) {
                    // stop too short record
                    abortRecord();
                } else {
                    // Start record successfully.
                    maxRecordTimer = setTimeout(atMaxRecordTime, maxRecordTime);
                }
            }

            function atMaxRecordTime() {
                maxRecordTimer = undefined;
                if (self.state() === StateEnum.RECORDING) {
                    // abort record on timeout
                    abortRecord();
                    params.callbacks.onRecordTimeout();
                }
            }

            function abortRecord() {
                self.state(StateEnum.STOPPING);
                audio.stopRecord()
                    .always(function () {
                        self.state(StateEnum.DEFAULT);
                    });
            }

            self.clazz = ko.pureComputed(function () {
                return params.classMapping(self.state(), StateEnum);
            });

            function stopRecord() {
                clearTimeout(maxRecordTimer);
                if (self.state() == StateEnum.STARTING
                    || minRecordTimer) {
                    // Set state as STOP_TOO_EARLY during state START, or when the recordEarlyStage flag is on.
                    self.state(StateEnum.STOP_TOO_EARLY);
                    var res = { errMsg: "stopRecord:tooshort by recorder.js" };
                    stopRecordErrMsgHandler(res);
                    params.callbacks.stopRecord($.Deferred().reject(res), element);
                } else if (self.state() == StateEnum.RECORDING) {
                    stopNormalRecord();
                }
            }

            function stopRecordErrMsgHandler(res) {
                if (/tooshort/.test(res.errMsg)) {
                    mAlert("你的录音时间太短了, 请重录。");
                } else {// stopRecord:fail
                    mAlert("微信停止录音失败了.");
                }
            }
            function stopNormalRecord() {
                self.state(StateEnum.STOPPING);
                var promise = audio.stopRecord()
                .fail(function (res) {
                    self.state(StateEnum.DEFAULT);
                    stopRecordErrMsgHandler(res);
                });
                params.callbacks.stopRecord(promise, element);
                uploadVoice(promise);
            };

            function uploadVoice(promise) {
                promise = promise.then(function (res) {
                    params.localId(res.localId);
                    self.state(StateEnum.SCORING);
                    res.isShowProgressTips = params.isShowProgressTips;
                    res.uploadVoiceFailMessage = params.uploadVoiceFailMessage;
                    // Queue uploadVoice
                    var deferred = $.Deferred();
                    app.uploadQueue.push(function () {
                        return audio.uploadVoice(res)
                            .always(function (r) {
                                // Forward the localId for invalidating outdated rateSpeech.
                                // TODO: @Richard, try to refine this code
                                r.localId = res.localId;
                            })
                            .done(deferred.resolve).fail(deferred.reject);
                    });
                    return deferred;
                });
                // Reset to state default until scoring is done.
                params.callbacks.uploadVoice(promise)
                    .always(function () {
                        self.state(StateEnum.DEFAULT);
                    });
            };

        }

    })