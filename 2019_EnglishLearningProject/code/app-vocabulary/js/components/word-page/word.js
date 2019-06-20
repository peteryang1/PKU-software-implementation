define([
   'jquery',
   'knockout',
   'komapping',
   'text!./word.html',
],
   function ($, ko, komapping, template, Chart) {
       ko.mapping = komapping;
       return { viewModel: viewModel, template: template };

       function viewModel(params) {
           var self = this;
           app.pageContainer.call(self, params);
           self.onPronReady = function (ele) {
               $(ele).trigger('click');
           }

           self.learnedCount = ko.observable()

           self.audioUrl = ko.observable();

           self.unitCount = ko.observable()
           self.currentWord = ko.observable()
           self.state = ko.observable('');
           self.sentence = ko.observable();
           self.id = ko.observable();
           self.detailsSentence = ko.observable('');

           self.footerTemplate = ko.pureComputed(function () {
               switch (self.state()) {
                   case 'init':
                       return 'footer-init';
                   case 'unfamiliar':
                       return 'footer-unfamiliar';
                   case 'details':
                       return 'footer-details';
                   default:
                       return 'null';
               }
           })
           // click 不认识
           self.chooseUnfamiliar = function () {
               self.state('unfamiliar')
               self.sentence(self.currentWord().word.desc().split('#')[0]);
           };

           //  click 认识
           self.chooseFamiliar = function () {
               self.state('details')
               self.learnedCount(self.learnedCount() + 1);
               scenario.rateChoice(self.id(), self.currentWord().question(),
               self.currentWord().word.lang(), self.currentWord().answer(), true, self.unitCount()).then(function () {
                   scenario.updateWordQuizProgress(self.id(), 1 / self.unitCount() * 100, self.currentWord().word.lang());
               })
           }
           
           self.chooseNotRemembered = function () {
               self.state('details');
               self.que.push(ko.mapping.toJS(self.que[0]));
           }
           //  next
           self.nextWord = function () {
               self.state('init');
               self.que.shift();
               if (!self.que.length) {
                   window.location.href = "#summary/" + self.id();
               } else {
                   self.currentWord(ko.mapping.fromJS(self.que[0]));
               }
               var sArr = self.currentWord().word.desc().split('#');
               self.detailsSentence(sArr[0] + '\n' + (sArr[1] || ''));
               self.audioUrl(self.currentWord().word.audioUrl())
           }


           function init() {
               self.state('init');
               var vocablist = JSON.parse(window.sessionStorage.getItem('vocablist'))
               self.learnedCount(vocablist.learnedCount);
               self.unitCount(vocablist.unitCount);
               self.que = vocablist.que;
               self.id(vocablist.unitId)


               self.currentWord(ko.mapping.fromJS(self.que[0]));
               self.audioUrl(self.currentWord().word.audioUrl())
               var sArr = self.currentWord().word.desc().split('#');
               self.detailsSentence(sArr[0] + '\n' + (sArr[1] || ''));
           }
           self.registerPageContainerIn(init);

           self.registerPageContainerOut(function () {
           })
       }
   });
