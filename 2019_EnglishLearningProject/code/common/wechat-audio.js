define([
    'wx'
],
    function (wx) {
        wx.config(weChatConfig);
        return new audio();

        function audio() {
            var self = this;
            var voice = {
                localId: '',
                serverId: ''
            };
            self.startRecord = function () {
                wx.startRecord({
                    cancel: function () {
                        alert("用户拒绝授权录音");
                    }
                });
            }
            self.stopRecord = function (doneCallback) {
                wx.stopRecord({
                    success: function (res) {
                        voice.localId = res.localId;
                        if (doneCallback) {
                            doneCallback(res.localId);
                        }
                    },
                    fail: function (res) {
                        alert(JSON.stringify(res));
                    }
                });
            }
            self.uploadVoice = function (uploadVoiceId, doneCallback) {
                if (uploadVoiceId == '') {
                    alert("请先录制声音");
                    return;
                }
                wx.uploadVoice({
                    localId: uploadVoiceId,
                    isShowProgressTips: 0,
                    success: function (res) {
                        voice.serverId = res.serverId;
                        if (doneCallback) {
                            doneCallback(res.serverId);
                        }
                    }
                });
            }
            self.downloadVoice = function (downloadServerId, doneCallback) {
                if (downloadServerId == '') {
                    alert("请先使用uploadVoice上传声音");
                    return;
                }
                wx.downloadVoice({
                    serverId: downloadServerId,
                    isShowProgressTips: 1,
                    success: function (res) {
                        voice.localId = res.localId;
                        if (doneCallback) {
                            doneCallback(res.localId);
                        }
                    }
                });
            }
            self.onVoiceRecordEnd = function () {
                wx.onVoiceRecordEnd({
                    complete: function (res) {
                        voice.localId = res.localId;
                    }
                });
            }
            self.playVoice = function (playVoiceId) {
                wx.playVoice({
                    localId: playVoiceId
                });
            }
            self.pauseVoice = function () {
                wx.pauseVoice({
                    localId: voice.localId
                });
            }
            self.stopVoice = function () {
                wx.stopVoice({
                    localId: voice.localId,
                });
            }
            self.onVoicePlayEnd = function () {
                wx.onVoicePlayEnd({
                    success: function (res) {
                        voice.localId = res.localId;
                    }
                });
            }
            self.shareTimeLine = function (title, linkUrl, imageUrl) {
                wx.ready(function () {
                    wx.onMenuShareTimeline({
                        title: title,
                        link: linkUrl,
                        imgUrl: imageUrl,
                        trigger: function (res) {
                            alert('用户点击分享到朋友圈');
                        },
                        success: function (res) {
                            alert('已分享');
                        },
                        cancel: function (res) {
                            alert('已取消');
                        },
                        fail: function (res) {
                            alert(JSON.stringify(res));
                        }
                    });
                });
            }
        }
    });