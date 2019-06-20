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
            var self = this;
            self.localId = params.localId;
            params.onStateChange = params.onStateChange || $.noop;

            ko.bindingHandlers.voiceController = {
                init: function (elem) {
                    self.$ctrl = $(elem).on('click', click)
                    .on('startPlay', startPlay)
                    .on('endPlay', endPlay);
                }
            };
            function click(event) {
                self.$ctrl.trigger(self.state() === 'default' ? 'startPlay' : 'endPlay');
            }
            function startPlay(event) {
                var localId = ko.unwrap(self.localId);
                var audios = $('audio');
                for (var i = 0; i < audios.length; i++) {
                    audios[i].pause();
                    audios[i].currentTime = 0;
                }
                audio.playRecord({
                    localId: localId,
                    success: function () {
                        app.playingLocalId(localId);
                    },
                    onPlayEnd: onPlayEnd
                });
            };
            function onPlayEnd() {
                app.playingLocalId(undefined);
            }

            function endPlay() {
                var localId = ko.unwrap(self.localId);
                if (localId != undefined) {
                    audio.stopPlayRecord({
                        localId: ko.unwrap(self.localId),
                        success: onPlayEnd,
                        fail: function (e) {
                            if (e.errMsg !== 'stopVoice:not playing') {
                                mAlert("停止播放录音失败!");
                            }
                        }
                    });
                }
            }

            self.playingLocalIdSubscription = app.playingLocalId.subscribe(function (playingLocalId) {
                var localId = ko.unwrap(self.localId);
                if (!playingLocalId) {
                    self.state('default');
                } else if (playingLocalId !== localId) {
                    self.state('disabled');
                } else {
                    self.state('playing');
                }
            });

            self.state = ko.observable('default');
            var stateList = ['default', 'playing', 'disabled'];
            var states = stateList.join(' ');

            viewModel.prototype.dispose = function () {
                // TODO: investigate more on dispose.
                this.playingLocalIdSubscription.dispose();
            };

        }

    })