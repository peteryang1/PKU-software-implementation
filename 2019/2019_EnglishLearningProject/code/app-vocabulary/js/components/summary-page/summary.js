define([
   'jquery',
   'knockout',
   'komapping',
   'text!./summary.html',
   'chart'
],
   function ($, ko, komapping, template, Chart) {
       ko.mapping = komapping;
       return { viewModel: viewModel, template: template };

       function viewModel(params) {
           var self = this;
           app.pageContainer.call(self, params);

           self.summary = ko.observable();
           self.lessonId = ko.pureComputed(function () {
               return params.query()['lessonId'];
           })
           self.wordlistId = ko.pureComputed(function () {
               return "#wordlist/" + self.lessonId();
           })

           self.vocabStarted = ko.pureComputed(function () {
               if (!self.summary()) return false;
               return self.summary().learnedCount() > 0;
           });

           self.vocabFinished = ko.pureComputed(function () {
               if (!self.summary()) return false;
               return self.summary().learnedCount() >= self.summary().unitCount();
           });

           self.vocabularyBookId = ko.observable()

           self.renderChart = function () {
               var strokeColor = '#58b764';
               var emptyColor = "#e9f7ed";
               var data = {
                   datasets: [
                       {
                           data: [self.summary().learnedCount(), self.summary().unitCount() - self.summary().learnedCount()],
                           backgroundColor: [strokeColor, emptyColor],
                           hoverBackgroundColor: [strokeColor, emptyColor],
                           borderWidth: [0, 0]
                       }
                   ]
               };

               var options = {
                   cutoutPercentage: 80,
                   responsive: true,
                   maintainAspectRatio: false,//prevent overflow of chart
                   tooltips: {
                       enabled: false
                   }
               };
               if (self.todayChart) {
                   self.todayChart.destroy();
               }
               var ctx = document.getElementById("home-today").getContext("2d");
               self.todayChart = new Chart(ctx, {
                   type: 'doughnut',
                   data: data,
                   options: options
               });
           };
           function getLearnedCount(wordslist) {
               var sum = 0;
               wordslist.forEach(function (item) {
                   if (item.lastScore) {
                       sum++;
                   }
               })
               return sum;
           };
           function getWordsQueue(quiz, learningItem) {
               var que = [];
               quiz.forEach(function (item, index) {
                   if (learningItem[index].text.indexOf('-') != -1) {
                       learningItem[index].text = learningItem[index].text.replace(/[a-zA-Z0-1]*-[a-zA-Z0-1]*/g, function ($1) {
                           return "<span class='vocabHyphen'>" + $1 + "</span>"
                       })
                   }
                   que.push({
                       word: learningItem[index],
                       state: 'init',
                       question: item.body.text,
                       answer: item.answer
                   })
               })
               return que;
           }

           function init() {
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
                      "id":"01",
                      "type":4,
                      "pid":"01",
                      "name":"Chapter One",
                      "nativeName":"Hello!"
                   }
                }

               var name = data.lesson.name.split(":")
               var obj = {
                   learnedCount: getLearnedCount(data.lesson.quizzes),
                   headline: name[0],
                   name: name[1],
                   unitCount: data.lesson.learningItem.length
               }
               self.summary(ko.mapping.fromJS(obj))
               self.renderChart()

               var learningItem = JSON.parse(JSON.stringify(data.lesson.learningItem));
               var que = getWordsQueue(data.lesson.quizzes, learningItem);
               window.sessionStorage.setItem('vocablist', JSON.stringify({
                   quizzes:data.lesson.quizzes,
                   que: que,
                   learnedCount: obj.learnedCount,
                   unitCount: obj.unitCount,
                   unitId: self.lessonId()
               }));
               self.vocabularyBookId(window.sessionStorage.getItem('vocabularyBookId'))
           }

           self.registerPageContainerIn(init);

           self.registerPageContainerOut(function () {
           })
       }
   });
