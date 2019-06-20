define([
   'jquery',
   'knockout',
   'text!./messagebox.html',
   'bootstrap'
],
   function ($, ko, messageboxTemplate, bootstrap) {
       function messageboxViewModel(params) {
           var self = this;
           self.chooseYes = function () {
               self.option(true);
               hide();
           }
           self.chooseNo = function () {
               self.option(false);
               hide();
           }

           function show(event, msg, noCallback, yesCallback, noText, yesText) {
               self.msg(msg || '');
               self.type(event.data.type);
               self.yesCallback(yesCallback || $.noop);
               self.noCallback(noCallback || $.noop);
               self.yesText(yesText ? yesText : '确定');
               self.noText(noText ? noText : '取消');
               $('#messagebox-modal').one('hidden.bs.modal', function () {
                   var option = self.option();
                   self.option(false); // reset to the default value -- false.
                   (option ? self.yesCallback() : self.noCallback())();
               }).modal('show');
           }

           function hide(event) {
               $('#messagebox-modal').modal('hide');
           }

           function init() {
               self.msg = ko.observable('');
               self.type = ko.observable();
               self.yesCallback = ko.observable();
               self.noCallback = ko.observable(); // For alert, the callback is noCallback.
               self.yesText = ko.observable('确认');
               self.noText = ko.observable('取消');
               self.option = ko.observable(false); // true means yes, false no.
               $('#messagebox-modal')
                   .on('showConfirm', { type: 'confirm' }, show)
                   .on('showAlert', { type: 'alert' }, show)
                   .on('hide', hide);
           }
           init();
       }
       return { viewModel: messageboxViewModel, template: messageboxTemplate };
   });
