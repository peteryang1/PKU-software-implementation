define([
   'jquery',
   'knockout',
   'komapping',
   'hammer',
   'text!./wordlist.html',
],
   function ($, ko, komapping, Hammer,template, Chart) {
       ko.mapping = komapping;
       return { viewModel: viewModel, template: template };

       function viewModel(params) {
           var self = this;
           app.pageContainer.call(self, params);

           self.audioUrl = ko.observable();
           self.units = ko.observableArray([])
           self.units2 = ko.observableArray([])

           self.lessonId = ko.pureComputed(function () {
               return params.query()['lessonId'];
           })

           self.showUnits = function () {
               return self.units().length > 0
           }
           self.showUnits2 = function () {
               return self.units2().length > 0
           }
           self.changeDesc = function (index, ele,data) {
               var $ele = $(ele);
               if ($ele.hasClass('showdef')) {
                   $ele.removeClass('showdef');
                   //var desc = self.units()[index].desc;
                   //self.units()[index].showDesc(desc);
                   data.showDesc(data.desc)
               } else {
                   $ele.addClass('showdef');
                   //self.units()[index].showDesc('释义');
                   data.showDesc('释义')
               }
           }

           ko.bindingHandlers.swipeToChange = {
               init: function (elem) {
                   var hammer = new Hammer(elem).on('panstart panmove panend pancancel', handleEvent.bind(elem));
                   $(elem).on('touchstart', handleEvent);
                   hammer.get('pan').set({ threshold: 0 });
               }
           };
           const panWidth = 80;// 80px
           var panDirection = null;
           function handleEvent(e) {
               var $this = $(this);
               switch (e.type) {
                   case 'touchstart':
                       if (-$this.offset().left >= panWidth) {
                           releasePan($this);
                           // Prevent toggling translation when releasing item.
                           e.stopPropagation();
                           e.preventDefault();
                       }
                       break;
                   case 'panstart':
                   case 'panmove':
                       if (!panDirection) {
                           panDirection = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? 'h' : 'v';
                       }
                       if (panDirection === 'h') {
                           // panning horizontally
                           var x = Math.min(e.deltaX, 0)
                           if (-x > panWidth) {
                               // once exceeding panWidth, slow down.
                               x = (x + panWidth) / 5 - panWidth;
                           }
                           $this.css('transform', 'translateX(' + x + 'px)');
                           // When panning horizontally, disable vertical scrolling.
                           e.preventDefault();
                       }
                       break;
                   case 'panend':
                   case 'pancancel':
                       releasePan($this);
                       panDirection = null;
                       break;
               }
           }
           function releasePan($this) {
               var left = $this.offset().left;
               if (-left > panWidth) {
                   // Stick to panWidth.
                   transitElem($this, -panWidth);
               } else if (left != 0) {
                   // Back to normal position.
                   transitElem($this, 0);
               }
           }
           function transitElem($elem, x) {
               $elem.css({
                   'transform': 'translateX(' + x + 'px)',
                   '-webkit-transform': 'translateX(' + x + 'px)',
                   'transition': 'transform .3s',
                   '-webkit-transition': 'transform .3s'
               }).off(utils.transitionEndEvent)
               .one(utils.transitionEndEvent, function () {
                   $elem.css({
                       'transition': '',
                       '-webkit-transition': ''
                   });
               });
           }
           self.changeState = function (type, question, lang, answer, unitCount,ele, data) {
               $(ele).parent().fadeOut(300, function () { $(this).remove(); });
               if (type) {  //mastered -> learning
                   var wrongAns = (answer + 1) % 4;
                   scenario.rateChoice(self.lessonId(), question, lang, wrongAns, !type).then(function () {
                       scenario.updateWordQuizProgress(self.lessonId(), -1 / unitCount * 100, lang).then(function () {
                           init()
                       })
                    })
               } else {   // learning -> mastered
                   scenario.rateChoice(self.lessonId(), question, lang, answer, !type).then(function () {
                       scenario.updateWordQuizProgress(self.lessonId(), 1 / unitCount * 100, lang).then(function () {
                           init()
                       })
                   })
               }
           }
           function init() {
               self.units([])
               self.units2([])
               var data = {   
                   "lesson":{  
                      "quizzes":[  
                         {  
                            "highScore":100,
                            "lastScore":100,
                            "lastTime":"2019-06-12T06:21:24.2840729Z",
                            "isPracticed":true,
                            "userAudioUrl":"",
                            "userApiResultUrl":"",
                            "type":1,
                            "body":{  
                               "figureUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/image/",
                               "figureSourceUri":"",
                               "text":"hello",
                               "displaytext":"hello",
                               "ipa":"",
                               "audioText":"",
                               "audioUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/audio/",
                               "tokens":[  

                               ]
                            },
                            "options":[  
                               {  
                                  "figureUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/image/",
                                  "figureSourceUri":"",
                                  "text":"认识",
                                  "displaytext":"",
                                  "ipa":"",
                                  "audioText":"",
                                  "audioUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/audio/",
                                  "tokens":[  

                                  ]
                               },
                               {  
                                  "figureUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/image/",
                                  "figureSourceUri":"",
                                  "text":"不认识",
                                  "displaytext":"",
                                  "ipa":"",
                                  "audioText":"",
                                  "audioUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/audio/",
                                  "tokens":[  

                                  ]
                               }
                            ],
                            "answer":0,
                            "answerExpl":"",
                            "tags":[  

                            ]
                         }
                      ],
                      "learningItem":[  
                         {  
                            "text":"hello",
                            "nativeText":"你好",
                            "image":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/image/3A-1-1-words-01.png",
                            "desc":"Hello!I'm Kitty.#你好！我是凯蒂。",
                            "lang":"en-US",
                            "accent":"en-US",
                            "type":"audio/mp3",
                            "audioUrl":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/audio/3A-1-1-words-01.mp3",
                            "videoUrl":"",
                            "audioDuration":"00:00:01.2010000",
                            "ipa":"",
                            "itemType":0,
                            "difficultyLevel":0
                         }
                      ],
                      "id":"02",
                      "type":4,
                      "pid":"02",
                      "name":"Chapter One",
                      "nativeName":"Hello!",
                      "backgroundImage":"https://mtutordev.blob.core.chinacloudapi.cn/system-audio/scenario/en-US/en-US/image/"
                   }
                }
               var unitCount = data.lesson.learningItem.length;
               var unitsInfo = [];
               var units2Info = [];
               data.lesson.learningItem.forEach(function (item, index) {
                   if (!data.lesson.quizzes[index].lastScore) {
                       unitsInfo.push({
                           text: item.text,
                           question: data.lesson.quizzes[index].body.text,
                           audioUrl: item.audioUrl,
                           desc: item.nativeText,
                           showDesc: ko.observable('释义'),
                           unitCount: unitCount,
                           type: false,
                           lang: item.lang,
                           answer: data.lesson.quizzes[index].answer
                       })
                   } else {
                       units2Info.push({
                           text: item.text,
                           question: data.lesson.quizzes[index].body.text,
                           audioUrl: item.audioUrl,
                           desc: item.nativeText,
                           showDesc: ko.observable('释义'),
                           unitCount: unitCount,
                           type: true,
                           lang: item.lang,
                           answer: data.lesson.quizzes[index].answer
                       })
                   }
                   
               })
               self.units(unitsInfo)
               self.units2(units2Info)
           }
           self.registerPageContainerIn(init);

           self.registerPageContainerOut(function () {
           })
       }
   });
