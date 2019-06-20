define([], function () {
    function Preloader(audioCtx) {
        this.audioCtx = audioCtx;
        this.loaded = {};
    }

    Preloader.prototype.load = function (url, callback) {
        callback = callback || function () { };
        if (url in this.loaded) {
            callback(this.loaded[url]);
            return;
        }
        var ext = /\.(\w*)(\?.*)?$/.exec(url);
        if (!ext) return;
        ext = ext[1];
        switch (ext) {
            case 'png':
            case 'jpg':
                this._loadImage(url, callback);
                break;
            case 'mp3':
                this._loadAudio(url, callback);
                break;
        }
    };

    Preloader.prototype._loadImage = function (url, callback) {
        var img = new Image();
        img.onload = function () {
            this.loaded[url] = img;
            callback();
        }.bind(this);
        img.src = url;
    };

    Preloader.prototype._loadAudio = function (url, callback) {
        if (!this.audioCtx) {
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            var arrayBuffer = xhr.response;
            this.audioCtx.decodeAudioData(arrayBuffer,
              function (audioBuffer) {
                  var audio = new LoadedAudio(this.audioCtx, arrayBuffer, audioBuffer);
                  this.loaded[url] = audio;
                  callback(audio);
              }.bind(this),
            function () {
                console.log('Error decoding audio data.');
            });
        }.bind(this);
        xhr.send();
    };

    function LoadedAudio(audioCtx, arrayBuffer, audioBuffer) {
        this.audioCtx = audioCtx;
        this.arrayBuffer = arrayBuffer;
        this.audioBuffer = audioBuffer;
    }

    LoadedAudio.prototype.play = function () {
        var source = this.audioCtx.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
    };

    return Preloader;
});