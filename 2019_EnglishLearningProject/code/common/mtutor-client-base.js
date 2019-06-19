define([
    'jquery',
    'knockout',
    'komapping',
    'underscore',
    'fastclick',
    'wx',
    'helper',
    'mtutor-service',
    'transition',
    'audio',
    'preloader',
    'orientationchange'
],
    function ($, ko, komapping, _, fastClick, wx, helper, mTutorService, transition, audio, Preloader) {
        ko.mapping = komapping;
        return new AppBase(window.serviceUrl);
        function AppBase(serviceUrl) {



            var undefined;
            var self = this;
            window.app = self; // NOTE: exports app to global field.
            self.isWechatUrl = utils.getParameterByName('code') ? true : false;

            var currOrientation;

            self.service = new mTutorService($, serviceUrl);

            var logIn = function () {
                if (self.isWechatUrl) {
                    if (device.wechat()) {
                        // WeChat Log In
                        return weChatLogIn(utils.getParameterByName('code'));
                    } else {
                        // WeChat Url is opened in native browser.
                        helper.showLoading('请通过微信客户端访问公众号"千丰".', 'loading-drip');
                        throw '请通过微信客户端访问公众号"千丰".';
                    }
                } else {
                    if (window.supportTestAccount) {
                        var password = window.defaultPrompt("Please enter password: ", "");
                        return webLogIn('stressTest201512_32', password); // login as  student

                    }

                    helper.showLoading('请通过微信客户端访问公众号"千丰".', 'loading-drip');
                    throw '请通过微信客户端访问公众号"千丰".';
                }
            }.cachify();

            self.logIn = logIn;

            var weChatLogIn = function (code) {
                var tokens = utils.storage.getJSON('tokens') || {};
                if (_.contains(_.keys(tokens), code)) {
                    // If this code is used, retrieve the corresponding token.
                    var token = tokens[code];
                    self.service.oauthToken = token;
                    self.userId = token.wechat_openid;
                    return $.when(token);
                }
                return self.promiseWithMsg(
                    function () { return self.service.weChatLogIn(code); },
                    "正在登录...",
                    function (token) {
                        tokens[code] = token;
                        utils.storage.set('tokens', tokens);
                        self.service.oauthToken = token;
                        self.userId = token.wechat_openid; // TODO: naming it userId might be confusing.
                    },
                    function () {
                        helper.showLoading('微信登录失败! 请通过微信公众号"千丰"重新登录.', 'loading-drip');
                        throw '微信登录失败! 请通过微信公众号"千丰"重新登录.';
                    }
                );
            };

            var webLogIn = function (username, password) {
                var token = utils.storage.getJSON('token');
                if (token) {
                    self.service.oauthToken = token;
                    return $.when(self.service.oauthToken); // If token is recovered from cookie, skip logging in.
                }
                return self.promiseWithMsg(
                    function () { return self.service.webLogIn(username, password); },
                    "正在登录...",
                    function (token) {
                        self.service.oauthToken = token;
                        utils.storage.set("token", token);
                    },
                    function () {
                        helper.showLoading('账号登录失败(T_T) 请您退出重试.', 'loading-drip');
                        throw '账号登录失败(T_T) 请您退出重试.';
                    }
                );
            };

           

            // Helper Functions
            var isAbsoluteUrlReg = new RegExp('^(?:[a-z]+:)?//', 'i');
            self.isAbsoluteUrl = function (url) {
                return isAbsoluteUrlReg.test(url);
            }
            self.utils = self.service.utils;
            
            self.toAbsoluteUrl = function (url) {
                return self.isAbsoluteUrl(url) ? url : self.service.utils.combineUrl(window.projectServiceUrl, url);
            };

            // It's in case of future change of format of resource urls.
            self.toResourceUrl = function (url) {
                return url;
            };
            self.loadPromise = function (promiseFunction, msg, successHandler, failHandler) {
                return logIn().then(function () {
                    return self.promiseWithMsg(promiseFunction, msg, successHandler, failHandler);
                });
            };

            self.promiseWithMsg = function (promiseFunction, msg, successHandler, failHandler) {
                return self.service.utils.loadPromise(promiseFunction,
                    function () {
                        if (msg) {
                            helper.showLoading(msg);
                        }
                    },
                    function () {
                        if (msg) {
                            helper.hideLoading();
                        }
                    },
                    successHandler,
                    function (data) {
                        // Default failHandler.
                        if (data.statusText === 'timeout' || data.errcode === 408) {// Prevents custom handler on timeout.
                            helper.showLoading('操作已超时(T_T). 请检查网络连接, 退出稍后重试.', 'loading-drip');
                            throw 'timeout';
                        }
                        failHandler && failHandler(data);
                    });
            };

            self.goBackHome = function () {
                self.goBackToHash("^$");
            };

            self.goBackToHash = function (hashRegex) {
                var step = goStep(hashRegex);
                if (step) {
                    history.go(step);
                }
            };

            self.goToHash = function (hash) {
                window.location.hash = hash;
            };

            self.backOrToHash = function (hash) {
                var step = goStep(hash);
                if (step) {
                    history.go(step);
                } else {
                    self.goToHash(hash);
                }
            };
            self.findHash = function (hash) {
                var pattern = new RegExp(hash);
                var last = _.findLastIndex(self.hashes, function (item) {
                    return pattern.test(item);
                });
                if (last === -1) {
                    return false;
                } else {
                    return true;
                }
            }
            // Returns how many steps is needed to go to the hash.
            // undefined means the hash is not found in history.
            // A negative number N means history.go(N) can bring you back to the hash.
            function goStep(hashRegex) {
                var pattern = new RegExp(hashRegex);
                var last = _.findLastIndex(self.hashes, function (item) {
                    return pattern.test(item);
                });
                if (last === -1) {
                    return undefined;
                } else {
                    return last + 1 - self.hashes.length;
                }
            };

            self.changeHash = function (hash) {
                var hashes = self.hashes;
                var step = goStep('^' + hash + '$');
                if (step === undefined) {// Hash not found, go further.
                    self.isGoingBack = false;
                    hashes.push(hash);
                } else if (step === 0) {// Same hash as current.
                    // noop
                } else { // Negative step means it's a old hash, go back.
                    self.isGoingBack = true;
                    hashes.splice(hashes.length + step);
                }
                utils.storage.set('hashes', hashes);
            };

            //push in-page switch process into global history record
            self.pushHistory = function (state, callback, title, hash) {
                //replace the current state for browser to trace state
                history.replaceState({
                    page: state.page,
                    trans: state.trans,
                    params: state.params
                }, title, hash);
                //push new state to simulate a url/hash change
                history.pushState({}, title, hash);

                //add listener on popstate of browser in the condition of in-page switch
                window.addEventListener('popstate', function (event) {
                    var currState = event.state;
                    if (currState) {
                        callback(currState.params);
                        self.changePageWithinContainer(currState.page, currState.trans);
                    }
                }, false);
            }

            self.changePageWithinContainer = function (page, trans, callbacks) {
                var pageContainer = self.$currPageContainer.selector;
                var $from = self.$currPages[pageContainer];
                var $page = $(page);
                if ($page.is($from)) return;
                transition.transitBetween(
                    $from,
                    $page,
                    trans || self.defaultTransName,
                    false,
                    callbacks);
                self.$currPages[pageContainer] = $page;
                onPageChange();
            };

            function changePageContainer(pageContainer, trans, reverse, callbacks) {
                var $pageContainer = $(pageContainer);
                if ($pageContainer.is(self.$currPageContainer)) return;
                callbacks.beforeInCallback();
                transition.transitBetween(
                    self.$currPageContainer,
                    $pageContainer,
                    trans,
                    reverse,
                    callbacks);
                self.$currPageContainer = $pageContainer;
                onPageChange();
            }

            self.deactivePageWithinContainer = function (pageContainerSelector) {
                var $page = self.$currPages[pageContainerSelector];
                $page && $page.removeClass('active');
                self.$currPages[pageContainerSelector] = undefined;
                onPageChange();
            }

            function insertPageContainer(pageContainer, viewModel) {
                var $pageContainer = $('<' + pageContainer + ' class="page-container" params="query: query, page: page">');
                $('body').append($pageContainer);
                ko.applyBindings(viewModel, $pageContainer[0]);
            }

            self.updateQuery = function (query) {
                if (self[query.page].reload) {
                    $(query.page).remove();
                }
                self[query.page].query(query);
                if ($(query.page).length === 0) {
                    // For a page X: app[X].query, which can be accessed in X's view model as params.query, is an observable which only holds queries within X.
                    // Contrarily, app.query is an observable of global query, not specific for any page.
                    insertPageContainer(query.page, self[query.page]);
                }
                var lastPage = self.query() ? self.query().page : undefined;
                changePageContainer(query.page, self.defaultTransName, self.isGoingBack, {
                    outCallback: function () {
                        $(lastPage).trigger('pageContainerOut');
                    },
                    inCallback: function () {
                        updateLandscapeCurtain();
                        self.query(query);
                        $(query.page).trigger('pageContainerIn');
                    },
                    beforeInCallback: function () {
                        $(query.page).trigger('beforePageContainerIn');
                    }
                });
            };

            self.pageContainer = function (params) {
                this.registerPageContainerIn = function (pageContainerIn) {
                    if (!_.isFunction(pageContainerIn)) {
                        mAlert('pageContainerIn must be a function!');
                        throw 'pageContainerIn must be a function!';
                    }
                    $(params.page).on('pageContainerIn', pageContainerIn);
                }

                this.registerPageContainerOut = function (pageContainerOut) {
                    if (!_.isFunction(pageContainerOut)) {
                        mAlert('pageContainerOut must be a function!');
                        throw 'pageContainerOut must be a function!';
                    }
                    $(params.page).on('pageContainerOut', pageContainerOut);
                }

                this.registerBeforePageContainerIn = function (beforePageContainerIn) {
                    if (!_.isFunction(beforePageContainerIn)) {
                        mAlert('beforePageContainerIn must be a function!');
                        throw 'beforePageContainerIn must be a function!';
                    }
                    $(params.page).on('beforePageContainerIn', beforePageContainerIn);
                }
            }

            self.focusOnClick = function (d, e) {
                // To fix a bug caused by fastclick, which caused the focus event after clicking is dismissed,
                // I have to manually fire the focus event.
                // I've also tried `needsfocus` class, but it only makes the element with `needsfocus` focusable,
                // the inner element of `.needsfocus` is still not focusable. So clicking on the inner element
                // won't make the `.needsfocus` being focused.
                $(e.target).closest('.needsfocus').focus();
            }

            function onPageChange() {
                self.stopAudio();
                $('audio:not(.unstoppable)').stopAudio();
                $('.btn-play.playing').trigger('endPlay');
                $('.btn-play-mine.playing').trigger('endPlay');
                $('.btn-record.recording').trigger('abortRecord');
                $("#messagebox-modal").trigger("hide");
            }

            function updateLandscapeCurtain() {
                var containsInput = $('input[type="text"],  input[type="search"],  textarea', self.$currPageContainer).length > 0;
                $('.landscape-curtain').toggleClass('disabled', containsInput);
            }

            // This API is used when jumping between web apps in wechat.
            self.toAppUrl = function (url, useScopeUserInfo) {
                if (window.location.hostname === 'localhost') {
                    return app.utils.combineUrl('http://localhost:10065/', 'src', url);
                } else {
                    url = app.utils.combineUrl(window.webAppUrl, 'dist', url);
                    if (device.wechat()) {
                        return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='
                            + window.appId
                            + '&redirect_uri=' +
                            encodeURIComponent(url)
                            + '&response_type=code&scope=' + (useScopeUserInfo ? 'snsapi_userinfo' : 'snsapi_base') + '&state=1#wechat_redirect';
                    }else {
                        return url;
                    }
                }
            };

            // This API is used when creating share url on wechat.
            self.toRedirectAppUrl = function (url, useScopeUserInfo) {
                var appUrl = app.utils.combineUrl("dist", url);
                return app.utils.combineUrl(window.webAppUrl, "api/wechat/redirect?url=" + encodeURIComponent(appUrl) + "&scope=" + (useScopeUserInfo ? 'snsapi_userinfo' : 'snsapi_base'));
            };

            self.bindShareMsg = function (option) {
                option = $.extend({}, self.defaultShareOption, option);
                wx.onMenuShareTimeline(option);
                wx.onMenuShareAppMessage(option);
            };

            self.blockPlaying = function (event) {
                var thiz = event && event.target;
                $('.btn-play.playing').not(thiz).trigger('endPlay');
                $('.btn-play-mine.playing').not(thiz).trigger('endPlay');
            };

            self.hideQRcodePopup = function (selectContainerClass, selectContentClass) {
                $(selectContentClass).addClass('animated bounceOutUp')
                    .one(utils.animationStartEvent, function () {
                        $(selectContainerClass).delay(300).fadeOut();
                    })
                    .one(utils.animationEndEvent, function () {
                        $(this).removeClass('animated bounceOutUp').hide();
                    });
            };

            self.showQRcodePopup = function (selectContainerClass, selectContentClass) {
                $(selectContentClass).show()
                    .one(utils.animationStartEvent, function () {
                        $(selectContainerClass).fadeIn();
                    })
                    .addClass('animated bounceInDown')
                    .one(utils.animationEndEvent, function () {
                        $(this).removeClass('animated bounceInDown');
                    });
            };

            self.showQRCode = function () {
                self.showQRcodePopup('.qrcode-backdrop');
            };

            self.showTaskCompleteModalIfProper = function () {
                var today = utils.getTodayDate(),
                    key = appName + '.lastCheckIn';
                if (appObj.isTodayTaskComplete() && localStorage.getItem(key) != today) {
                    app.showTaskCompleteModal();
                    localStorage.setItem(key, today);
                }
            };

            self.bindTaskCompleteShareMsg = function () {
                return self.bindShareMsg({ title: "我在千丰上完成了今天的任务，你也来试试" });
            };

            

            self.languageName = ko.observable('zh-CN');
            self.changeLanguage = function () {
                self.languageName() === 'zh-CN' ? self.languageName('en-US') : self.languageName('zh-CN');
            };
            
            // The following items are used in me-page.
            // TODO: move to another file.
            
            window.scenario = {};
            scenario.appNameZh = '情景对话';
            scenario.listSubLessons = function (partId, options) {
                return self.loadPromise(
                    function () {
                        return self.service.scenario.listSubLessons(partId, options);
                    },
                    "正在加载单元内容...").done(function (lessonsData) {
                        console.log('Total data:', lessonsData);
                        
                    });
            };
            scenario.getScenarioLesson = function (lessonId) {
                return app.loadPromise(
                         function () {
                             return app.service.scenario.getLesson(lessonId);
                         },
                    "正在获取课程信息...").done(function (data) {
                        console.log('getScenarioLesson done');
                        console.log(data);
                    });
            };
            scenario.rateChoice = function (unitId, question, lang, answer, isPass) {
                return app.loadPromise(function () {
                    return app.service.scenario.rateChoice(unitId, question, lang, answer, isPass);
                }).done(function (result) {
                    console.log('Set Word mastered.', result);
                })
            };
            scenario.updateWordQuizProgress = function (unitId, progressDelta, lang, loadingMsg) {
                return app.loadPromise(function () {
                    return app.service.scenario.updateLessonProgress(unitId, progressDelta, lang);
                }, loadingMsg).done(function (result) {
                    console.log('Update progress success.', result);
                })
            };
            scenario.listPearsonSubLessons = function (partId, options) {
                return self.loadPromise(
                    function () {
                        return self.service.scenario.listPearsonSubLessons(partId, options);
                    },
                    "正在加载课程列表...").done(function (lessonsData) {
                        console.log('listSubLessons done.', lessonsData);
                    });
            };
            scenario.rateChat = function (lessonId, text, question, keywords, expectedAnswer, data, language, hideLoading, option) {
                return self.loadPromise(
                    function () {
                        return self.service.scenario.rateChat(lessonId, text, language, question, keywords, expectedAnswer,
                          data.isWeChatServerId ? "wechat-spx://" + data.serverId : data.binary,
                          data.isWeChatServerId ? "audio/x-wechat-speex" : "audio/amr",
                          16000, option).then(function (rateData) {
                              return $.when(rateData);
                          },
                        function (err) {
                            console.log('rateSpeech failed, faking 0 score result. ', err);
                            var rateData = { speechScore: 0, failed: true };
                            // Forward the localId for invalidating outdated rateSpeech.
                            rateData.localId = data.localId;
                            return $.when(rateData);
                        });
                    },
                    hideLoading ? undefined : "正在打分...").done(function (data) {
                        console.log("rateChat done", data);
                    }).fail(function (data) {
                        console.log(data);
                        mAlert("抱歉, 打分失败了, 请再试一次。");
                    });
            };
            window.speaking = {};
            speaking.listLessons = function (lessonId, options) {
                return self.loadPromise(function () {
                    return self.service.speaking.listSubLessons(lessonId, options)
                },
                    "正在加载课程...")
                    .done(function (lessons) {
                        console.log('listLessons done.', lessons);
                    });
            };
            speaking.getLesson = function (lessonId) {
                return app.loadPromise(
                         function () {
                             return app.service.speaking.getLesson(lessonId).then(function (lesson) {
                                 return lesson.lesson;
                             })
                         },
                    "正在获取课程信息...").done(function (data) {
                        console.log('getLesson done');
                        console.log(data);
                    });
            };
            speaking.listPearsonSubLessons = function (lesson, options) {
                return self.loadPromise(
                    function () {
                        return self.service.speaking.listPearsonSubLessons(lesson, options);
                    },
                    '正在加载课程信息')
                    .done(function (r) {
                        console.log("speak.listPearsonLeesons done. ", r);
                    });
            }
            speaking.rateSpeech = function (lessonId, text, data, hideLoading, modelOptions) {
                return self.loadPromise(
                    function () {
                        return self.service.speaking.rateSpeech(lessonId, text, "en-US",
                            data.isWeChatServerId ? "wechat-spx://" + data.serverId : data.binary,
                            data.isWeChatServerId ? "audio/x-wechat-speex" : "audio/amr",
                            modelOptions,
                            16000).then(function (rateData) {
                                // Forward the localId for invalidating outdated rateSpeech.
                                rateData.localId = data.localId;
                                return $.when(rateData);
                            }
                        );
                    },
                    hideLoading ? undefined : "正在打分...").done(function (data) {
                        console.log("rateSpeech done", data);
                    }).fail(function (data) {
                        console.log(data);
                        mAlert("抱歉, 打分失败了, 请再试一次。");
                    });
            }
            speaking.updateProgress = function (lessonId, progressDelta, lang) {
                return self.loadPromise(
                   function () {
                       return self.service.speaking.updateLessonProgress(lessonId, progressDelta, lang);
                   })
               .done(function (r) {
                   console.log("update progress done");
               });
            }

            self.getStudent = function () {
                return app.loadPromise(
                    function () {
                        return app.service.user.getStudent();
                    }, '正在获取学生信息...').done(function (data) {
                        console.log('get pearson student done: ');
                        console.log(data);
                    });
            }
            self.getSignInSummary = function () {
                return app.loadPromise(
                    function () {
                        return app.service.user.getSignInSummary();
                    }, '正在获取签到信息...').done(function (data) {
                        console.log('getSignInSummary done:');
                        console.log(data);
                    });
            }
            self.studentListCurrentInfo = function () {
                return app.loadPromise(
                         function () {
                             return app.service.user.studentListCurrentInfo();
                         }, '正在获取学生信息...').done(function (data) {
                             console.log('get studentListCurrentInfo done: ');
                             console.log(data);
                         });
            }

            self.signInDaily = function () {
                return app.loadPromise(
                    function () {
                        return app.service.user.signInDaily();
                    }).done(function (data) {
                        console.log('signInDaily done:');
                        console.log(data);
                    });
            }

            window.user = {};
            self.defaultAvatar = "/Resource/common/maleAvatar.png";
            user.wechatInfo = ko.observable({ name: '新注册的用户', avatar: self.defaultAvatar });
            user.hasSubscribed = ko.observable(false);
            self.showBannerForFollow = ko.observable(false);
            
            
            
            var configCommonPages = function () {
                window.routerConfig.routes = window.routerConfig.routes.concat(
                    { url: 'feedback', page: 'feedback' });

                ko.components.register('feedback', { require: 'feedback' });
                ko.components.register('picker', { require: 'picker' });
            }

            var getSignPackage = function () {
                var weChatApiUrl = window.location.origin + "/api/wechat/";
                var requestUrl = weChatApiUrl + "sign-package?url=" + encodeURIComponent(location.href.split('#')[0]);
                return $.ajax({
                    //url: requestUrl,
                    type: "GET",
                    dataType: "json",
                    timeout: 10000
                });
            };

            self.getUserWeChatInfo = function (userId) {
                return logIn().then(function () {
                    userId = userId || self.userId;
                    if (!userId) return $.when(user.wechatInfo());
                    var weChatApiUrl = self.service.devApiUrl;
                    var postUrl = weChatApiUrl + "getUserInfo";
                    var headers = {};
                    headers['__AntiXsrfToken'] = helper.readCookie('__AntiXsrfToken');
                    return $.ajax({
                        url: postUrl + "?openId=" + userId + "&lang=zh_CN",
                        type: "POST",
                        dataType: "json",
                        headers: headers,
                        timeout: 10000,
                        beforeSend: function (xhr, settings) {
                            xhr.setRequestHeader("Authorization", "Bearer " + self.service.oauthToken.access_token);
                        }
                    }).done(function (data) {
                        if (userId == self.userId) {
                            user.hasSubscribed(data.subscribe !== 0);
                            data.avatar = data.headimgurl || self.defaultAvatar;
                            data.name = data.nickname;
                            user.wechatInfo(data);
                        }
                    });
                });
            }.cachify();


            +function init() {
                configCommonPages();
                logIn();
                if (device.wechat()) {
                    self.getUserWeChatInfo();
                }
                self.$currPageContainer = null;
                // map from page container selector to the corresponding active page's jquery dom object
                self.$currPages = {};
                // The current query object. Updated by router.js.
                self.query = ko.observable();
                self.query.subscribe(function (oldValue) {
                    oldValue && (self.lastPage = oldValue.page);
                }, null, "beforeChange");
                self.hashes = utils.storage.getJSON('hashes') || [];
                self.isGoingBack = false;
                self.defaultTransName = 'fadeLeft';
                self.home = utils.getParameterByName('home');
                if (!_.isUndefined(self.home)) {
                    self.hashes.push("");// Insert home page into history.
                    window.location.hash = self.home;
                    // TODO: remove home query string from link.
                }

                // share curtain
                $('body').append('<share-curtain></share-curtain>');
                ko.components.register('share-curtain', { require: 'share-curtain' });
                ko.applyBindings({}, document.getElementsByTagName('share-curtain')[0]);
                self.showShareCurtain = function (thirdPartyCss) {
                    //debugger;
                    //replace original css with the thirdparty one if there is one
                    if (thirdPartyCss !== undefined && typeof thirdPartyCss !== 'object') {
                        $('.share-img').removeClass('share-curtain-img').addClass(thirdPartyCss);
                    };
                    $('.share-curtain').trigger('show');
                };

                // WeChat Share
                self.shareLink = self.toRedirectAppUrl(appName);
                var avatarImg = window.defaultShareAvatar ;
                self.avatar = self.utils.combineUrl(window.webAppUrl, avatarImg);
                self.defaultShareOption = {
                    title: window.defaultShareTitle || '你问我为什么最近英语水平突飞猛进? 因为我在用"千丰"! (捂嘴笑)',
                    link: self.shareLink,
                    imgUrl: self.avatar,
                    desc: window.defaultShareDesc || '',
                    success: function () {
                    }
                };

                // WeChat Config
                var weChatConfig = {
                    debug: false,
                    jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'playVoice',
                        'pauseVoice',
                        'stopVoice',
                        'onVoicePlayEnd',
                        'uploadVoice',
                        'downloadVoice',
                        'chooseImage',
                        'previewImage',
                        'uploadImage',
                        'downloadImage',
                        'translateVoice',
                        'getNetworkType',
                        'openLocation',
                        'getLocation',
                        'hideOptionMenu',
                        'showOptionMenu',
                        'hideMenuItems',
                        'showMenuItems',
                        'hideAllNonBaseMenuItem',
                        'showAllNonBaseMenuItem',
                        'closeWindow',
                        'scanQRCode',
                        'chooseWXPay',
                        'openProductSpecificView',
                        'addCard',
                        'chooseCard',
                        'openCard',
                        'chooseImage',
                        'uploadImage',
                        'downloadImage',
                        'getLocalImgData',
                        'miniProgram'
                    ]
                };
                getSignPackage().done(function (signPackage) {
                    wx.config($.extend(weChatConfig, signPackage));
                });
                wx.error(function (res) {
                    mAlert('wx error: ' + JSON.stringify(res) + '\nURL: ' + window.location.href);
                });

                // Record
                if (window.supportRecord) {
                    // A global queue for uploadVoice that makes sure only one
                    // voice is being uploaded every time; used in record-controller.
                    self.uploadQueue = new utils.AsyncFuncQueue();
                    // A global reference of the current playing localId that help make sure
                    // only one voice is being played every time; used in voice-controller.
                    self.playingLocalId = ko.observable();

                    // Enable recording when user enters web app.
                    if (utils.storage.getJSON('mtutorAllowRecord') != 1) {
                        wx.ready(function () {
                            audio.startRecord().fail(function (r) {
                                mAlert("你已拒绝授权录音.\n"
                                    + "错误信息: " + r.errMsg);
                            }).then(function () {
                                utils.storage.set('mtutorAllowRecord', 1);
                                // This delay is to make sure the stopRecord is successfully called.
                                window.setTimeout(function () {
                                    audio.stopRecord();
                                }, 1000);
                            });
                        });
                    }
                }

                // Others
                $.fn.extend({
                    stopAudio: function () {
                        $(this).trigger('pause');
                        try {
                            $(this).prop('currentTime', 0);
                        } catch (e) {
                            console.log(e.message);
                        }
                        return $(this);
                    }
                });

                if (!window.disableFastClick) {
                    fastClick.attach(document.body);
                }

                ko.observable.fn.increment = function (value) {
                    this(this() + (value || 1));
                };

                ko.observable.fn.decrement = function (value) {
                    this(this() - (value || 1));
                };

                ko.subscribable.fn.callAndSubscribe = function (callback) {
                    this.subscribe(callback);
                    callback();
                }

                // bubbled-up event will be catched by body and trigger blockPlaying.
                $('body').on('startPlay', self.blockPlaying)
                    .on('startRecord touchstart mousedown', '.btn-record', self.blockPlaying);

                // Orientation Change
                $(window).on('orientationchange', function (event) {
                    currOrientation = event.orientation;
                    updateLandscapeCurtain();
                });
                $(window).trigger('orientationchange');

                $.fn.getHiddenDimensions = function () {
                    var $item = this,
                        props = { visibility: 'hidden', display: 'block' };
                    $hiddenParents = $item.parents().andSelf().not(':visible');
                    var dim = { width: 0, scrollWidth: 0 };
                    var oldProps = [];
                    $hiddenParents.each(function () {
                        var old = {};
                        for (var name in props) {
                            old[name] = this.style[name];
                            this.style[name] = props[name];
                        }
                        oldProps.push(old);
                    });

                    dim.width = $item.width();
                    dim.scrollWidth = $item[0].scrollWidth;

                    $hiddenParents.each(function (i) {
                        var old = oldProps[i];
                        for (var name in props) {
                            this.style[name] = old[name];
                        }
                    });

                    return dim;
                }

                $.fn.wrapText = function (options) {
                    return this.each(function () {
                        var $this = $(this).css('white-space', 'nowrap'),
                            dim = $this.getHiddenDimensions(),
                            ratio = dim.width / dim.scrollWidth,
                            defaultFontSize = parseInt($this.css('font-size'));
                        var width = $this.width();
                        var fontSize = Math.min(defaultFontSize, defaultFontSize * ratio);
                        $this.css('font-size', fontSize);
                    });
                };

                ko.bindingHandlers.wrapText = {
                    init: function (elem) {
                        $(elem).wrapText();
                    }
                };

                ko.bindingHandlers.fadeVisible = {
                    init: function (element, valueAccessor) {
                        var shouldDisplay = ko.unwrap(valueAccessor());
                        $(element).toggle(shouldDisplay);
                    },
                    update: function (element, valueAccessor, allBindings) {
                        var shouldDisplay = ko.unwrap(valueAccessor());
                        var fadeInDuration = allBindings.get('fadeInDuration');
                        var fadeOutDuration = allBindings.get('fadeOutDuration');
                        if (_.isUndefined(fadeInDuration)) {
                            fadeInDuration = 300
                        }
                        if (_.isUndefined(fadeOutDuration)) {
                            fadeOutDuration = 300
                        }
                        shouldDisplay ? $(element).stop().fadeIn(fadeInDuration) : $(element).stop().fadeOut(fadeOutDuration);
                    }
                };

                ko.bindingHandlers.visibility = {
                    update: function (element, valueAccessor) {
                        var visible = ko.unwrap(valueAccessor());
                        $(element).css('visibility', visible ? 'visible' : 'hidden');
                    }
                };

                ko.bindingHandlers.slideVisible = {
                    update: function (element, val, bindings) {
                        var unwrapped = ko.unwrap(val());
                        var duration = bindings.get('slideDuration') || 150;
                        if (unwrapped)
                            $(element).slideDown(duration);
                        else
                            $(element).slideUp(duration);
                    }
                };

                $('body').addClass(appName);

                $.fn.extend({
                    animateOne: function (anim, callback) {
                        var self = this;
                        anim = 'animated ' + anim,
                            called = false;
                        self.addClass(anim);
                        var duration = self.css('animation-duration');
                        duration = (duration.indexOf("ms") > -1) ? parseFloat(duration) : parseFloat(duration) * 1000;
                        self.one(utils.animationEndEvent, function () {
                            called = true;
                            self.removeClass(anim);
                            callback && callback.call(this);
                        });
                        setTimeout(function () {
                            self.removeClass(anim);
                            if (!called && callback) {
                                callback.call(this);
                            }
                        }, duration);
                    }
                });

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
                self.preloader = new Preloader(getAudioContext());

                self.recordClassMapping = function (state, s) {
                    switch (state) {
                        case s.DEFAULT: return 'icon icon-record default';
                        case s.STARTING: return 'icon icon-record-loading icon-spin';
                        case s.RECORDING: return 'icon icon-stop recording';
                        case s.STOP_TOO_EARLY: return 'icon icon-record disable';
                        case s.STOPPING:
                        case s.SCORING: return 'icon icon-record-loading icon-spin';
                    }
                };

                
                // compute game point position
                
                self.leftParen = '[';
                self.rightParen = ']';

                // Disable context menu
                window.oncontextmenu = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                };

                self.hidePopup = function (selectContentClass) {
                    $(selectContentClass).addClass('animated bounceOutUp')
                        .one(utils.animationStartEvent, function () {
                            $('.common-backdrop').last().delay(300).fadeOut();
                        })
                        .one(utils.animationEndEvent, function () {
                            $(this).removeClass('animated bounceOutUp').hide();
                            $('.common-backdrop').last().remove();
                        });
                };


                self.showPopup = function (selectContentClass) {
                    $(selectContentClass).before("<div class='common-backdrop' style='display:none'></div>");
                    $(selectContentClass).show()
                        .one(utils.animationStartEvent, function () {
                            $('.common-backdrop').fadeIn();
                        })
                        .addClass('animated bounceInDown')
                        .one(utils.animationEndEvent, function () {
                            $(this).removeClass('animated bounceInDown');
                        });
                };

                // audio control
                // preloadAudios(audioMapping)
                //      audioMapping: { key: { url, duration } }
                // playAudio(key, [{ onStartPlay, onStopPlay }])
                // stopAudio()
                self.audioElementTag = null;
                self.audioSource = null;
                self.isAudioContextSupported = false;
                self.isAudioPlaying = ko.observable(false);
                // audioDict:
                // { key: { duration, data, buffer(if audioContext is supported) }
                self.dict = {};
                self.cutDuration = false;


                if (window.AudioContext && !device.ios()) {
                    self.isAudioContextSupported = true;
                }

                function fetchAudio(audioUrl) {
                    var deferred = $.Deferred();

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', audioUrl, true);
                    if (self.isAudioContextSupported) {
                        xhr.responseType = 'arraybuffer';
                    } else {
                        xhr.responseType = 'blob';
                    }
                    xhr.onload = function (e) {
                        if (xhr.status === 200) {
                            console.log('load audio resolve');
                            if (self.isAudioContextSupported) {
                                // Download the audio as Array Buffer
                                deferred.resolve(xhr.response);
                            } else {
                                if (device.ios()) {
                                    // Download the audio as blob and return the audioUrl as object Id.
                                    // E.g.: blob:http://localhost:52560/8bda0f...
                                    var audioId = (window.webkitURL ? window.webkitURL : window.URL).createObjectURL(xhr.response);
                                    deferred.resolve(audioId);
                                } else {
                                    // Download the audio as base64
                                    // E.g.: data:audio/mp3;base64,SUQzBAAAAA....
                                    var blob = new Blob([xhr.response], { type: "audio/mp3" });
                                    var reader = new FileReader();
                                    reader.onload = function (event) {
                                        deferred.resolve(event.target.result);
                                    };
                                    reader.readAsDataURL(blob);
                                }

                            }
                        } else {
                            console.log('load audio reject: ' + e);
                            deferred.reject(Error(xhr.statusText));
                        }
                    }
                    xhr.onerror = function (e) {
                        console.log('load audio error: ' + e);
                        deferred.reject(Error("Error fetching audio data."));
                    };

                    xhr.send();

                    return deferred;
                }

                self.preloadAudios = function (audioMapping) {
                    var preloadAudiosDeferred = [];
                    var keys = _.keys(audioMapping);

                    for (var i = 0; i < keys.length; i++) {
                        preloadAudiosDeferred.push(fetchAudio(audioMapping[keys[i]].url));
                    }
                    return $.when.apply($, preloadAudiosDeferred).then(function () {
                        var loadResult = arguments;
                        for (var j = 0; j < keys.length; j++) {
                            var key = keys[j];
                            var clip = {};
                            clip.duration = audioMapping[key].duration;
                            if (self.isAudioContextSupported) {
                                clip.data = loadResult[j];
                                clip.buffer = null;
                            } else {
                                clip.data = '#textDictAudio' + j;
                                if ($(clip.data)[0]) {
                                    $(clip.data).remove();
                                }
                                var element = '<audio preload="auto" id=textDictAudio' + j + '><source src=' + loadResult[j] + ' type="audio/mpeg"></audio>';
                                $('body').append(element);
                            }
                            self.dict[key] = clip;
                        }
                    });
                };

                self.playAudio = function (key, callbacks, currPlayMilliSecond) {
                    //the audio will be stopped before the next audio can be played
                    self.stopAudio();
                    var clip = self.dict[key];
                    callbacks = $.extend({ onStartPlay: $.noop, onStopPlay: $.noop }, callbacks);
                    if (self.isAudioContextSupported) {
                        self.audioSource = scenario.audioContext.createBufferSource();
                        var buffer;
                        if (!clip.buffer) {
                            scenario.audioContext.decodeAudioData(clip.data, function (buffer) {
                                clip.buffer = buffer;
                                self.audioSource.buffer = buffer;
                            });
                        } else {
                            self.audioSource.buffer = clip.buffer;
                        }
                        self.audioSource.connect(scenario.audioContext.destination);

                        if (currPlayMilliSecond != undefined) {
                            self.audioSource.start(0, currPlayMilliSecond / 1000);
                        } else {
                            self.audioSource.start(0, 0);
                        }
                    } else {
                        var audioElementTag = $(clip.data)[0];
                        if (currPlayMilliSecond != undefined) {
                            audioElementTag.currentTime = currPlayMilliSecond / 1000;
                        } else {
                            audioElementTag.currentTime = 0;
                        }
                        audioElementTag.play();
                        self.audioElementTag = audioElementTag;
                    }
                    self.isAudioPlaying(true);
                    callbacks.onStartPlay();
                    var duration = clip.duration;
                    if (app.cutDuration) {
                        duration = 100;
                    }
                    setTimeout(function () {
                        self.isAudioPlaying(false);
                        callbacks.onStopPlay();
                    }, duration);
                };

                self.stopAudio = function () {
                    //the audio will be stopped before the next audio can be played
                    if (!self.audioSource && !self.audioElementTag) return;
                    if (self.isAudioContextSupported) {
                        self.audioSource.stop();
                    } else {
                        self.audioElementTag.pause();
                    }
                    self.isAudioPlaying(false);
                };
            }();
        }
    });