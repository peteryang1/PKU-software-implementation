define([
    'jquery',
    'knockout'
],
    function ($, ko) {
        return {
            template: '<!-- ko template: { afterRender: afterRender } -->'
            + '<!-- ko template: { nodes: $componentTemplateNodes } --><!--/ko-->'
            + '<audio data-bind="attr: { id: id, src: src }, event: { playing: audioStart, \'pause ended\': audioEnd }" preload="metadata"></audio>'
            + '<!-- /ko -->',
            viewModel: viewModel
        };

        function viewModel(params) {
            var self = this;
            self.src = params.src;
            function defaultOnStateChange($ctrl, state) {
                $ctrl.find('.icon').removeClass('icon-audio icon-pause')
                .addClass(state == 'default' ? 'icon-audio' : 'icon-pause');
            }
            params.onStateChange = params.onStateChange || defaultOnStateChange;
            params.onReady = params.onReady || $.noop;
            self.id = utils.guid();

            ko.bindingHandlers.audioController = {
                init: function (elem) {
                    self.$ctrl =
                        $(elem)
                        .on('click', tap)
                        .on('startPlay', startPlay)
                        .on('endPlay', endPlay);
                }
            };

            self.afterRender = function () {
                params.onReady(self.$ctrl);
            };

            function tap() {
                self.$ctrl.trigger(self.state() === 'default' ? 'startPlay' : 'endPlay');
            }

            function startPlay() {
                var audios = $('audio');
                for (var i = 0; i < audios.length; i++) {
                    audios[i].pause();
                    audios[i].currentTime = 0;
                }
                $('#' + self.id).trigger('play');
                $("[data-bind*='voiceController']").trigger('endPlay');
            }

            function endPlay() {
                $('#' + self.id).stopAudio();
            }

            self.audioStart = function (data, event) {
                self.state('playing');
                return true;
            };

            self.audioEnd = function (data, event) {
                self.state('default');
                return true;
            };

            self.state = ko.observable('default');
            var stateList = ['default', 'playing'];
            var states = stateList.join(' ');

            self.state.subscribe(function (state) {
                self.$ctrl.removeClass(states).addClass(state);
                params.onStateChange(self.$ctrl, state);
            });
        }
    })