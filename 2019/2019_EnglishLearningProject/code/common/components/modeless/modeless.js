define([
   'jquery',
   'knockout',
   'text!./modeless.html'
],
   function ($, ko, modelessTemplate, bootstrap) {
       function modelessViewModel(params) {
           var self = this;
           var $modeless = undefined;
           var stateEnum = Object.freeze({
               DEFAULT: 0,
               FADE_IN: 1,
               DELAY: 2,
               FADE_OUT: 3
           })
           var state = undefined;
           var fadeInTime = 300, delayTime = 1000, fadeOutTime = 300;

           function delayAndFadeOut() {
               state = stateEnum.DELAY;
               timer = setTimeout(function () {
                   state = stateEnum.FADE_OUT;
                   $modeless.fadeOut(fadeOutTime, function () {
                       state = stateEnum.DEFAULT;
                   });
               }, delayTime);
           };

           function showPrompt() {
               state = stateEnum.FADE_IN;
               var remainingTime = fadeInTime * (1 - parseFloat($modeless.css('opacity')));
               $modeless.fadeIn(remainingTime, function () {
                   state = stateEnum.DELAY;
                   delayAndFadeOut();
               });
           }

           function prompt(event, msg) {
               self.msg(msg || '');
               if (state == stateEnum.DEFAULT) {
                   showPrompt();
               } else if (state == stateEnum.FADE_IN) {
                   // nop
               } else if (state == stateEnum.DELAY) {
                   // skip last delay and fadeOut
                   clearTimeout(timer);
                   // add new delay and fadeOut
                   delayAndFadeOut();
               } else if (state == stateEnum.FADE_OUT) {
                   $modeless.stop();
                   showPrompt();
               }
           }

           function init() {
               self.msg = ko.observable('');
               $modeless = $('#modeless');
               state = stateEnum.DEFAULT;
               $modeless.on('prompt', prompt);
           }
           init();
       }
       return { viewModel: modelessViewModel, template: modelessTemplate };
   });
