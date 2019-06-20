
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        window.mTutor = factory();
    }
}(function () {
    
    function mTutor($, serviceUrl, commonAjaxSetting) {
        var self = this;
        if (commonAjaxSetting && commonAjaxSetting.timeout) {
            self.timeout = commonAjaxSetting.timeout;
        } else {
            self.timeout = 30000; // 30 seconds
        }
        self.pingFreq = 2000;
        self.utils = {
            loadPromise: function (promiseFunction, beforeHandler, afterHandler, successHandler, failHandler) {
                beforeHandler();
                var promise = promiseFunction();
                promise.always(function () {
                    afterHandler();
                });
                if (successHandler) {
                    promise.done(function (data) { successHandler(data); });
                };
                if (failHandler) {
                    promise.fail(function (data) { failHandler(data); });
                }
                return promise;
            },
            combineUrl: function () {
                var undefined;
                var url = [];
                for (var i = 0, argumentCount = arguments.length; i < argumentCount; ++i) {
                    if (arguments[i] === undefined) continue;
                    var parts = arguments[i].split("/");
                    for (var j = 0, l = parts.length; j < l; ++j) {
                        if (parts[j] === "..") {
                            if (url.length > 0) {
                                url.pop();
                            } else {
                                url.push((parts[j]));
                            }
                        } else if (parts[j] === ".") {
                            continue;
                        } else {
                            url.push(parts[j]);
                        }
                    }
                }

                var combined = url.filter(function (s) { return s.length !== 0 }).join("/")
                    .replace(":/", "://");
                if (arguments && arguments.length > 0 && arguments[0][0] == '/') {
                    combined = "/" + combined;
                }
                return combined;
            },
            readCookie: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            },
            param: function (obj) {
                var str1 = [];
                var str2 = [];
                for (var p in obj)
                    if (obj.hasOwnProperty(p)) {
                        if (obj[p] === undefined || obj[p] === null) {
                            str1.push(encodeURIComponent(p)); // different behavior with $.param.
                        } else {
                            str2.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                return str1.concat(str2).join("&"); // generate a better url.
            },
            delay: function (ms) {
                var deferred = $.Deferred();

                setTimeout(function () {
                    deferred.resolve();
                },
                    ms);

                return deferred.promise();
            }
        }

        var JobErrorCodes = Object.freeze(
            {
                JOBNOTCOMPLETED: 30000,
            });

        self.devApiUrl = "http://app-dev.mtutor.engkoo.com/proxy/"
        self.oauthApiUrl = self.utils.combineUrl(self.devApiUrl, "oauth/login");
        self.languageServiceUrl = self.utils.combineUrl(self.devApiUrl, "services/");
        self.oauthToken = undefined;

        var serviceVersion = "1.16.408.0";
        var scenarioContentProviderId = "8A369EFE-F68B-4615-825C-7D2B07B44934";
        var speakingContentProviderId = "F0380421-86E5-43AE-91B2-F29062ADB024";
        var pearsonProviderId = "000D2808-5FB2-411F-9BF6-FDC6949DCFBC";

        self.authorizedRawAjax = function (ajaxSettings) {
            if (!self.oauthToken || !self.oauthToken.access_token) {
                alert("登录信息失效!");
                throw "No authorization data. Please Login first.";
            }
            ajaxSettings.beforeSend = function (xhr, settings) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.oauthToken.access_token);
            };
            if (!ajaxSettings.timeout) {
                ajaxSettings.timeout = self.timeout;
            }
            return $.ajax(ajaxSettings);
        };
        self.authorizedAjax = function (ajaxSettings) {
            return self.authorizedRawAjax(ajaxSettings).then(
                function (data) { return data.data; },
                function (data, x) {
                    if (x === "timeout") return { errcode: 408 };
                    else if (data.responseJSON && data.responseJSON.errcode) return data.responseJSON;
                    else return { errcode: data.status };
                });
        };
        self.authorizedLanguageServiceAjax = function (engineId, data, additionalOptions, ajaxSetting) {
            if (!ajaxSetting) {
                ajaxSetting = {};
            }
            ajaxSetting.method = "POST";
            ajaxSetting.url = self.utils.combineUrl(self.languageServiceUrl, engineId)
            if (additionalOptions) {
                ajaxSetting.url += "?" + self.utils.param(additionalOptions);
            }
            ajaxSetting.contentType = "application/json";

            var content = {
                v: serviceVersion,
                ts: (new Date()).toISOString()
            };
            if (data) {
                content.data = data;
            }
            ajaxSetting.data = JSON.stringify(content);
            return self.authorizedAjax(ajaxSetting);
        };
        self.authorizedImperativeServiceAjax = function (engineId, command, data, additionalOptions, ajaxSetting) {
            if (!additionalOptions) {
                additionalOptions = {};
            }
            additionalOptions[command] = null;
            return self.authorizedLanguageServiceAjax(engineId, data, additionalOptions, ajaxSetting);
        };

        self.authorizedWaitJob = function (engineId, commandStub, jobId) {
            return self.utils.delay(self.pingFreq)
                .then(function () {
                    return self.authorizedImperativeServiceAjax(engineId, commandStub + ".receive", { id: jobId });
                })
                .then(function (data) {
                    console.log('Job is done.');
                    return data;
                },
                function (data) {
                    if (data.errcode == JobErrorCodes.JOBNOTCOMPLETED) {
                        console.log('Job ongoing.');
                        return self.authorizedWaitJob(engineId, commandStub, jobId);
                    } else {
                        console.log('Job failed with errorcode. ' + data.errcode);
                        return data;
                    }
                });
        };

        self.authorizedJobServiceAjax = function (engineId, commandStub, data, additionalOptions, ajaxSetting) {
            return self.authorizedImperativeServiceAjax(
                engineId,
                commandStub + ".submit",
                data,
                additionalOptions,
                ajaxSetting)
                .then(function (data) {
                    return self.authorizedWaitJob(engineId, commandStub, data.id);
                })
                .then(function (data) {
                    return data.result; // unwrap result from job output.
                });
        }


        self.webLogIn = function (userName, password) {
            var headers = {};
            headers['__AntiXsrfToken'] = self.utils.readCookie('__AntiXsrfToken');
            return $.ajax({
                url: self.oauthApiUrl,
                type: "POST",
                timeout: self.timeout,
                headers: headers,
                contentType: "application/x-www-form-urlencoded",
                data: "grant_type=password&username=" +
                encodeURIComponent(userName) +
                "&password=" +
                encodeURIComponent(password),
                success: function (data) {
                    self.oauthToken = data;
                }
            });
        };

        self.scenario = {
            listSubLessons: function (partId, options) {
                return self.authorizedImperativeServiceAjax(
                    scenarioContentProviderId,
                    "list-scenario-lessons",
                    { lid: partId },
                    options);
            },
            getLesson: function (lessonId) {
                return self.authorizedImperativeServiceAjax(
                    scenarioContentProviderId,
                    "get-scenario-lesson",
                    { lid: lessonId });
            },
            rateChoice: function (lessonId, question, lang, answer, isPass) {
                return self.authorizedImperativeServiceAjax(
                    scenarioContentProviderId,
                    "rate-choice-quiz",
                    { question: question, lid: lessonId, answer: answer, passed: isPass, lang: lang });
            },
            updateLessonProgress: function (lessonId, progressDelta, lang) {
                return self.authorizedImperativeServiceAjax(
                    scenarioContentProviderId,
                    "update-scenario-lesson-progress",
                    { lid: lessonId, delta: progressDelta, lang: lang });
            },

            listPearsonSubLessons: function (partId, options) {
                return self.authorizedImperativeServiceAjax(
                    pearsonProviderId,
                    "list-pearson-scenario-lessons",
                    { lid: partId },
                    options);
            },
            rateChat: function (lessionId,
                text,
                lang,
                question,
                keywords,
                expectedAnswer,
                speech,
                speechMimeType,
                sampleRate,
                modelOptions) {
                return self.authorizedJobServiceAjax(
                    scenarioContentProviderId,
                    "rate-chat",
                    {
                        lid: lessionId,
                        text: text,
                        lang: lang,
                        question: question,
                        keywords: keywords,
                        expectedAnswer: expectedAnswer,
                        speech: speech,
                        speechMimeType: speechMimeType,
                        sampleRate: sampleRate
                    },
                    modelOptions);
            },
        };
        self.speaking = {
            listSubLessons: function (lesson, options) {
                return self.authorizedImperativeServiceAjax(
                    speakingContentProviderId,
                    "list-lessons",
                    { lid: lesson },
                    options);
            },
            listPearsonSubLessons: function (lesson, options) {
                return self.authorizedImperativeServiceAjax(
                   pearsonProviderId,
                   "list-pearson-lessons",
                   { lid: lesson },
                   options);
            },
            getLesson: function (lesson) {
                return self.authorizedImperativeServiceAjax(
                    speakingContentProviderId,
                    "get-lesson",
                    { lid: lesson });
            },
            rateSpeech: function (lessionId, text, lang, speech, mimeType, modelOptions, sampleRate, detectedTerms, refData) {
                return self.authorizedJobServiceAjax(
                    speakingContentProviderId,
                    "rate-speech",
                    {
                        text: text,
                        lid: lessionId,
                        data: speech,
                        mimeType: mimeType,
                        sampleRate: sampleRate,
                        lang: lang,
                        detectedTerms: detectedTerms,
                        refData: refData
                    },
                    modelOptions);
            },
            getAudio: function (text, lang, accent, mimeType, getAudioFromBingDict) {
                var additionalOptions = getAudioFromBingDict ? { "from-bing-dict": 1 } : {};
                return self.authorizedImperativeServiceAjax(
                    speakingContentProviderId,
                    "tts",
                    { text: text, lang: lang, outputOptions: { accent: accent, mimeType: mimeType } },
                    additionalOptions);
            },
            updateLessonProgress: function (lessonId, progressDelta, lang) {
                return self.authorizedImperativeServiceAjax(
                    speakingContentProviderId,
                    "update-lesson-progress",
                    { lid: lessonId, delta: progressDelta, lang: lang });
            },
        }

        self.user = {
            getStudent: function () {
                return self.authorizedImperativeServiceAjax(
                    pearsonProviderId,
                    "get-student");
            },
            getSignInSummary: function () {
                return self.authorizedImperativeServiceAjax(
                    pearsonProviderId,
                    "get-sign-in-summary",
                    {})
            },
            studentListCurrentInfo: function () {
                return self.authorizedImperativeServiceAjax(
                    pearsonProviderId,
                    "list-student-current-info");
            },
            signInDaily: function () {
                return self.authorizedImperativeServiceAjax(
                    pearsonProviderId,
                    "sign-in-daily",
                    {})
            },

        }


    }
    return mTutor;
}));