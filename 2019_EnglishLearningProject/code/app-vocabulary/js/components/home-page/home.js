define([
   'jquery',
   'knockout',
   'komapping',
   'text!./home.html'
],
   function ($, ko, komapping, template) {
       ko.mapping = komapping;
       return { viewModel: viewModel, template: template };

       function viewModel(params) {
           var self = this;
           app.pageContainer.call(self, params);

           self.units = ko.observableArray([]);
           self.collapseCss = function (index, ele) {
               //bind data-target
               $(ele).attr('data-target', '.chapter-' + index + ' .chapter-collapse');
               if (index == 0) {
                   return 'chapter-' + index;
               } else {
                   return 'chapter-' + index + ' item-margin';
               }
           };
           self.bookId = ko.pureComputed(function () {
               return params.query()['bookId'];
           });


           self.stopPro = function () {
               event.stopPropagation();
           };

           self.unitStar = function (index, num, type) {
               var grayColor = "#a3a3a3"
               var yellowColor = "#FFFF00"
               var score = type ? self.units()[index].quizProgress : self.units()[index].wordProgress;
               if (score == -1) return grayColor;
               return (score / 100) >= num ? yellowColor : grayColor;
           };

           function init() {
               window.sessionStorage.setItem('vocabularyBookId', self.bookId());
               self.units([]);
               var unitsData = {   
                  "rootLesson":{  
                     "subLessons":[  
                        {  
                           "lessonInfo":{  
                              "score":-1,
                              "progress":-1,
                              "lastUpdate":"0001-01-01T00:00:00",
                              "triedCount":-1,
                              "finishCount":-1,
                              "lastFinishUser":[  

                              ],
                              "isFinished":false,
                              "userFinishCount":0,
                              "correctCount":-1,
                              "wrongCount":-1,
                              "learnRate":0.0,
                              "id":"01",
                              "type":0,
                              "pid":"02",
                              "name":"Chapter One",
                              "nativeName":"Hello!",
                              "difficultyLevel":0,
                              "version":""
                           },
                           "subLessons":[  
                              {  
                                 "lessonInfo":{  
                                    "score":-1,
                                    "progress":100,
                                    "lastUpdate":"2019-06-19T07:27:23.4908787",
                                    "triedCount":226,
                                    "finishCount":-1,
                                    "lastFinishUser":[  

                                    ],
                                    "isFinished":false,
                                    "userFinishCount":7,
                                    "correctCount":7,
                                    "wrongCount":0,
                                    "learnRate":0.0,
                                    "id":"L1-1-1-1-1-s-q",
                                    "type":4,
                                    "pid":"L1-1-1-1-s-q",
                                    "name":"Chapter One",
                                    "nativeName":"Hello!",
                                    "lessonIcons":[  

                                    ],
                                    "tags":[  

                                    ],
                                    "difficultyLevel":0,
                                    "version":""
                                 },
                                 "subLessons":[  

                                 ]
                              }
                           ]
                        }
                     ]
                  }
                }
                   
                var units = unitsData.rootLesson.subLessons;
                units.forEach(function (item, index) {
                   var unitItem = item.lessonInfo;
                   var wordItem = item.subLessons[0].lessonInfo;
                   self.units.push({
                       index : index +1,
                       id : unitItem.id,
                       name : unitItem.name,
                       profile : unitItem.nativeName,
                       wordId: wordItem.id, // 背单词课程id
                       wordProgress: wordItem.progress // 已背单词占比
                   })
                })


           }

           self.registerPageContainerIn(init);

           self.registerPageContainerOut(function () {

           })
       }
   });
